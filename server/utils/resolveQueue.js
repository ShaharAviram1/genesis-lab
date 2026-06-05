const User = require('../models/User');
const completeReaction = require('./completeReaction');
const resolveGenerators = require('./resolveGenerators');
const { getMaxSlots } = require('./../config/prestigeConfig');

// Stage 12 — Atomic double-completion guard.
//
// The race this closes:
//   Two concurrent requests both load the same user snapshot before either saves.
//   Both find the same 'processing' entry as due. Without a guard, both run
//   completeReaction and the last save overwrites the first → double inventory grant.
//
// How the claim works:
//   Before running any side effects, each due entry is claimed via findOneAndUpdate
//   with a $elemMatch filter requiring { status: 'processing' }. The DB update is atomic:
//   only one request can transition an entry from 'processing' to 'resolving'. The request
//   that receives a non-null result exclusively owns that entry and runs completeReaction.
//   Any concurrent request gets null back and skips the entry entirely.
//
// Recovery from stuck 'resolving' entries:
//   If the server crashes or the save fails after the claim but before the full user.save(),
//   the entry remains 'resolving' in the DB. On the next resolveQueue call, entries in
//   'resolving' status older than CLAIM_TIMEOUT_MS are atomically reset to 'processing'
//   and re-queued for completion. This is safe: completeReaction only adds to inventory
//   and runTotals — it never deducts — so re-running it on a recovered entry is correct.

const CLAIM_TIMEOUT_MS = 30 * 1000; // 30 seconds — generous for any save latency

async function resolveQueue(user) {
    const now = new Date();

    // ── Recovery pass ─────────────────────────────────────────────────────────
    // Find 'resolving' entries whose claimedAt has expired. These were claimed by
    // a request that crashed or failed to save. Reset them to 'processing' atomically
    // so this request can pick them up in the main pass below.
    const staleResolving = user.activeQueue.filter(e =>
        e.status === 'resolving' &&
        e.claimedAt &&
        (now.getTime() - new Date(e.claimedAt).getTime()) >= CLAIM_TIMEOUT_MS
    );

    for (const entry of staleResolving) {
        const recovered = await User.findOneAndUpdate(
            { _id: user._id, activeQueue: { $elemMatch: { _id: entry._id, status: 'resolving' } } },
            { $set: { 'activeQueue.$.status': 'processing', 'activeQueue.$.claimedAt': null } }
        );
        if (recovered) {
            // Sync in-memory state so the main pass below sees the restored entry.
            entry.status = 'processing';
            entry.claimedAt = null;
            console.log(`resolveQueue: recovered stale resolving entry '${entry.reactionKey}' for user '${user.username}'`);
        }
    }

    // ── Main resolution pass ───────────────────────────────────────────────────
    const dueEntries = user.activeQueue
        .filter(e => e.status === 'processing' && e.expectedCompletion <= now)
        .sort((a, b) => a.expectedCompletion - b.expectedCompletion);

    const results = [];

    for (const entry of dueEntries) {
        // In-process re-check: recovery above may have left some entries in a
        // non-processing state within this same call.
        if (entry.status !== 'processing') continue;

        // ── Atomic claim: processing → resolving ──────────────────────────────
        // $elemMatch ensures the status guard and _id target the same subdocument.
        // If another concurrent request already changed the status (to 'resolving',
        // 'completed', or 'failed'), the filter does not match and result is null.
        const claimed = await User.findOneAndUpdate(
            { _id: user._id, activeQueue: { $elemMatch: { _id: entry._id, status: 'processing' } } },
            { $set: { 'activeQueue.$.status': 'resolving', 'activeQueue.$.claimedAt': new Date() } }
        );

        if (!claimed) {
            // Another request holds the claim. Update in-memory to reflect DB state
            // so subsequent pruning and save logic treat this entry correctly.
            entry.status = 'resolving';
            continue;
        }

        // ── Side effects — exclusive to this request ───────────────────────────
        // completeReaction transitions entry.status to 'completed' (or 'failed') in
        // memory. The caller's user.save() then persists the full completed state,
        // overwriting the 'resolving' status in the DB with 'completed'.
        try {
            const result = await completeReaction(user, entry);
            results.push({ entry, ...result });
        } catch (err) {
            console.error(`resolveQueue: unexpected error completing '${entry.reactionKey}':`, err);
            const failNow = new Date();
            entry.status = 'failed';
            entry.completedAt = failNow;
            entry.pruneAfter = new Date(failNow.getTime() + 24 * 60 * 60 * 1000);
            results.push({
                entry,
                wasDiscovery: false,
                prevUnlockTier: user.unlockTier,
                newUnlockTier: user.unlockTier,
                newCapabilities: []
            });
        }
    }

    // ── Promotion pass ────────────────────────────────────────────────────────────
    // After completions free their slots, promote the oldest 'queued' entries into
    // those slots. Each promotion is claimed atomically so concurrent requests
    // cannot double-promote the same entry.
    const maxSlots = getMaxSlots(user);
    const occupiedSlotSet = new Set(
        user.activeQueue
            .filter(e => e.status === 'processing' || e.status === 'resolving')
            .map(e => e.slot)
    );
    const freeSlots = [];
    for (let i = 0; i < maxSlots; i++) {
        if (!occupiedSlotSet.has(i)) freeSlots.push(i);
    }

    const queuedEntries = user.activeQueue
        .filter(e => e.status === 'queued')
        .sort((a, b) => (a._id.toString() < b._id.toString() ? -1 : 1));

    const promotions = [];
    for (let i = 0; i < Math.min(freeSlots.length, queuedEntries.length); i++) {
        const slot = freeSlots[i];
        const entry = queuedEntries[i];
        const promoteNow = new Date();
        const effectiveTime = entry.snapshot?.effectiveReactionTime ?? 0;
        const expectedCompletion = new Date(promoteNow.getTime() + effectiveTime * 1000);

        const claimed = await User.findOneAndUpdate(
            { _id: user._id, activeQueue: { $elemMatch: { _id: entry._id, status: 'queued' } } },
            { $set: {
                'activeQueue.$.status':             'processing',
                'activeQueue.$.slot':               slot,
                'activeQueue.$.startTime':          promoteNow,
                'activeQueue.$.expectedCompletion': expectedCompletion
            }}
        );

        if (!claimed) {
            entry.status = 'processing';
            console.log(`resolveQueue: queued entry '${entry.reactionKey}' was claimed concurrently for user '${user.username}'`);
            continue;
        }

        entry.status             = 'processing';
        entry.slot               = slot;
        entry.startTime          = promoteNow;
        entry.expectedCompletion = expectedCompletion;
        promotions.push({ entry });
        console.log(`resolveQueue: promoted '${entry.reactionKey}' from queue → slot ${slot} for user '${user.username}'`);
    }

    return { completions: results, promotions };
}

// Removes non-processing/non-queued entries whose pruneAfter window has expired.
// 'resolving' and 'queued' entries are never pruned.
// Safe to call on every request.
function pruneCompletedEntries(user) {
    const now = new Date();
    const before = user.activeQueue.length;

    user.activeQueue = user.activeQueue.filter(entry => {
        if (entry.status === 'processing' || entry.status === 'resolving' || entry.status === 'queued') return true;
        if (!entry.pruneAfter) return true; // keep legacy entries missing pruneAfter
        return entry.pruneAfter > now;
    });

    const pruned = before - user.activeQueue.length;
    if (pruned > 0) {
        console.log(`pruneCompletedEntries: removed ${pruned} expired queue entries for user '${user.username}'`);
    }
}

// Per-username mutex around resolveAndPruneUserQueue.
//
// The race this closes:
//   Page load fires multiple HTTP requests + WS connect in parallel
//   (Promise.all([fetchUserData, fetchReactions, fetchAtoms]) + ws).
//   Each loads its own `user` snapshot, runs resolveQueue, then calls
//   user.save() which writes the FULL document. The atomic claim
//   (Stage 12 hardening) prevents double-completion, but two callers can
//   each complete a DIFFERENT due entry — and the second save overwrites
//   the first's activeQueue + inventory with its stale view, reverting the
//   first caller's completed entry back to 'resolving'.
//
// Fix: serialize all resolveAndPruneUserQueue calls per user. Each acquires
// the lock, reloads user from DB fresh inside the lock, runs the resolve,
// saves, releases. Subsequent callers see the freshly-saved DB state.
const userResolveLocks = new Map();
async function withUserResolveLock(username, fn) {
    while (userResolveLocks.has(username)) {
        try { await userResolveLocks.get(username); } catch { /* ignore */ }
    }
    let release;
    const lock = new Promise(r => { release = r; });
    userResolveLocks.set(username, lock);
    try {
        return await fn();
    } finally {
        userResolveLocks.delete(username);
        release();
    }
}

// Lazy require avoids the circular dep between resolveQueue and reactorRuntime
// at module-load time. By the time this is actually called, both modules are
// fully loaded and the exports are stable.
let _cachedIsUserConnected;
function isUserConnectedLazy(username) {
    if (!_cachedIsUserConnected) {
        _cachedIsUserConnected = require('./../realtime/reactorRuntime').isUserConnected;
    }
    return _cachedIsUserConnected(username);
}

// Resolves due entries, prunes expired ones, optionally buffers offline
// notifications, and saves — all atomically inside a per-user mutex.
//
// Returns { user, completions, promotions, userModified }:
//   - `user` is a freshly-loaded copy with all populates applied.
//     Callers MUST use this for any subsequent reads/writes to avoid
//     overwriting our in-lock save with a stale snapshot.
//   - `completions` mirrors the prior contract.
//   - `promotions` is the list of entries promoted from 'queued' → 'processing'.
//   - `userModified` is informational; the save has already happened.
//
// Options:
//   bufferIfOffline (default true) — if user is not WS-connected and there
//     are completions, addPendingNotifications is called before the save so
//     buffered events are delivered on the next WS connect.
async function resolveAndPruneUserQueue(originalUser, options = {}) {
    const { bufferIfOffline = true } = options;
    const username = originalUser.username;

    return withUserResolveLock(username, async () => {
        const user = await User.findById(originalUser._id)
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) {
            return { user: null, completions: [], userModified: false };
        }

        const { completions, promotions } = await resolveQueue(user);
        const beforeQueuePrune = user.activeQueue.length;
        pruneCompletedEntries(user);
        const queuePruned = beforeQueuePrune - user.activeQueue.length;
        const notificationsPruned = prunePendingNotifications(user);

        let pendingAdded = false;
        if (bufferIfOffline && completions.length > 0 && !isUserConnectedLazy(username)) {
            addPendingNotifications(user, completions);
            pendingAdded = true;
        }

        const generatorProduced = await resolveGenerators(user);
        const generatorsModified = generatorProduced.length > 0;

        const userModified = completions.length > 0 || promotions.length > 0 || queuePruned > 0 || notificationsPruned > 0 || pendingAdded || generatorsModified;
        if (userModified) {
            await user.save();
            // Re-populate inventory so newly added generator entries are fully
            // hydrated before the caller serialises the response.
            if (generatorsModified) {
                await user.populate('inventory.substance');
            }
        }

        return { user, completions, promotions, userModified };
    });
}

// Removes pendingNotifications entries whose deliveredAt is set and older than 48h.
// Undelivered notifications are preserved unconditionally (drain on next WS connect).
// Returns the number of entries removed.
const NOTIFICATION_RETENTION_MS = 48 * 60 * 60 * 1000;
function prunePendingNotifications(user) {
    if (!Array.isArray(user.pendingNotifications) || user.pendingNotifications.length === 0) return 0;
    const cutoff = Date.now() - NOTIFICATION_RETENTION_MS;
    const before = user.pendingNotifications.length;
    user.pendingNotifications = user.pendingNotifications.filter(n => {
        if (!n.deliveredAt) return true;                          // never prune undelivered
        return new Date(n.deliveredAt).getTime() > cutoff;        // keep if still inside the 48h window
    });
    const pruned = before - user.pendingNotifications.length;
    if (pruned > 0) {
        console.log(`prunePendingNotifications: removed ${pruned} delivered notification(s) older than 48h for user '${user.username}'`);
    }
    return pruned;
}

// Builds and pushes pending notification objects for completions that occurred while
// the user had no live WS session. Called only when isUserConnected() returns false.
// Payload shape mirrors emitQueueCompletions exactly so the frontend receives the same
// structure whether the event arrives live or via a pending notification drain.
// Caller is responsible for saving the user document after this returns.
//
// TODO: future cleanup — prune delivered notifications older than 48h alongside queue entry pruning.
// TODO: future cleanup — sweep undelivered notifications older than 48h (permanent delivery failure guard).
function addPendingNotifications(user, completions) {
    const now = new Date();
    for (const { entry, wasDiscovery, prevUnlockTier, newUnlockTier, newCapabilities } of completions) {
        if (entry.status === 'failed') {
            user.pendingNotifications.push({
                type:      'synthesis_failed',
                payload:   { reactionKey: entry.reactionKey, reason: 'Synthesis failed' },
                createdAt: now
            });
        } else {
            user.pendingNotifications.push({
                type: wasDiscovery ? 'synthesis_discovered' : 'synthesis_completed',
                payload: {
                    reactionKey:      entry.reactionKey,
                    productName:      entry.snapshot.productName,
                    productKey:       entry.snapshot.productKey,
                    quantity:         entry.snapshot.productQuantity,
                    wasDiscovery,
                    prevUnlockTier,
                    newUnlockTier,
                    newCapabilities:  newCapabilities || []
                },
                createdAt: now
            });
        }
    }
}

module.exports = { resolveQueue, pruneCompletedEntries, resolveAndPruneUserQueue, addPendingNotifications, prunePendingNotifications };
