# Phase R — Architecture Review

**Phase:** Pre-Phase-R (scope validation)
**Status:** Analysis only. No code changes.
**Date:** 2026-06-01
**Depends on:** Q-D complete, Q-F implemented, Q-G validation complete (`docs/qg-prestige-pressure-validation.md`)
**Goal:** Validate that the prestige branch currently scoped for Phase R solves a real player problem.

---

## 1. What Phase R currently is

From `server/config/prestigeConfig.js` + `client/components/PrestigeBranchPanel.jsx`:

| Blueprint key | Produces | Placeholder cost |
|---------------|----------|------------------|
| `atmospheric_separator` | hydrogen, oxygen | 1 shard |
| `carbon_scrubber` | carbon | 1 shard |
| `nitrogen_condenser` | nitrogen | 1 shard |
| `iron_smelter` | iron | 1 shard |
| `sulfur_extractor` | sulfur | 1 shard |

**What is built:** a flat list of 5 atom-producer blueprints. Purchase records survive Big Bang via `user.blueprints`.

**What is NOT built (despite the name "Automation Infrastructure"):**
- No production engine — owning a blueprint does nothing per tick.
- No offline accumulation logic.
- No queue-slot expansion blueprints.
- No reaction-time-reduction blueprints.
- No interaction with `MAX_SLOTS = 1` in `resolveQueue.js` (queue plan §1 notes multi-slot is "architecture supports it, UI deferred").

The branch ships *atom-producer* blueprints. That is the entire scope.

---

## 2. The pain that Q-D + Q-F actually leaves on the table

Q-D produced real walls. Q-G confirmed them. Concretely, after a player reaches tier 12 and starts a serious Gen 4 capstone push:

- **RPC chain:** 94 minutes serial, 271 atom clicks distributed over those 94 minutes.
- **QSub chain:** 60 minutes serial, 161 atom clicks.
- **NFP chain:** 38 minutes serial, 97 atom clicks.
- **CNT bottleneck:** 18 graphenes → 6 CNTs is the densest middle section of any chain. Pure queue serialization.
- **Single queue slot.** No parallel paths possible; the player must serialize CNT before BC before RPC even though those are structurally independent dependencies.

The player's felt experience during a Gen 4 push: *waiting for the queue*. Clicking is sparse (~3 clicks/min for a 94-minute chain) and rarely the bottleneck.

---

## 3. Evaluation by pressure axis

### 3.1 Atom scarcity pressure — does the current Phase R address it?

**Partially yes, but the problem is secondary.**

Atoms are consumed every Gen 1 reaction (water = 1 H + 1 O, etc.). The atom click cost for an entire RPC chain is 271 clicks — real, but spread over 94 minutes. That's ~3 clicks/minute average. A casual player clicking at any reasonable pace stays ahead of atom demand effortlessly.

Where atom scarcity *could* matter: a player doing a focused click sprint to maximize energy income (activity 40 → 100). Sustained activity 100 requires ~20 clicks/sec. Atom producers would offload some of that, allowing the player to focus clicks on activity rather than atom procurement.

But this is a niche optimization, not the wall. **Atom-producer blueprints address a real problem that is not the dominant problem.**

### 3.2 Time pressure — does the current Phase R address it?

**No. Not at all.**

Atom producers do not reduce `reactionTime`. They do not shorten the 94-minute RPC chain by a single second. A player who Big Bangs, buys all 5 atom-producer blueprints, and starts the next run will face an *identical* 94-minute RPC chain.

This is the largest single misalignment between the current Phase R scope and the post-Q-D player experience. Time pressure is the dominant wall, and the current Phase R has no lever for it.

### 3.3 Queue pressure — does the current Phase R address it?

**No. Not at all.**

`MAX_SLOTS = 1` is the structural reason a 18-graphene stockpile takes ~25 minutes — they queue serially with nothing else. Atom producers do not add queue slots, do not enable parallel synthesis paths, do not reduce slot contention.

The queue plan (Section 1, deferred non-goals) explicitly leaves multi-slot queue UI for future work and notes that the underlying architecture already supports it. The data model has `slot: Number` on every queue entry precisely for this reason. The blocker is route/UI exposure, not deep architecture.

A queue-slot blueprint would have **outsized impact** relative to its implementation cost (the schema is ready) compared to atom producers (which need a brand-new production engine built from scratch).

---

## 4. Verdict

The current Phase R branch solves a real but secondary pain (atom click load) using a substantial new system (production engine, offline accumulation, inventory hooks) while leaving the dominant pain (time + queue serialization) untouched.

A player who completes the Phase R loop as currently scoped — Big Bang, purchase blueprints, start next run — will feel a marginal improvement at Gen 1 and zero improvement at Gen 4, the generation where the prestige incentive is supposed to land.

**Phase R as currently scoped is misaligned with the wall Q-D created.** It should not be implemented as-is and called "the prestige pressure relief."

---

## 5. Proposal — three options

### Option A: Keep Phase R unchanged ❌ Not recommended

Implement the 5 atom-producer blueprints as scoped. Production engine, offline accumulation, the works.

**Pros:** Self-contained, ships fast, validates the production-engine pattern for future blueprint types.
**Cons:** Player Big Bangs, sees minimal Gen 4 impact, prestige loop fails the Q-G validation gate. Phase R completes but Q-G's "is there a reason to Big Bang twice" question remains unanswered. Gen 5 stays blocked because the prestige loop hasn't been proven to deliver felt relief.

**Why not:** delivers a system, not a solution. Misaligns engineering cost with player-felt value.

### Option B: Extend Phase R ⚠ Acceptable but bulky

Add queue-slot blueprints and reaction-time-reduction blueprints to the existing 5-module scope. Ship one large Phase R that contains everything.

**Pros:** One coherent phase, one milestone gate. Player sees full prestige loop on first Big Bang post-implementation.
**Cons:** Phase R becomes the largest phase in the project. Three new subsystems (production engine, slot expansion, time multipliers) ship together. High implementation risk; hard to validate each piece independently; if one piece slips the whole gate slips.

### Option C: Split into R1 + R2, reordered ✅ Recommended

Split Phase R into two sequential phases, but **reorder them**. The current branch is misordered — it ships the lower-priority pain reliever first.

#### R1 — Time & Queue Relief (ships first)

The pain-killer for what Q-D actually created.

| Blueprint family | Mechanic | Estimated implementation effort |
|------------------|----------|--------------------------------|
| **Queue slot expansion** | One blueprint adds a second `processing` slot. Optionally a third later. | Low — schema already has `slot` field; `MAX_SLOTS` becomes user-derived |
| **Per-generation time reduction** | E.g. `foundry_optimizer` reduces Gen 2 reactionTime ×0.9 per level (5 levels = 41% reduction). One per generation tier. | Medium — multiplier applied in `completeReaction` `expectedCompletion` calculation |
| **Offline progress** | Default-on behavior (not a blueprint): queue continues completing while logged out. Already partially supported via `expectedCompletion` + `pendingNotifications`. | Low-medium — the resolver already runs on next user load; verify and harden |

**R1 is what makes the second Big Bang feel different.** A player who buys a queue slot expansion blueprint can run CNT chain in parallel with the BC chain, compressing 94-minute RPC into ~50 minutes. That is the felt relief Q-G said does not currently exist.

#### R2 — Atom Automation (ships second, optional)

The current branch as-is.

| Blueprint family | Mechanic | Estimated implementation effort |
|------------------|----------|--------------------------------|
| **Atom producers** (the 5 existing modules) | Each blueprint generates `produces[]` atoms at a fixed rate. Trickles into inventory online + offline. | Medium — needs a tick-based production engine and offline catch-up logic |

R2 is still defensible — atom producers add genuine quality-of-life for casual players who don't want to grind clicks. But they are not the pain reliever, so they ship second.

#### Why split + reorder beats extend

- **Risk isolation.** R1 ships and is validated independently. If the felt prestige relief works, the loop is proven before R2 even starts.
- **Architecture reuse.** R1's queue-slot work touches `resolveQueue` and `MAX_SLOTS`; R2's production engine is independent. Splitting lets each touch a focused part of the codebase.
- **Shippability.** R1 has lower implementation cost than R2 because the multi-slot architecture is already in place per the queue plan. R1 can plausibly land in a week; R2 needs a new production engine.
- **Phase Q-G gate.** Q-G asked "does the prestige loop produce a reason to Big Bang again?" The answer becomes yes immediately after R1, regardless of R2's existence or schedule.

---

## 6. Recommendation

**Adopt Option C — split into R1 (time & queue relief) and R2 (atom automation).**

The current `PRESTIGE_CONFIG` and `PrestigeBranchPanel` should be **retained as the R2 starting point**, not deleted. The 5 modules still have value as offline-accumulation quality-of-life. They simply ship second, after the dominant Q-D wall has been broken by R1.

The Q-G blocker question — "does a reason to Big Bang twice exist?" — is answered "yes" the moment R1 ships, even if R2 never ships. R2 becomes a polish item rather than a prestige-loop dependency.

### Concrete R1 scope (suggestion for the next planning round, not for this review)

- **1 queue-slot blueprint** (binary unlock — adds second slot; possibly a second blueprint for a third slot)
- **4 time-reduction blueprints, one per generation** (Gen 1 — Gen 4, each multiplicative -10% / level, max 5 levels, capping at -41%)
- **Offline progress** as default-on behavior, no blueprint required (already most of the way there from queue plan Stage 11)

Estimated R1 shard budget at post-Q-F payouts (Run B focused ≈ 25 shards, Run C deep ≈ 88 shards):
- Queue slot blueprint: ~30 shards (one focused Gen 3 run buys it)
- Each time-reduction blueprint level: 5–15 shards
- Total full R1 buyout: ~150–250 shards (2–3 deep Gen 4 runs)

These numbers are illustrative — final pricing belongs to R1 planning. The point is that post-Q-F shard payouts comfortably support meaningful R1 blueprint costs.

---

## 7. Does the current Automation Infrastructure branch still address a meaningful player pain point?

**Direct answer: yes, but a secondary one — and not the one Q-D and Q-G said was urgent.**

The current branch addresses atom click load (real for activity-sprinters, marginal for capstone-pushers). It does not address time pressure or queue pressure, which are the dominant Gen 4 walls.

The branch should not be deleted or rewritten. It should be **renamed and resequenced** as R2 (Atom Automation), with a new R1 (Time & Queue Relief) inserted in front of it. The walls Q-D built require R1's relief mechanisms to be felt; R2 is a follow-up benefit, not the headline.

---

## 8. Decision required before implementation begins

The user should pick one of:

| Choice | Effect |
|--------|--------|
| Stay with Option A (current scope, ship as-is) | Phase R completes, Gen 4 wall persists unchanged, Q-G gate stays open |
| Option B (extend) | One large Phase R with all three subsystems; high risk, single gate |
| **Option C (split + reorder)** | R1 (time/queue) ships first as the pain reliever; R2 (atom producers, current branch) follows; staged risk, lower per-phase scope |

Until the choice is made, the existing prestige branch UI can remain in place — it is functionally inert (placeholder cost, no production engine) and does not mislead a player into thinking the system works.

---

*End of Phase R architecture review. No code changes in this document.*
