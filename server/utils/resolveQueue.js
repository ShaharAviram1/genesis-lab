const completeReaction = require('./completeReaction');

// Resolves all due queue entries on the user document.
// "Due" = status === 'processing' AND expectedCompletion <= now.
//
// Pure-ish: mutates user in memory only.
// Does NOT save the user. Does NOT emit WebSocket events.
// Caller is responsible for saving and emitting after this returns.
//
// Anti-double-completion (MVP):
// Entries are filtered by status === 'processing' before iteration. completeReaction
// immediately transitions each entry to 'completed', so a second caller working on
// the same in-memory user object will find nothing due on re-entry.
// Stage 12 will replace this in-process guard with an atomic MongoDB subdocument
// update to protect against concurrent requests loading separate user snapshots.
//
// Returns: Array of { entry, wasDiscovery, prevUnlockTier, newUnlockTier }
//          One element per resolved entry, in oldest-first order.
//          Includes both successful and failed completions.
async function resolveQueue(user) {
    const now = new Date();

    // Stage 12 replacement point: swap this filter+sort for an atomic per-entry
    // findOneAndUpdate({ status: 'processing', expectedCompletion: { $lte: now } })
    // to prevent double-completion across concurrent requests with separate DB snapshots.
    const dueEntries = user.activeQueue
        .filter(entry => entry.status === 'processing' && entry.expectedCompletion <= now)
        .sort((a, b) => a.expectedCompletion - b.expectedCompletion);

    const results = [];

    for (const entry of dueEntries) {
        // In-process re-check: a prior iteration in this loop may have already
        // transitioned this entry if the user object is shared across concurrent callers.
        if (entry.status !== 'processing') continue;

        try {
            const result = await completeReaction(user, entry);
            results.push({ entry, ...result });
        } catch (err) {
            // An unexpected error (e.g. DB connectivity) must not prevent other
            // due entries from completing. Mark this entry failed and continue.
            console.error(`resolveQueue: unexpected error completing '${entry.reactionKey}':`, err);
            const failNow = new Date();
            entry.status = 'failed';
            entry.completedAt = failNow;
            entry.pruneAfter = new Date(failNow.getTime() + 24 * 60 * 60 * 1000);
            results.push({
                entry,
                wasDiscovery: false,
                prevUnlockTier: user.unlockTier,
                newUnlockTier: user.unlockTier
            });
        }
    }

    return results;
}

// Removes non-processing entries whose pruneAfter window has expired.
// Safe to call on every request — never touches 'processing' entries.
// Entries with null/undefined pruneAfter are kept (defensive: they may be legacy
// entries written before pruneAfter existed).
function pruneCompletedEntries(user) {
    const now = new Date();
    const before = user.activeQueue.length;

    user.activeQueue = user.activeQueue.filter(entry => {
        if (entry.status === 'processing') return true;
        if (!entry.pruneAfter) return true; // keep entries missing pruneAfter (legacy safety)
        return entry.pruneAfter > now;
    });

    const pruned = before - user.activeQueue.length;
    if (pruned > 0) {
        console.log(`pruneCompletedEntries: removed ${pruned} expired queue entries for user '${user.username}'`);
    }
}

// Convenience wrapper: resolves due entries then prunes expired ones in a single call.
// Returns { completions, userModified }.
// Does NOT save — caller saves if userModified is true.
async function resolveAndPruneUserQueue(user) {
    const completions = await resolveQueue(user);
    const beforePrune = user.activeQueue.length;
    pruneCompletedEntries(user);
    const pruned = beforePrune - user.activeQueue.length;
    return { completions, userModified: completions.length > 0 || pruned > 0 };
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
    for (const { entry, wasDiscovery, prevUnlockTier, newUnlockTier } of completions) {
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
                    reactionKey:    entry.reactionKey,
                    productName:    entry.snapshot.productName,
                    productKey:     entry.snapshot.productKey,
                    quantity:       entry.snapshot.productQuantity,
                    wasDiscovery,
                    prevUnlockTier,
                    newUnlockTier
                },
                createdAt: now
            });
        }
    }
}

module.exports = { resolveQueue, pruneCompletedEntries, resolveAndPruneUserQueue, addPendingNotifications };
