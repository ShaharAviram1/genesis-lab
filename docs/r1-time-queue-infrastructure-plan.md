# R1 — Time & Queue Infrastructure — Implementation Plan

**Phase:** R1 (first sub-phase of Phase R per `phase-r-architecture-review.md`)
**Status:** Design only. No code changes in this document.
**Date:** 2026-06-01
**Depends on:** Q-D complete, Q-F implemented (formula + 22 shardValues), Phase R Option C approved.
**Blocks:** R2 (Atom Automation — current 5-blueprint branch), Gen 5 design.

This document specifies the design for R1. It is implementation-ready: blueprint catalogue is concrete, shard costs are numerical, schema impact is identified per change, and ship order is sequenced.

---

## 1. Goals

1. **Break the Gen 4 wall.** A player who has bought R1's first-tier blueprint must immediately feel that the next run is materially faster.
2. **Reuse the existing prestige framework.** No new shard type, no new persistence pattern, no new UI surface. Live inside `PrestigeBranchPanel`, `prestigeConfig.js`, `user.blueprints[]`, and the Big Bang reset path.
3. **Provide a 10-15 Big Bang progression curve.** R1 should not be fully purchasable in 2 runs. It should also not require 50 runs.
4. **Stay extensible.** Gen 5/6 will introduce 24-72 hour reactions. R1's mechanics must scale into that regime without redesign.
5. **No schema redesign.** The existing `user.blueprints[{ blueprintKey, level, purchasedAt }]` shape already supports leveled upgrades. R1 uses this as-is.

## 2. Non-goals (explicit)

- **No new atom-production engine.** That is R2.
- **No new currency.** Genesis Shards remain the only prestige currency.
- **No Phase F (conditions) integration changes.** R1 blueprints do not gate or modify reactor capabilities.
- **No frontend redesign.** `PrestigeBranchPanel` gets new entries and a sectioned layout; no architectural rewrite.
- **No queue-cancellation mechanic.** Reactions remain commit-final per queue plan §6.
- **No new prestige branches.** R1 redesigns the contents of the existing first branch only.

---

## 3. Candidate evaluation — five mechanisms scored

The user listed five candidate reward types. Each is evaluated against player impact, implementation complexity, abuse risk, and Gen 5/6 interaction.

### 3.1 Additional queue slots

| Axis | Assessment |
|------|------------|
| Player impact | **Largest** of any candidate. A 2nd slot lets the CNT chain and BC chain run in parallel inside the RPC ladder, compressing 94 min → ~55 min. A 3rd slot drops it further to ~40 min. Felt instantly on the very next reaction. |
| Implementation complexity | **Low.** Queue plan §5 already includes `slot: Number` on every queue entry. Queue plan §16 explicitly notes "architecture supports multiple slots; single-slot UI is MVP. Deferred." `MAX_SLOTS = 1` in `reactions.js` becomes a per-user derivation: `1 + (user blueprints granting slots)`. No schema change. |
| Abuse risk | **None.** Each queued reaction still deducts full reactants and energy. Parallel slots = more parallel resource burn, not free synthesis. |
| Gen 5/6 interaction | **Excellent.** 24-72 hour reactions are tolerable only with parallelism. Slot expansion is forward-compatible without change. |

**Verdict:** include. This is R1's headline blueprint.

### 3.2 Reaction speed bonuses

| Axis | Assessment |
|------|------------|
| Player impact | **High and persistent.** Multiplicative -10% per level × 5 levels ≈ -41% reactionTime per generation. Stacks across all reactions in that generation, every run forever. |
| Implementation complexity | **Low-medium.** `expectedCompletion = startTime + reactionTime × multiplier(user, reaction)` at queue start. Multiplier is `(0.9)^level` for the matching per-generation blueprint. Snapshot captures the effective `reactionTime` so reactions cannot be retroactively sped up after queue. |
| Abuse risk | **Low.** Snapshot locks `expectedCompletion`. Even if a blueprint is purchased mid-queue, in-flight reactions keep their original times. |
| Gen 5/6 interaction | **Good but needs a cap.** -41% on a 72-hour reaction is -29 hours saved — material relief, not trivialization. Hard-cap at -50% per blueprint (5 levels × -10%) prevents future stacking from collapsing the wall. |

**Verdict:** include. Per-generation acceleration is the long-tail grind that gives R1 a 10-15 run progression curve.

### 3.3 Offline completion improvements

| Axis | Assessment |
|------|------------|
| Player impact | **Already partially shipped.** Queue plan §11 + §12 has `pendingNotifications` and resolver-on-load. The queue resolves while offline; on next HTTP request, completed reactions credit and the discovery animation replays. |
| Implementation complexity | **Low.** Mostly already in place. Remaining work: surface a "while you were away" summary in the UI on reconnect, and verify that the resolver handles back-to-back offline completions (queue length > 1 of completed-but-uncredited). |
| Abuse risk | **None.** Resolver only credits — never refunds. Re-running on a recovered entry is correct. |
| Gen 5/6 interaction | **Critical.** 72-hour Gen 5 reactions are unplayable without offline. Hardening this in R1 prevents Gen 5 design from getting stuck. |

**Verdict:** include — but as **default-on runtime behavior, not as a blueprint purchase.** Players should not have to pay shards for the queue to keep running while they're at work. Gate this behind nothing. R1 ships an offline-completion hardening pass alongside the blueprint work.

### 3.4 Queue reservation / buffer

| Axis | Assessment |
|------|------------|
| Player impact | **High.** Lets the player pre-stage the next N reactions; when an active slot frees, the next buffered reaction auto-starts. Turns "watch the queue, click next when done" into true idle play. |
| Implementation complexity | **Medium-high.** Two viable designs: (a) treat buffer slots as `queued` status (new enum value), reactants reserved at buffer time, auto-promote to `processing` on slot free; (b) keep buffer as a separate `user.queueBuffer[]` array of intentions, validate-and-promote on slot free. Design (a) reuses the lifecycle and prevents inventory abuse but extends the status enum. Design (b) is cleaner schema-wise but adds eligibility re-check on dequeue. |
| Abuse risk | **Medium.** Critical decision: are reactants deducted at *buffer time* or at *promotion time*? If at promotion time, players could double-buffer against the same inventory. If at buffer time, reactants are committed earlier than expected. Recommendation: deduct at buffer time. Same lock-in tension as the existing reactor commit. |
| Gen 5/6 interaction | **Excellent.** Long Gen 5 chains become tolerable when a player can queue 3+ reactions for the night. |

**Verdict:** include in R1, but **ship last in implementation order**. Design (a) — extend the status enum, reuse the lifecycle. Buffer is the most complex of the four mechanics; defer until slots and acceleration ship.

### 3.5 Other candidates considered and rejected

| Candidate | Why rejected |
|-----------|--------------|
| Activity-decay reduction | Helps energy income. Energy isn't the wall. Save for a future energy branch (post Phase R). |
| Reactant pre-staging (auto-produce specific intermediates) | Would trivialize Gen 4 chain accumulation. Overlaps with R2's production engine. Out of R1 scope. |
| Instant-discovery cache (skip animation on rerun) | Cosmetic. Marginal time saving. Doesn't fit "permanent and meaningful." |
| Energy cap expansion | Energy has no cap; nothing to expand. |
| Reactor auto-restart on completion (re-queue same recipe) | Tempting but would interact badly with discovery (re-queuing an unmatched recipe is non-trivial). Deferred to a future "advanced automation" branch. |

---

## 4. Branch structure

`PrestigeBranchPanel` reorganizes into three named sections plus a separate footer. Existing legacy "Reactor Efficiency" (energy/matter/chemistry) stays in the collapsed legacy section as it does today.

```
PRESTIGE BRANCH I — TIME & QUEUE INFRASTRUCTURE
│
├─ § Reactor Capacity      (queue slot expansion)
├─ § Reaction Acceleration (per-generation speed)
├─ § Reactor Automation    (queue buffer / auto-advance)
│
└─ § Reactor Efficiency [legacy, collapsed]  — unchanged
```

Offline completion does not get a UI surface — it is default-on runtime behavior.

The current 5 atom-producer modules (`atmospheric_separator`, etc.) **are NOT in R1's branch**. They move to a new Branch II that ships in R2. For R1's ship, those modules can either be hidden via UI flag or moved to a placeholder "Coming Soon — Atom Automation" stub. Recommend the latter to preserve their visibility as roadmap signal.

---

## 5. Blueprint catalogue

Eight blueprints across three sections. Maximum-level numbers and shard costs are calibrated against post-Q-F payouts: focused Gen 3 ≈ 25 shards, deep Gen 4 ≈ 88 shards.

### 5.1 Reactor Capacity (2 blueprints, binary unlocks)

| Key | Name | Effect | Cost (shards) | Notes |
|-----|------|--------|---------------|-------|
| `expanded_reactor_bay` | Expanded Reactor Bay | +1 queue slot (max becomes 2) | **30** | The first-purchase headline. Affordable after 1 focused Gen 4 run. Player feels the parallelism on the very next reaction. |
| `triple_reactor_array` | Triple Reactor Array | +1 queue slot (max becomes 3) | **150** | Requires `expanded_reactor_bay`. Substantial step. ~2 deep Gen 4 runs of savings. |

Slot total derivation: `MAX_SLOTS = 1 + (owns expanded_reactor_bay ? 1 : 0) + (owns triple_reactor_array ? 1 : 0)`.

### 5.2 Reaction Acceleration (3 blueprints, 5 levels each)

| Key | Name | Effect (per level) | Max effect | Cost per level (shards) | Total to max |
|-----|------|---------------------|------------|-------------------------|--------------|
| `foundry_optimizer` | Foundry Optimizer | -10% Gen 2 reactionTime | -41% (compound) | 5 → 10 → 20 → 40 → 80 | 155 |
| `materials_lab_optimizer` | Materials Lab Optimizer | -10% Gen 3 reactionTime | -41% | 10 → 20 → 40 → 80 → 160 | 310 |
| `fusion_chamber_optimizer` | Fusion Chamber Optimizer | -10% Gen 4 reactionTime | -41% | 15 → 30 → 60 → 120 → 240 | 465 |

Cost scaling rationale: each level costs 2× the prior level (geometric). This forces the player to keep returning. Gen 4 levels are most expensive because they relieve the most felt pain.

Multiplier applied at queue start: `effectiveTime = reactionTime × (0.9)^level` for the matching generation. Snapshot captures the resulting `expectedCompletion`. Reactions in flight never re-derive.

Hard cap at level 5 (max -41%) keeps Gen 5/6 from being trivialized. Future branches can add separate Gen 5 / Gen 6 optimizer blueprints when those content tiers ship.

### 5.3 Reactor Automation (2 blueprints, binary unlocks)

| Key | Name | Effect | Cost (shards) | Notes |
|-----|------|--------|---------------|-------|
| `queue_buffer` | Reactor Queue Buffer | +1 buffered queue slot. Pre-stages 1 reaction; auto-starts when an active slot frees. | **60** | First taste of "walk away and let the lab run." Reactants deducted at buffer time. |
| `extended_buffer` | Extended Buffer Array | +2 more buffered slots (3 total buffered) | **200** | Requires `queue_buffer`. Lets a player line up an entire sub-chain. Critical for Gen 5 prep. |

Buffer slot total derivation: `BUFFER_SLOTS = 0 + (owns queue_buffer ? 1 : 0) + (owns extended_buffer ? 2 : 0)`.

### 5.4 Offline completion (no blueprint — runtime hardening)

Not purchasable. Default-on behavior, validated and hardened during R1 implementation. Specifically:

- **Verify** the resolver handles back-to-back completions correctly when the user returns after multiple `expectedCompletion` deadlines have passed for the same slot. Today's queue is single-slot so this hasn't been stressed.
- **Surface** a "while you were away" summary in the UI on reconnect (existing `pendingNotifications` already accumulate; just needs a panel/toast).
- **Pruning** of delivered `pendingNotifications` — queue plan §13 notes this is currently manual. Add a simple "older than 48h with `deliveredAt` set" cleanup on each load.

---

## 6. Shard cost philosophy

### 6.1 Calibration points

Post-Q-F shard payouts (from `docs/qf-shard-recalibration-report.md`, audit-verified):

- Minimal Gen 1 (water+salt): ~3 shards
- Early run (water+salt+bronze, T=5): ~7 shards
- Focused Gen 3 LiCell run (T=10): ~25 shards
- Complete Gen 3 explorer (T=10): ~44 shards
- Focused Gen 4 capstone (T=12): ~70–80 shards
- Deep Gen 4 (everything): ~88 shards

### 6.2 Rules used

1. **First purchase ≤ 1 Gen-4 run.** `expanded_reactor_bay` at 30 shards is reachable after a single focused Gen 4 capstone. This guarantees "first Big Bang feels like a meaningful spend."
2. **Headline upgrades cost 1–3 runs each.** `triple_reactor_array` (150) and `extended_buffer` (200) are 2–3 deep run targets.
3. **Acceleration costs 2× per level.** Each tier feels twice as expensive as the last, which paces a player out across 10+ Big Bangs.
4. **Higher generations cost more.** Gen 4 acceleration costs 3× Gen 2 acceleration per level, reflecting that the relief is bigger and the wall is harder.
5. **Total full R1 buyout ≈ 1,400 shards.** Calculation: 30 + 150 + 155 + 310 + 465 + 60 + 200 = **1,370 shards**. At ~80 shards/deep-Gen-4-run, that's ~17 Big Bangs to fully complete R1. Comfortably inside the 10-15 target — with cushion if shard payouts are tuned further.

### 6.3 What this implies for blueprint cost in `prestigeConfig.js`

Each blueprint entry needs a `blueprintCost` field. For leveled blueprints, `blueprintCost` becomes either a flat array of per-level costs or a function. Two options:

**Option A — flat array (preferred, simpler):**
```js
fusion_chamber_optimizer: {
    name: 'Fusion Chamber Optimizer',
    type: 'acceleration',
    generation: 4,
    maxLevel: 5,
    blueprintCost: [15, 30, 60, 120, 240],   // index = next level being purchased - 1
    effect: { reactionTimeMultiplier: 0.9 }   // applied per level: 0.9^level
}
```

**Option B — formula (more flexible, more complex):**
```js
blueprintCost: { base: 15, multiplier: 2 }   // cost(n) = base × multiplier^(n-1)
```

Recommend Option A. The values are hand-tuned and shouldn't grow algorithmically; a flat array is auditable and easily rebalanced.

---

## 7. Upgrade path — what does a player actually buy, in what order?

Optimal-play path, post-Q-F payouts:

| Big Bang | Available shards (typical) | Recommended purchase | Cumulative R1 % owned |
|----------|----------------------------|-----------------------|------------------------|
| 1 | ~80 (first deep Gen 4) | `expanded_reactor_bay` (30) | 2% |
| 2 | ~30 leftover + ~80 new = 110 | `queue_buffer` (60) + `foundry_optimizer L1` (5) | 7% |
| 3 | ~45 leftover + ~80 = 125 | `fusion_chamber_optimizer L1` (15) + `materials_lab_optimizer L1` (10) + saving | 9% |
| 4 | ~100 leftover + ~80 = 180 | `fusion_chamber_optimizer L2` (30) + `foundry_optimizer L2` (10) + saving | 13% |
| 5 | ~140 leftover + ~80 = 220 | `triple_reactor_array` (150) | 24% |
| 6–10 | accumulating | Max acceleration on Gen 4 → Gen 3 → Gen 2 | 50–70% |
| 11–15 | accumulating | `extended_buffer` (200), top up remaining acceleration | 85–100% |

Why slot expansion before acceleration: a -10% on Gen 4 reaction time saves ~9 minutes off a 94-minute chain. A 2nd slot lets the player run BC chain parallel to CNT chain, saving ~30 minutes off the same chain. Slot expansion has 3× the felt impact per shard.

Why `triple_reactor_array` at Big Bang 5 instead of earlier: it costs 150 shards, requires ~2 runs of saving, and benefits more from already-acquired acceleration levels (3 slots × accelerated reactions compounds).

---

## 8. Big Bang progression expectations

The user should feel each of these moments occur naturally during normal play:

1. **End of Big Bang #1.** "Two slots! I can run BC and CNT in parallel now." First felt win.
2. **End of Big Bang #2.** "I can pre-load the next reaction so it just starts when this one ends." First taste of idle.
3. **End of Big Bang #5.** "Three slots completely changes RPC pacing — I'm running the whole bottom of the chain in parallel."
4. **End of Big Bang #10.** Acceleration mid-tier. Reactions are noticeably faster across the board.
5. **End of Big Bang #15.** R1 complete or nearly so. Player is now ready for whatever ships next (R2, energy branch, or Gen 5).

At no point during this progression does Gen 4 become trivial:
- Max R1 ownership: -41% Gen 4 time + 3 slots + 3 buffered = RPC chain compressed from 94 min serial to ~30 min effective wall time.
- That's a 3× compression, not 10×. Still a meaningful commitment.
- Gen 5 chains at 24-72 hours retain genuine wall-pressure even with full R1.

---

## 9. Schema impact and reuse

R1 requires **no schema changes** beyond the existing `user.blueprints[{ blueprintKey, level, purchasedAt }]` shape. Specifics:

| Surface | Status | Action needed |
|---------|--------|---------------|
| `user.blueprints[]` | Exists, supports `level` | None. R1 blueprints store level here directly. |
| `user.activeQueue[].slot` | Exists per queue plan §5 | None. Multi-slot lifecycle ready. |
| `user.activeQueue[].status` enum `[processing, resolving, completed, failed]` | Exists | Buffer (§5.3) requires adding `queued` to enum. Single-line schema change. |
| `user.pendingNotifications[]` | Exists | None. Offline hardening uses existing array. |
| `prestigeConfig.js` | Exists with 5 entries | Replace contents with R1 catalogue from §5. Old 5 entries archived for R2. |
| `MAX_SLOTS` const in `reactions.js` | Hardcoded `1` | Replace with a per-user derivation reading `user.blueprints`. |

The purchase route (`POST /api/users/:username/blueprints/:blueprintKey`) currently returns an error if the player already owns a blueprint (`users.js:140`). For leveled blueprints this becomes: if owned, validate next-level cost against `prestigeConfig.blueprintCost[currentLevel]`, increment level, deduct shards. Non-leveled blueprints (`expanded_reactor_bay`, `triple_reactor_array`, `queue_buffer`, `extended_buffer`) keep the original "error if already owned" behavior.

The reaction queue start path (`reactions.js`) needs three changes:
1. Replace `MAX_SLOTS = 1` with a `getMaxSlots(user)` derivation.
2. Apply acceleration multiplier when computing `expectedCompletion`.
3. If buffer slot is available and active slot is full, write entry with `status: 'queued'` instead of rejecting with "Reactor is occupied."

`resolveQueue.js` adds one method: on each active-slot completion, scan `activeQueue` for entries with `status: 'queued'`, take the oldest, transition to `processing`, start countdown. This auto-promote is a single function call.

---

## 10. Abuse and exploit surface — review

| Vector | Risk | Mitigation |
|--------|------|------------|
| Buy blueprint, get refund via cancellation | Not possible. Queue has no cancellation (queue plan §6). Blueprints have no documented refund path. | None needed. |
| Mid-queue blueprint purchase speeds in-flight reaction | Snapshot locks `expectedCompletion` at queue start. New blueprint applies to future reactions only. | None needed — snapshot model already protects this. |
| Buffer double-deduct against same inventory | Reactants deducted at buffer-write time, same as active-slot write. Buffer slots are first-class queue entries with status `queued`. | Enforced by existing inventory check at queue write. |
| Promotion from `queued` → `processing` fails because eligibility changed (e.g., reaction deactivated) | Reactants already gone. Snapshot is authoritative — promote anyway. Same policy as queue plan §5 "reaction disabled while queued." | Reuse existing snapshot-authority behavior. |
| Multi-tab race on buffer promotion | Same atomic-claim pattern from queue plan §10 (Stage 12 hardening) — extend to `queued → processing` transition. | Apply existing `findOneAndUpdate` + `$elemMatch` pattern. |
| Player buys slot expansion at low tier, exploits at high tier | Not an exploit — that's the design. The blueprint persists across Big Bangs intentionally. | None needed. |

No new abuse class is introduced. R1 reuses three already-hardened patterns (snapshot authority, atomic claim, inventory deduct-at-write).

---

## 11. Recommended implementation order

Ship in this sequence. Each step is independently testable and shippable.

### Step 1 — Reactor Capacity (queue slots)
- Update `prestigeConfig.js` with `expanded_reactor_bay` and `triple_reactor_array`.
- Replace `MAX_SLOTS = 1` in `reactions.js` with `getMaxSlots(user)`.
- Update `PrestigeBranchPanel` to show the new "Reactor Capacity" section.
- Test: purchase blueprint, verify 2nd reaction queues without "Reactor is occupied" error, verify Big Bang persistence.

**Estimated effort:** 1–2 days. Smallest, highest-impact ship.

### Step 2 — Reaction Acceleration
- Add three optimizer blueprints to `prestigeConfig.js` with `maxLevel: 5` and cost arrays.
- Extend purchase route to handle leveled blueprints (cost array indexed by current level).
- Apply multiplier in `reactions.js` queue start: `expectedCompletion = startTime + reactionTime × accelMultiplier(user, reaction.generationTier) × 1000`.
- Update `PrestigeBranchPanel` to show "Reaction Acceleration" section with level meter per blueprint.
- Test: verify multiplier applied at queue start, verify snapshot captures effective time, verify Big Bang persistence preserves level.

**Estimated effort:** 2–3 days. Touches purchase route logic (leveled blueprints) for the first time.

### Step 3 — Offline completion hardening
- Verify resolver handles N-completions-while-offline correctly (write test).
- Add "while you were away" summary panel (uses existing `pendingNotifications`).
- Add automatic pruning of delivered notifications older than 48h.

**Estimated effort:** 1–2 days. Mostly testing + UX polish.

### Step 4 — Reactor Automation (queue buffer)
- Extend `activeQueue.status` enum to include `queued`.
- Update `reactions.js` queue start: if active slots full but buffer slots available, write entry with `status: 'queued'`.
- Extend `resolveQueue` to auto-promote oldest `queued` entry when an active slot completes.
- Apply atomic claim pattern to the `queued → processing` transition.
- Update `QueuePanel` to render `queued`-status entries below active slots with "waiting" indicator.
- Add `queue_buffer` and `extended_buffer` to `prestigeConfig.js`.
- Test: buffer fills, auto-promotion on completion, multi-tab race safety, Big Bang persistence.

**Estimated effort:** 3–5 days. Most complex of the four; ships last to keep risk isolated.

### Total estimated effort
7–12 development days for full R1 ship. Slot expansion can ship first as a standalone milestone (1–2 days) to deliver felt relief immediately while the rest of R1 is in flight.

---

## 12. Validation gates

Before R1 is considered complete and Phase R can hand off to R2 or Gen 5 design:

1. **Audit re-run.** `dev-auditEconomy.js` updated to reflect a baseline post-R1 player (e.g., assumes 1 slot expansion + L1 Gen 4 acceleration owned). Verify chain times reflect the new effective times.
2. **Q-G re-check.** The Q-G validation document (`docs/qg-prestige-pressure-validation.md`) re-evaluated. Specifically: does a natural Big Bang #2 moment now exist? (R1's answer: yes — buying the queue slot directly enables it.)
3. **End-to-end playtest.** A single test session: complete first Gen 4 capstone, Big Bang, buy `expanded_reactor_bay`, start second run, verify the next run feels materially different.

If all three gates pass, R1 is complete. R2 (atom automation, the originally-scoped 5 modules) can then begin against the post-R1 baseline.

---

## 13. Future branch reservation

R1 deliberately leaves these mechanics for future branches so they remain available as prestige progression:

- **R2 — Atom Automation.** Existing 5 atom-producer modules ship here.
- **Branch III — Energy Economy.** Energy cap, energy sinks, activity decay reduction. Resolves the Q-E deferred problem post-Phase R.
- **Branch IV — Discovery Mastery.** Discovery hint acceleration, condition pre-cache, unlock-tier bonuses.
- **Branch V — Gen 5/6 Specific.** Long-duration reaction multipliers, exotic-currency blueprints, prestige-gated reaction inputs.

R1 + R2 + III completes the "post-Q + first-prestige-pass" arc. IV and V become Gen 5 work.

---

## 14. Decision summary

| Question | Answer |
|----------|--------|
| Does R1 fit inside the existing prestige framework? | Yes. No new persistence pattern, no new currency, no new UI surface. |
| What is R1's first felt impact? | `expanded_reactor_bay` at 30 shards — affordable after one Gen 4 run, instantly felt as 2nd parallel slot. |
| Does R1 risk trivializing Gen 4? | No. Maximum R1 ownership compresses RPC chain ~3×, not ~10×. Gen 5 chains retain meaningful wall pressure. |
| How many Big Bangs to fully complete R1? | ~17 at current Q-F shard payouts. Comfortably inside the 10–15 target. |
| What schema changes? | One enum addition (`status: 'queued'`) for the buffer. Everything else reuses existing fields. |
| What is the minimum-viable ship? | `expanded_reactor_bay` alone — 1–2 days of work, delivers the dominant relief. Everything else extends the progression curve. |

---

## 15. Open decisions (require user input before implementation)

1. **Should `expanded_reactor_bay` ship as a standalone milestone before the rest of R1?** Strong recommendation: yes. Lowest-risk way to validate the prestige loop, fastest player relief.
2. **Should `triple_reactor_array` require `expanded_reactor_bay`, or be purchasable independently?** Recommendation: require. Forces ordered progression and gives the first purchase its "first felt impact" weight.
3. **Should acceleration blueprints have a hard `unlockTier` gate** (e.g., `fusion_chamber_optimizer` requires having reached tier 11 in any prior run)? Recommendation: no — visible to all, but UI shows "applies to Gen 4 reactions" hint. New players can save for future use; no hard gating needed.
4. **Should buffer slots use status `queued` (extend enum) or a separate `user.queueBuffer[]` array** (cleaner schema but eligibility re-check at promotion)? Recommendation: extend enum. Reuses lifecycle, atomic-claim, snapshot — proven patterns.
5. **Cost calibration sanity-check.** Total R1 = 1,370 shards / ~17 Big Bangs. If the user prefers a tighter or looser progression, cost arrays in §5 are the tuning surface. No design changes required to retune.

Implementation is gated on user resolution of these five decisions.

---

*End of R1 design document. No code changes made.*
