# Genesis Lab — Persistent Synthesis Queue + Reaction Timing Enforcement
## Technical Implementation Plan — Revision 2 (2026-05-28)

---

## Current Implementation Status — Revision 3 (2026-05-29)

**All Stages 1–13 are complete.** The persistent synthesis queue is operational for Gen 1–3.

- Stages 1–11: queue lifecycle, snapshot-based completion, WS events, QueuePanel, Gen 1–3 timing, offline delivery.
- Stage 12: atomic double-completion hardening implemented (see updated Section 10).
- Stage 13: dev-only debug/admin tooling implemented (see updated Section 15).
- Multi-tab sync bug fixed: `reactorSessions` now tracks a `Set` of sockets per username; all open tabs receive queue lifecycle events.

The "MVP accepts race condition" language in earlier revisions is superseded. The atomic hardening is live and required no schema change beyond adding `resolving` to the status enum and `claimedAt` to queue entries.

**Next major phase:** Conditions System v1 (Phase F). Gen 4 seeding follows after conditions are enforced.

---

## Revision Notes (Revision 2)

This document supersedes Revision 1. Changes made on approved architectural review:

- All reactions now route through the queue lifecycle. No bypass for `reactionTime === 0`.
- Experiment flow fully respects `reactionTime`. No instant-experiment shortcut.
- Completed queue entries are retained for 24 hours, not deleted immediately. Pruning strategy added.
- Cancellation is explicitly out of scope. No rollback or refund logic.
- Gen 1–3 reaction timing philosophy added (first balance pass).
- Snapshot vs. live reference authority clarified per field.
- Routes that call `resolveQueue()` explicitly enumerated and centralized.
- Anti-double-completion safeguard strategy made explicit.
- Open questions from Revision 1 resolved or closed.

---

## 1. Goals and Non-Goals

### Goals
- Enforce `reactionTime` as a real, persistent server-side duration for all reactions.
- Route ALL syntheses through one canonical queue lifecycle — instant and timed differ only in `expectedCompletion` offset.
- Energy and reactants consumed at queue start, never at completion.
- Survive server restart: queued syntheses resolve correctly on next boot or reconnect.
- Handle offline completion: products credited when the user next connects or makes any request.
- Preserve the discovery reveal payoff: unknown reactions never reveal product until completion.
- Keep animations reactor-centric: intake at queue start, processing during synthesis, reveal at completion only.
- Remain extensible for multi-slot, automation, conditions, and 72-hour Gen 5–6 syntheses.

### Non-Goals (explicitly out of scope now)
- Queue cancellation or reactant refunds — not in MVP. Reactor commits are final.
- Gen 4–6 content seeding.
- Conditions system enforcement (designed for later).
- Queue slot unlock/upgrade UI (architecture supports it, UI deferred).
- Automation / auto-queue (architecture supports it, deferred).
- Progress streaming mid-synthesis (server never pushes partial %; client countdown only).
- Real-time progress bar over WebSocket.
- Per-reaction queue (one reaction one slot is enough for MVP).

---

## 2. Core Architecture Principle: One Lifecycle

Every synthesis — instant or timed — enters the same lifecycle:

```
queueReaction()
    │
    ▼
[Validate: slot, energy, reactants, unlockTier, isActive]
    │
    ▼
[Deduct energy + reactants]
    │
    ▼
[Write queue entry: status = 'processing']
    │
    ▼
[Save user]
    │
    ▼
[Emit: synthesis_queued → intake animation]
    │
    ▼
    ├── reactionTime === 0 ──► [resolveQueue immediately, in-process]
    │                              │
    │                              ▼
    │                         [completeReaction → emit synthesis_completed/discovered]
    │
    └── reactionTime > 0 ──► [entry persists; client shows countdown]
                                   │
                                   ▼ (when expectedCompletion <= now)
                              [resolveQueue called on next user load/WS connect]
                                   │
                                   ▼
                              [completeReaction → emit synthesis_completed/discovered]
```

**Why this matters long-term:** Automation, conditions, reactor capabilities, and prestige mechanics all need to hook into one canonical pipeline. A separate instant-reaction codepath would permanently bifurcate those hooks. The `reactionTime === 0` case is not a special case — it is a zero-duration synthesis that completes within the same request.

For `reactionTime === 0`: the queue entry is written, `completeReaction` is called immediately, the entry transitions to `status: 'completed'` within the same operation, and the HTTP response includes the completed state. From the client's perspective it feels instant. From the server's perspective it passed through every lifecycle stage.

---

## 3. Queue Lifecycle — Full State Machine

Queue entry statuses:

```
processing  →  completed
     └──────→  failed
```

- **processing**: reactants consumed, synthesis active. Never transitions back. No cancellation.
- **completed**: `completeReaction` ran successfully. Retained for 24h for reconnect animation replay and debugging.
- **failed**: resolution attempted but could not complete (missing substance, corrupted state). Retained for 24h.

There is no `pending` status. The entry exists only after validation passes and deduction commits — so the moment a queue entry is written, it is already `processing`.

There is no `cancelled` status.

---

## 4. Discovery + Queue Behavior

Experiments and known performs are unified. There is no special instant path for experiments.

**If an experiment matches an undiscovered reaction:**
- The queue entry is written with `revealOnCompletion: true`.
- The product is stored server-side in the snapshot but never sent to the client until completion.
- The unknown reaction card moves to "Synthesis in Progress — X seconds remaining." No product name. No reaction name.
- `runTotals` is not updated until completion, so `isReactionDiscovered()` correctly returns false during processing. The reaction remains visually unknown to all other panels.
- At completion, the server emits `synthesis_discovered`. This triggers the full discovery animation, product reveal, notebook entry, and unlock animation if a tier changes.
- The notebook entry is written only at completion.
- The unknown reaction card disappears from the unknown list only after `runTotals` gains the product entry at completion.

**If an experiment matches a known reaction:**
- Same flow, `revealOnCompletion: false`.
- The product name can be shown in the queue display during processing.

**If an experiment finds no matching reaction at the current tier:**
- Energy is still consumed (experiment cost). No queue entry is written. Failure response returned immediately.
- This path is the only one that still operates outside the queue lifecycle, because there is nothing to synthesize.

---

## 5. Data Model

### Current gaps in `activeQueue` schema

Present: `reaction`, `startTime`, `expectedCompletion`, `status`, `reactantsConsumed`.
Missing: `reactionKey`, `slot`, `revealOnCompletion`, `wasDiscovery`, `completedAt`, `snapshot`, `pruneAfter`.

### Proposed queue entry shape

```
activeQueue: [{

  // Identity
  reaction:             ObjectId (ref Reaction) — used for resolution; may be null if stale
  reactionKey:          String   — snapshot; stable key for lookup if ObjectId resolves stale
  slot:                 Number   — 0-indexed; reserved for multi-slot future

  // Timing
  startTime:            Date     — when deduction and queue write committed
  expectedCompletion:   Date     — startTime + reactionTime (ms); 0-duration = startTime
  completedAt:          Date     — set at resolution; null while processing
  pruneAfter:           Date     — completedAt + 24h; used by cleanup job

  // Status
  status:               enum ['processing', 'completed', 'failed']
  reactantsConsumed:    Boolean  — always true after write; guard for double-deduct recovery scan

  // Discovery
  revealOnCompletion:   Boolean  — true if product was undiscovered at queue start
  wasDiscovery:         Boolean  — false until completion; set by completeReaction

  // Resilience snapshot — written at queue start, never mutated
  snapshot: {
    reactionName:       String
    energyCost:         Number
    productKey:         String
    productName:        String
    productQuantity:    Number
    productUnlocksUserTier: Number | null
    reactants: [{
      substanceKey:     String
      name:             String
      quantity:         Number
    }]
  }

}]
```

### Snapshot authority vs. live reference — field-by-field

The snapshot is the **source of truth for what the player is owed**. The live reaction reference is used for **system linkage** only.

| Field | Source of truth | Reason |
|---|---|---|
| Product added to inventory | `snapshot.productKey` → lookup Substance by key | Immune to reaction content edits |
| Product quantity | `snapshot.productQuantity` | Immune to balance changes |
| runTotals substance ref | Substance found via `snapshot.productKey` | Same as above |
| unlockTier advancement | `snapshot.productUnlocksUserTier` | Player committed to this synthesis at this tier value |
| reactionLog display names | `snapshot.reactionName`, `snapshot.reactants[].name`, `snapshot.productName` | Readable even if reaction deleted |
| Animation type | `revealOnCompletion` (from snapshot context) | Determined at queue start |
| Live reaction ref | Used to verify `isActive` at resolution | If missing/disabled, complete anyway (see edge cases) |

**On reaction disabled or deleted:** complete using the snapshot anyway. The player committed real resources. Silently failing would be a bug from the player's perspective. Log a warning server-side.

---

## 6. Cancellation Policy

**There is no cancellation.**

Once a synthesis enters `processing` status:
- Reactants are gone.
- Energy is gone.
- The reactor has committed.

This is intentional:
- Eliminates rollback complexity.
- Eliminates inventory corruption risk from partial refunds.
- Eliminates exploit surface (queue-cancel-queue to probe reaction existence).
- Creates authentic reactor commitment tension.

A future "reactor abort" mechanic — with meaningful cost/penalty — may be designed later. It is not part of this system.

---

## 7. Reaction Timing — First Balance Pass (Gen 1–3)

All Gen 1–3 reactions currently have `reactionTime: 0`. This makes the queue system untestable and removes all reactor occupancy tension. The following timing philosophy applies before implementation begins.

### Philosophy
- Gen 1 reactions should feel nearly instant — they build the base vocabulary quickly.
- Gen 2 reactions should create a noticeable "reactor is busy" feeling without being frustrating at early tier.
- Gen 3 reactions should feel like meaningful commitments — not trivial but not yet multi-hour.
- Timings must allow offline completion testing within a development session (nothing longer than 3 minutes for MVP validation).

### Proposed Gen 1–3 timing ranges

| Generation | Range | Character |
|---|---|---|
| Gen 1 | 0–3 seconds | Nearly instant; validates queue lifecycle without friction |
| Gen 2 | 5–30 seconds | Short processing; reactor feels occupied |
| Gen 3 | 30–180 seconds | Meaningful synthesis; planning starts to matter |

### Specific reaction proposals (to be confirmed before seed update)

These are starting points, not final values. Balance will shift.

**Gen 1:**
- `gen1_hydrogen_gas`, `gen1_oxygen_gas`, `gen1_nitrogen_gas` — 0s (discoveredByDefault, instant)
- `gen1_water` — 0s (first discovery gate, keep approachable)
- `gen1_salt` — 0s (discoveredByDefault)
- `gen1_carbon_dioxide` — 2s
- `gen1_methane` — 2s
- `gen1_ammonia` — 3s
- `gen1_iron_oxide` — 3s

**Gen 2:**
- `gen2_copper`, `gen2_tin` — 8s
- `gen2_bronze` — 12s
- `gen2_sulfuric_acid` — 15s
- `gen2_nitric_acid` — 15s
- `gen2_calcium` — 10s
- `gen2_quicklime` — 10s
- `gen2_silicon` — 20s
- `gen2_quartz` — 15s
- `gen2_soda_ash` — 8s
- `gen2_nickel` — 20s
- `gen2_gold` — 25s
- `gen2_lithium` — 30s

**Gen 3:**
- `gen3_steel` — 45s
- `gen3_chrome` — 45s
- `gen3_glass` — 60s
- `gen3_stainless_steel` — 90s
- `gen3_graphene` — 90s
- `gen3_aramid_fiber` — 90s
- `gen3_carbon_nanotube` — 120s
- `gen3_doped_silicon` — 90s
- `gen3_lithium_ion_cell` — 180s

These timings are sufficient to validate persistence, reconnect, queue UX, animation timing, and offline completion without making development iteration painful.

---

## 8. Backend Flow

### 8a. Queue Start — `POST /api/reactions/queue/:reactionKey`

This is the **single entry point for all syntheses** — both from the Perform panel (known reactions) and from the Experiment panel (unknown + known reactions). The distinction between "perform" and "experiment" becomes a `source` field on the queue entry for logging purposes, not a different code path.

Steps:
1. Flush pending WebSocket energy for the user.
2. Load user (populate inventory, runTotals, activeQueue).
3. Load reaction (populate reactants.substance, product.substance).
4. Validate `reaction.unlockTier <= user.unlockTier`.
5. Validate `reaction.isActive`.
6. Validate discovery for known-reaction performs: if the route is called as a direct perform (not experiment), verify the reaction is discovered. Experiment route handles its own discovery matching before calling into this flow.
7. **Slot check**: count `activeQueue` entries with `status === 'processing'`. If >= maxSlots (1 for MVP), reject with `{ error: "Reactor is occupied" }`.
8. Validate energy: `user.energy >= reaction.energyCost` (after WS flush).
9. Validate reactants: `hasRequiredReactants(user, reaction.reactants)`.
10. Deduct energy and reactants in memory.
11. Build queue entry: `status: 'processing'`, `reactantsConsumed: true`, `startTime: now`, `expectedCompletion: now + reaction.reactionTime * 1000`, `revealOnCompletion: !isReactionDiscovered(user, reaction)`, full snapshot block.
12. Push entry to `user.activeQueue`.
13. Save user (deduction + queue entry commit atomically).
14. If `reactionTime === 0`: call `resolveQueue(user)` immediately, save again, return completed state.
15. Emit `synthesis_queued` WS event to user's live session.
16. Return sanitized queue state. If `revealOnCompletion: true`, strip `snapshot.productKey`, `snapshot.productName`, `snapshot.productQuantity`, `snapshot.productUnlocksUserTier` from the response payload.

### 8b. Shared Completion Helper — `completeReaction(user, entry)`

Single completion path used by both zero-duration and timed completions. Accepts a queue entry (always present — both paths create one).

Steps:
1. Resolve product Substance by `entry.snapshot.productKey`. If not found, mark entry failed and return.
2. Add `snapshot.productQuantity` to user inventory.
3. Check `runTotals` for prior production of this substance — determine `wasDiscovery`.
4. Update `runTotals` (push new or increment existing).
5. If `wasDiscovery` and `snapshot.productUnlocksUserTier > user.unlockTier`: advance `user.unlockTier`.
6. Write `reactionLog` entry using snapshot fields for display names.
7. Set `entry.wasDiscovery = wasDiscovery`, `entry.status = 'completed'`, `entry.completedAt = now`, `entry.pruneAfter = now + 24h`.
8. Return `{ wasDiscovery, prevUnlockTier, newUnlockTier: user.unlockTier }`.

### 8c. Queue Resolver — `resolveQueue(user)`

A pure function: takes a loaded user, processes all due entries, returns completion results for WS emission. Does not save — the caller saves.

Steps:
1. Filter `user.activeQueue` for entries where `status === 'processing'` and `expectedCompletion <= now`.
2. Sort ascending by `expectedCompletion` (oldest due first).
3. For each due entry:
   a. Call `completeReaction(user, entry)`.
   b. Collect result.
4. Return array of `{ entry, wasDiscovery, prevUnlockTier, newUnlockTier }` for each resolved entry.

`resolveQueue` does not emit WebSocket events directly. The caller emits after the save.

### 8d. Queue Pruning — `pruneCompletedEntries(user)`

Called alongside `resolveQueue` on any user load. Removes entries where `status !== 'processing'` and `pruneAfter <= now`. This keeps `activeQueue` from growing unboundedly. Does not touch processing entries.

---

## 9. Routes That Call `resolveQueue()`

These are the canonical resolution trigger points. Centralize the call pattern here to avoid inconsistent behavior.

**Rule**: any route that loads the user and returns user state must call `resolveQueue(user)` before acting. If any entries were resolved, save before returning.

| Route | Trigger reason |
|---|---|
| `GET /api/users/:username` | Primary state fetch |
| `GET /api/reactions/available` | Reactions panel loads; resolved entries may reveal new reactions |
| `POST /api/reactions/queue/:reactionKey` | Before slot check; resolve any due entries first to free slots |
| `POST /api/reactions/experiment` | Before experiment validation; inventory may have updated |
| `POST /api/perform/:reactionKey` | Before eligibility check |
| `POST /api/atoms/synthesize` | Before validation; energy may have updated |
| WebSocket `connection` event | User reconnects; drain completions, emit events |

**Not called on:**
- `GET /api/substances` — no user state involved.
- `POST /api/auth/*` — user object not fully loaded in auth flow; resolution happens on first state fetch after login.
- Admin/seed routes.

---

## 10. Anti-Double-Completion Safeguards

This is the most critical correctness concern. The same queue entry must never complete twice.

### Implemented: atomic MongoDB claim (Stage 12)

`resolveQueue` uses a three-status lifecycle for each due entry: `processing → resolving → completed/failed`.

Before running any side effects, each due entry is claimed via:
```js
User.findOneAndUpdate(
  { _id: user._id, activeQueue: { $elemMatch: { _id: entry._id, status: 'processing' } } },
  { $set: { 'activeQueue.$.status': 'resolving', 'activeQueue.$.claimedAt': new Date() } }
)
```

This update is atomic at the MongoDB level. Only one concurrent request can transition a given entry from `processing` to `resolving`. The request that receives a non-null result exclusively owns that entry and runs `completeReaction`. Any concurrent request receives null and skips the entry. `$elemMatch` is required (not just `'activeQueue.$.status': 'processing'`) to ensure both conditions target the same subdocument.

### Stale resolving recovery

If the server crashes or the save fails after the claim but before the full `user.save()`, the entry remains `resolving` in the DB indefinitely. On the next `resolveQueue` call, entries in `resolving` status older than 30 seconds are atomically reset to `processing` and re-queued for completion in the same pass. This is safe: `completeReaction` only adds to inventory and runTotals — it never deducts — so re-running it on a recovered entry is correct.

### Multi-tab WebSocket broadcast

The original single-socket `session.ws` design caused Tab B to evict Tab A's socket reference on connect. The session now tracks `session.sockets: Set<WebSocket>`. `emitToUser` serializes the event message once and sends it to all open sockets in the set. One closed or failed socket cannot break delivery to others. `isUserConnected` returns true if any socket is `OPEN`. Session deletion occurs only when the last socket closes.

### WebSocket event deduplication

WS events are emitted only after the save confirms. The atomic claim ensures only one request per entry reaches the emit call.

### Server restart during completion

If the server restarts during the `completeReaction` call after the claim but before save: the entry remains `resolving` in the DB. On next `resolveQueue` call, the stale-resolving recovery pass resets it to `processing` after 30 seconds. `completeReaction` runs again — safe because it only adds, never deducts. `reactantsConsumed: true` independently prevents re-deduction if that path were ever reached.

---

## 11. Animation and Event Flow

### WebSocket events

| Event | Direction | When | Payload |
|---|---|---|---|
| `synthesis_queued` | S→C | Queue entry written | `{ reactionKey, slot, expectedCompletion, revealOnCompletion, reactionName? }` |
| `synthesis_completed` | S→C | Resolved, known reaction | `{ reactionKey, productName, quantity, wasDiscovery: false, prevUnlockTier, newUnlockTier }` |
| `synthesis_discovered` | S→C | Resolved, was undiscovered | `{ reactionKey, productName, quantity, wasDiscovery: true, prevUnlockTier, newUnlockTier }` |
| `synthesis_failed` | S→C | Entry failed at resolution | `{ reactionKey, reason }` |
| `queue_state` | S→C | On WS connect (after resolveQueue + save) | Full sanitized queue array for UI rehydration |

**No `synthesis_progress`.** The client computes countdown from `expectedCompletion`. No server traffic for mid-synthesis progress.

### Animation phases — strictly separated

**At queue start** (`synthesis_queued` received):
- Intake animation: motes pull toward core (short version of existing draw phase).
- Core color shifts to processing state (muted violet-blue).
- Brief queue-accepted pulse.
- Toast: "Synthesis accepted — completing in X seconds."
- Queue display shows new entry with countdown.
- **No burst. No product reveal. No success flash.**

**During active synthesis** (client-side state, no server events):
- Core slow processing pulse — distinct from idle, less dramatic than reaction burst.
- Rings slightly steadier/slower than idle drift.
- Subtle emissive intensity cycle sufficient — no heavy per-frame computation.
- Queue display shows live countdown.

**At completion** (`synthesis_completed` or `synthesis_discovered` received):
- Full existing burst animation — this is the reveal moment, same as current instant flow.
- `synthesis_discovered`: full discovery sequence, product name revealed, notebook entry, unlock animation if `newUnlockTier` changed.
- `synthesis_completed`: success burst, product toast, notebook entry.
- Core returns to idle (or stays processing if another entry still pending).
- **Key invariant**: the full burst/discovery animation fires ONLY on completion. Never at queue start.

---

## 12. Offline and Restart Recovery

### Server restart during active queue

Queue entries persist in MongoDB. `reactorSessions` in memory are lost (already handled for energy). On restart, all pending queue entries remain in `user.activeQueue`. On next user activity, `resolveQueue` catches up all due entries. No data is lost.

### Offline completion

If `expectedCompletion` passes while the user is offline:
- Entry stays `status: 'processing'` in DB.
- On next HTTP request by the user, `resolveQueue` runs before the request's main logic. Entry resolves; product credited, runTotals updated, unlockTier updated, reactionLog written.
- If a WS session is active at resolution time: emit completion events immediately.
- If no WS session (pure HTTP resolution): emit nothing in real time. Completion events are queued in `user.pendingNotifications` (see below).
- HTTP response includes updated user state (inventory, energy, unlockTier). Client refreshes from response.

### Pending notifications for offline discovery animations

Without this, a discovery that occurs during offline resolution will credit the product but the discovery animation never plays on reconnect.

`pendingNotifications: [{ type, payload, createdAt, deliveredAt }]` is added to the User schema. On `resolveQueue` completion, if no live WS session exists for the user (`isUserConnected()` returns false), completion event payloads are pushed to `pendingNotifications`. If a WS session is active at resolution time, events are emitted live and no pending notification is created — never both for the same completion (anti-duplication rule).

On WS connect (in `reactorRuntime`), after resolving fresh queue completions, the handler drains stored pending notifications: filters for `!deliveredAt`, emits each via `emitToUser`, sets `deliveredAt = now`, and saves. This guarantees the discovery animation plays even if the user reconnects hours after completion.

**Delivered notifications are retained, not deleted.** The `deliveredAt` field is the delivery audit trail. Entries with `deliveredAt` set are never re-emitted on subsequent reconnects — the filter `!deliveredAt` ensures this. Cleanup of delivered notifications is currently manual via dev tooling (`DELETE /api/dev/users/:username/pending-notifications/delivered`). Automated pruning of delivered notifications (e.g., entries older than 48h where `deliveredAt` is set) is deferred; TODO comments are in place in the code.

### Tier unlock while offline

`user.unlockTier` is updated inside `completeReaction` and persisted in the same save. On next load, `fetchAvailableReactions` and `fetchBaseElements` use the updated tier — unlocked content appears immediately. The unlock animation is triggered by the `newUnlockTier` field in the WS event or `pendingNotifications` drain, not by comparing tier before and after load.

---

## 13. Queue Entry Retention and Pruning

Completed and failed entries are retained for 24 hours (via `pruneAfter` field) for:
- Reconnect animation replay via `pendingNotifications` drain.
- Client-side synthesis history display (future reactor history panel).
- Debugging.
- Analytics groundwork.

`pruneCompletedEntries(user)` runs alongside every `resolveQueue` call. It filters `activeQueue` to remove entries where `status !== 'processing'` and `pruneAfter <= now`. Only processing entries are permanent; everything else is time-boxed.

Queue history does not grow forever. The 24-hour window is sufficient for all reconnect scenarios; after that, the data is available in `reactionLog` in display form only.

---

## 14. Edge Cases and Risk Analysis

### Duplicate completion
See Section 10 above. MVP relies on status-check-before-completion + in-process sequencing. Hardened approach uses atomic MongoDB subdocument update with status filter guard. Required before Gen 4+ timings.

### Queue entry referencing a changed/deleted reaction
Snapshot is authoritative for reward. Resolution uses `snapshot.productKey` to find the Substance by key. If the substance itself is deleted (rare, would require manual DB action), mark the entry failed and write a failure log entry.

### Reaction disabled (`isActive: false`) while queued
Complete anyway using the snapshot. Player committed resources. Log a server warning.

### Reactants consumed but queue save fails
Deduction and queue entry push are on the same in-memory user object, committed in one `user.save()`. If the save fails, no DB mutation occurs. The HTTP response returns 500. User sees an error; inventory is unchanged.

### No cancellation means no inventory corruption
Cancellation rollback is the primary source of inventory bugs in queue systems. By having no cancellation, this entire class of bugs is eliminated.

### Slot spam / double-submit
Slot check rejects if any `processing` entry exists (MVP: 1 slot). Queue button disabled client-side during submission. Server is authoritative guard.

### Zero-duration synthesis performance
`reactionTime === 0` completes within the same request. The queue entry write + immediate resolve + save costs one extra Mongoose save call compared to the old direct perform path. This is acceptable — correctness over micro-optimization. If this becomes a bottleneck for automation at scale, optimize then.

### Discovery reveal timing
`synthesis_discovered` event includes `reactionKey`. Client uses this to inline-update the reaction list (mark as discovered) without waiting for a full re-fetch. The unknown card vanishes and the discovered card appears.

### Animations firing at wrong phase
Strict: `synthesis_queued` → intake only. `synthesis_completed` / `synthesis_discovered` → burst/reveal only. Enforced by event type. No single event with a `phase` field. No ambiguity.

---

## 15. Staged Implementation Plan

Stages are ordered to minimize risk and build on each other. Each stage is independently testable.

### Stage 1 — Schema extension ✅ COMPLETE
Updated `activeQueue` entry in User schema: `reactionKey`, `slot`, `revealOnCompletion`, `wasDiscovery`, `completedAt`, `pruneAfter`, `snapshot`. Status enum changed to `['processing', 'completed', 'failed']`. `pendingNotifications` array added.

### Stage 2 — Extract `completeReaction` helper ✅ COMPLETE
`server/utils/completeReaction.js` extracted. Reads exclusively from the entry snapshot. Thin adapter wires the legacy `/perform` route through the same helper.

### Stage 3 — Implement `resolveQueue` and `pruneCompletedEntries` ✅ COMPLETE
`server/utils/resolveQueue.js` implements `resolveQueue`, `pruneCompletedEntries`, and `resolveAndPruneUserQueue`. Pure function — mutates user in memory, caller saves.

### Stage 4 — Centralize `resolveQueue` calls on all relevant routes ✅ COMPLETE
`resolveAndPruneUserQueue` wired into all routes listed in Section 9.

### Stage 5 — Update Gen 1–3 reaction seeds with timing values ✅ COMPLETE
Gen 1–3 `reactionTime` values applied per Section 7.

### Stage 6 — Implement queue start route ✅ COMPLETE
`POST /api/reactions/queue/:reactionKey`. Validates, deducts, writes entry, handles zero-duration in-process, emits `synthesis_queued`.

### Stage 7 — Wire experiment route into queue start ✅ COMPLETE
`POST /api/reactions/experiment` routes through `startQueueSynthesis` after matching a reaction.

### Stage 8 — Wire WebSocket queue events ✅ COMPLETE
`synthesis_queued`, `synthesis_completed`, `synthesis_discovered`, `synthesis_failed`, `queue_state` wired in `reactorRuntime.js`. `queue_state` emitted on WS connect.

### Stage 9 — Frontend queue display ✅ COMPLETE
`QueuePanel` component with countdown timers, unknown synthesis label, reactor occupied state.

### Stage 10 — Wire intake and completion animations ✅ COMPLETE
`synthesis_queued` → intake animation. `synthesis_completed` / `synthesis_discovered` → burst/discovery animation. Processing visual state while queue non-empty. Auto-finalization via client-side ping when countdown reaches zero.

### Stage 11 — Offline reconnect / pendingNotifications ✅ COMPLETE
HTTP routes create `pendingNotifications` when user has no live WS session at resolution time. WS connect drains undelivered notifications, emits each, sets `deliveredAt`, saves. Exact-once delivery; no replay.

### Stage 12 — Atomic double-completion hardening ✅ COMPLETE
`resolveQueue` uses MongoDB `findOneAndUpdate` + `$elemMatch` to claim each due entry atomically (`processing → resolving`). Only the claimer runs `completeReaction`. Stale resolving recovery (30s timeout) re-queues entries after crashes. Status enum extended to `['processing', 'resolving', 'completed', 'failed']`; `claimedAt` field added. Multi-tab WS sync bug fixed: `reactorSessions` now uses `Set<WebSocket>` per username; all open tabs receive events.

### Stage 13 — Debug tooling ✅ COMPLETE
`server/routes/dev.js` with three endpoints: queue inspect, `expectedCompletion` fast-forward, delivered notification cleanup. Mounted only when `NODE_ENV !== 'production'` AND `DEV_ADMIN_ENABLED=true`. Fast-forward sets `expectedCompletion = now - 1s` and lets the real lifecycle handle completion — does not call `completeReaction` directly.

---

## 16. Open Questions (All Resolved — Stages 1–13 Complete)

All questions from Revisions 1 and 2 have been resolved:

1. ~~Instant reactions through queue or separate path?~~ **Resolved: all reactions through queue. Zero-duration completes immediately within the same request.**
2. ~~Experiment flow respect timing?~~ **Resolved: yes, fully. Experiment routes into the queue start path after matching.**
3. ~~Max slots for MVP?~~ **Resolved: 1 slot.**
4. ~~Completed entries removed immediately?~~ **Resolved: retained 24 hours, pruned via `pruneAfter` field.**
5. ~~Periodic server sweep in scope?~~ **Resolved: deferred. HTTP/WS resolution is sufficient for Gen 1–3.**
6. ~~Actual `reactionTime` values?~~ **Resolved: see Section 7 timing philosophy and proposed values.**
7. ~~Queue button location?~~ **Resolved: same button in SelectedReactionPanel, label changes based on `reactionTime`.**
8. ~~Unknown queued card show countdown?~~ **Resolved: yes — "Unknown Synthesis — completing in 2:34", no product name.**
9. ~~`pendingNotifications` in scope?~~ **Resolved: yes, Stage 11. Exact-once delivery, `deliveredAt` audit trail.**
10. ~~Energy cost unified or split?~~ **Resolved: `energyCost` is the queue submission cost. No separate field.**
11. ~~Timing values confirmation?~~ **Resolved: Gen 1–3 timing values from Section 7 are applied and seeded.**
12. ~~MVP race condition accepted?~~ **Resolved: no. Atomic hardening is implemented (Stage 12). See Section 10.**

## Remaining Work

All Stages 1–13 are complete. Open items are deferred or future scope:

- **Conditions System v1 (Phase F)** — next major implementation phase. `reaction.conditions` validated against `user.reactorCapabilities` at queue start.
- **Gen 4 content seeding (Phase B2)** — blocked on Phase F conditions enforcement.
- **Automated pruning of delivered `pendingNotifications`** — deferred. TODO comments are in place. Dev tooling (`DELETE /api/dev/.../pending-notifications/delivered`) handles manual cleanup in the interim.
- **Multi-slot queue UI** — architecture supports multiple slots; single-slot UI is MVP. Deferred.
- **Long-duration Gen 5/6 stress testing (Phase I)** — deferred until conditions and Gen 4 are in place.
- **Conditions-aware debug tooling** — Phase G has broader scope than Stage 13 (inventory grant, tier set, reactor capability grant/revoke, offline simulation). Stage 13 covers the subset needed for Gen 1–3 queue testing. Remaining Phase G tooling is deferred until Phase F conditions work begins.
