# Genesis Lab — Implementation Roadmap

**Version:** 1.6  
**Status:** Active Implementation — Era VIII: UX & Discovery Overhaul (Gen 1–6 content arc complete; Phase U active)  
**Date:** 2026-06-05  
**Inputs:** reaction-graph-design.md, generation-philosophy-v2.md, substance-importance-audit.md, substance-universe.md, queue-system-plan.md, prestige-system-redesign.md, prestige-loop-analysis.md, economic-progression-analysis.md  
**Scope:** Full implementation sequencing from design lock to game-complete state

---

> **Roadmap Revision Note (2026-05-30):**  
> Audited after completion of Phase F (conditions enforcement), Phase B2 (Gen 4 content seeding), and Gen 4 full playthrough validation. Preamble, phase headings, Stage 13 description, Phase G status, and Appendix naming deviations updated. No implementation code changed.

---

> **Roadmap Revision Note (2026-06-01) — Prestige & Economy Foundation Insertion:**
>
> **Why this revision was made:**  
> Three analysis documents produced since v1.3 (prestige-loop-analysis.md, automation-system-design.md, economic-progression-analysis.md) established findings that make the prior sequencing untenable:
>
> 1. **Automation is not an independent feature.** It is the first branch of a redesigned prestige system. Implementing it before the prestige architecture is decided produces automation that will have to be refactored when that architecture is defined.
> 2. **The current prestige system addresses the wrong walls.** Energy and cost multipliers solve walls that barely exist. The Time, Queue, and Capability walls — the ones that worsen with each run — have zero prestige coverage. The prestige system must be redesigned before new branches are added.
> 3. **The game currently lacks a meaningful economic wall.** Energy income (40–100 energy/second) is 50–100× faster than reaction energy demand. No synthesis is economically gated. Long-duration synthesis without a scarcity redesign creates only longer timers, not deeper progression.
> 4. **Gen 5–6 cannot be responsibly designed** until the prestige economy is recalibrated and the Gen 5 economic gate mechanism is specified. Seeding Gen 5 content before those decisions are made will require re-seeding.
>
> **What changed:**
> - Era V renamed from "Automation, Long-Duration Synthesis & Gen 5–6 Content" to **"Prestige & Economy Foundation"**
> - Three new phases added: **Phase P** (Prestige System Redesign), **Phase Q** (Economy & Scarcity Overhaul), **Phase R** (Prestige Branch #1 Implementation)
> - Old Era V restructured into **Era VI** (Long-Duration Synthesis & Gen 5 Content) and **Era VII** (Gen 6 Content)
> - Old Era VI (Polish) renumbered to **Era VIII**
> - **Phase H** (Automation Framework) retired; automation is now Phase R under the prestige branch architecture
> - **Phase B3** split into **B3** (Gen 5 Design + Seeding + Validation) and **B4** (Gen 6 Design + Seeding + Validation)
> - **Phase J** split into **J1** (Economy Architecture — design) and **J2** (Economy Balancing — tuning)
> - Phase I (Long-Duration Synthesis) repositioned after Phase R, not before it
> - Dependency graph restructured to reflect the new critical path
> - Automation philosophy references updated throughout (automation is prestige infrastructure, not an idle-game feature)
>
> **What was removed:**
> - Phase H as an independent automation feature (absorbed into Phase R as prestige infrastructure)
> - The framing "this is the idle in the idle game" from the automation description
> - The combined Gen 5–6 seeding phase (now Gen 5 and Gen 6 are designed and validated separately)
> - The single-phase economy balancing pass (now split into architecture-first design)
>
> **What was reordered:**
> - Phase I (Long-Duration Synthesis) now follows Phase R (Automation), not precedes Gen 5 seeding directly from Phase G
> - Phase J1 (Economy Architecture) now precedes Phase B3 (Gen 5 seeding) — economic wall design must happen before content is designed against it
> - Gen 6 seeding (Phase B4) is now explicitly deferred until Gen 5 results are observed
>
> **New critical path (at time of this revision):**  
> Phase G completion → Phase P → Phase Q → Phase R → Phase J1 + Phase I (parallel) → Phase B3 → Phase J2 → Phase B4 → Phase K → Phase L

---

> **Roadmap Revision Note (2026-06-05) — Gen 5 and Gen 6 Completion; Transition to UX Focus:**
>
> **Why this revision was made:**  
> Gen 5 and Gen 6 have been fully designed, seeded, and validated through complete admin playthroughs. The full content arc from Gen 1 through Gen 6 is playable. All six generations of substances, reactions, conditions, and tier progression are functional through T24. The project's primary bottleneck has shifted from content development to UX, information architecture, and discovery guidance.
>
> **What changed in this revision:**
> - All completed phases (G, P, Q, R, J1, I, B3, J2 initial passes, B4) marked complete throughout
> - Phase B4 deliverables updated to reflect actual Gen 6 implementation (10 substances, 10 reactions, three-track convergence, spacetime_nexus capstone; substance names were finalised during design, not pre-committed as placeholders)
> - Phase D gate definitions updated from "TBD" placeholders to the confirmed full-generation tier gate chain (T1–T24)
> - New **Phase U** added: UX & Discovery Overhaul — the current active phase
> - New **Era VIII** added for Phase U; former Era VIII (Polish) renumbered to **Era IX**
> - Era I–VII all marked complete; Era VIII marked active
> - Dependency graph updated: Phase U is the current active node; J2 no longer blocks further progression
> - Critical path summary updated to reflect post-B4 reality
> - Philosophy constraints referencing "Dark Matter Crystal" updated to reflect the actual Gen 6 capstone: Spacetime Nexus
> - Appendix updated: Phase R model extensions are implemented, not pending
>
> **What was removed from "not yet built":**
> - All Gen 5 and Gen 6 content references
> - Automation infrastructure (complete)
> - Long-duration synthesis (complete)
> - "TBD" placeholders for Gen 5 and Gen 6 gate mechanisms
>
> **Current critical path:**  
> Phase U: UX & Discovery Overhaul → Phase K: Reactor Evolution → Phase L: Save Hardening + Polish
>
> **Recommended next implementation target:**  
> **Phase U** (UX & Discovery Overhaul). The game has outgrown the UI built for Gen 1–3. Substance names are too long for current panels. Discovery through blind experimentation is not feasible at Gen 5–6 complexity. Objective guidance was patched through T24 but the system needs deeper structural revision. Phase U is a prerequisite for Phase K: reactor evolution calibrates to a stable UI context.

---

## Preamble — The Current State

Genesis Lab has a working technical foundation across all six generations:

**Built and functional:**
- Authentication (login/register, session management)
- Reactor visual layer (Three.js/R3F, rings, motes, bloom, GLB core, Big Bang sequence)
- WebSocket reactor simulation (activity, decay, energy tick loop)
- Reaction execution (queued reactions, energy deduction)
- Experiments panel (reaction discovery surface)
- Notebook/history (reaction log)
- Progression skeleton (unlockTier, discoveredByDefault fields)
- MongoDB models (Substance, Reaction, User)
- **Gen 1–6 content** — 67 substances, full six-generation substance graph, seeded and admin-playtested through T24
- Runtime isolation per user (WebSocket sessions)
- Polished reactor identity (animations, effects, UI)
- **Persistent synthesis queue** — `activeQueue` schema with full snapshot, `resolveQueue`, `completeReaction`, `pruneCompletedEntries`; all routes centralized
- **Reaction timing enforcement** — Gen 1–6 `reactionTime` values applied; server enforces timing via `expectedCompletion`; zero-duration path completes in-process
- **Long-duration synthesis (Phase I)** — synthesis times 4–120 hours; `pruneAfter` scales with reaction duration (`max(24h, effectiveReactionTime)`); Big Bang 409 guard for in-flight entries; offline completion delivery is duration-agnostic
- **Queue WebSocket events** — `synthesis_queued`, `synthesis_completed`, `synthesis_discovered`, `synthesis_failed`, `queue_state`
- **QueuePanel** — countdown display, reactor occupied state, long-duration real-time calendar display
- **Unlock orchestration (Gen 1–6)** — `unlockTier` advances at completion via `snapshot.productUnlocksUserTier`; tier gating enforced across all routes; T1–T24 progression chain validated; batch-processing tier sort prevents out-of-order advancement
- **Offline completion delivery** — `pendingNotifications` with `deliveredAt`; HTTP routes create pending notifications when user is offline; WS connect drains and marks delivered exactly once; no replay
- **Atomic double-completion hardening** — Stage 12; `processing → resolving → completed/failed` atomic claim via `findOneAndUpdate` + `$elemMatch`; stale resolving recovery after 30s; multi-tab WS sync fixed
- **Dev/admin debug tooling (Phase G)** — full suite: queue inspect, fast-forward, capability grant/revoke, inventory grant, tier set, time acceleration, notification cleanup; double-gated (`NODE_ENV !== production` AND `DEV_ADMIN_ENABLED=true`)
- **Conditions enforcement engine (Phase F)** — `conditionRegistry.js` (15 conditions: Gen 1–4 substance/tier-based, Gen 5: `quantum_coherence`, `zero_point_field`, `nucleon_compression`, Gen 6: `holographic_encoding`, `metric_tension`, `causal_isolation`); `validateConditions.js`, `evaluateCapabilityUnlocks.js`; wired at queue start; Reactor Requirements UI in SelectedReactionPanel
- **Gen 4 content (Phase B2)** — 8 substances, 8 reactions, Tier 9–13 gate chain; full playthrough validated
- **Prestige system redesign (Phase P)** — branch architecture confirmed (Branch 0: reaction acceleration, 3 generations; Branch 1: automation infrastructure); shard economy recalibrated; Big Bang route redesigned
- **Economy & scarcity overhaul (Phase Q)** — Gen 5/6 gate mechanisms confirmed; shard reward calibration targets documented; Gen 5/6 shardValues specified; quantity scarcity applied to Gen 2–4
- **Automation infrastructure (Phase R)** — 5 blueprints (Atmospheric Separator, Carbon Scrubber, Nitrogen Condenser, Iron Smelter, Sulfur Extractor); blueprint purchase (shard-gated, survives Big Bang); module construction (energy + Gen 4 materials, per-run); 5-level upgrade system; `upgradeCapMultiplier: 1.1`, `upgradeRateMultiplier: 1.5`; offline catch-up; Prestige panel (Branch 0 + Branch 1)
- **Gen 5 content (Phase B3)** — 9 substances (topological_insulator through axionic_condensate), 9 reactions, dual-track convergence; conditions: `quantum_coherence`, `zero_point_field`, `nucleon_compression`; T12–T18 gate chain; full playthrough validated
- **Gen 6 content (Phase B4)** — 10 substances (vacuum_crystallite through spacetime_nexus), 10 reactions, three-track convergence; conditions: `holographic_encoding`, `metric_tension`, `causal_isolation`; T18–T24 gate chain; Triple Reactor Array materially improves critical path; full playthrough validated

**Not yet built (remaining scope):**
- **UX & discovery overhaul (Phase U)** — UI architecture review, objective system depth, discovery/experiment redesign, progression visibility, information architecture audit
- Reactor evolution (Phase K) — generation-state visual and language transitions
- Save/persistence hardening (Phase L) — migration versioning, corruption guards, onboarding, final balance pass

The transition from this state to a shippable game requires Phase U (UX and discovery), Phase K (reactor evolution), and Phase L (save hardening and polish). Build out of order and you will re-build.

---

## Part 1 — Implementation Eras

Nine eras, sequential. Each era produces a testable, playable checkpoint.

---

### Era I — Content Foundation (Gen 1–3 Only) ✅ COMPLETE
**Deliverable:** A complete Gen 1→Gen 2→Gen 3 playthrough is possible from a fresh account, using the final designed substance and reaction data.

---

### Era II — Unlock Orchestration ✅ COMPLETE
**Deliverable:** Tier gating is functional. Gen 1→Gen 2→Gen 3 progression gates correctly. Conditions enforcement is operational for Gen 1–3. Gen 4 is seeded and reachable.

---

### Era III — Synthesis Engine Hardening ✅ COMPLETE
**Deliverable:** Synthesis queue supports real reaction times with persistence through server restarts. Multiple synthesis slots are architectured. Atomic double-completion hardening is in place.

---

### Era IV — Conditions, Debug Tooling & Gen 4 Content ✅ COMPLETE
**Deliverable:** Conditions are enforced at synthesis queue time. Full debug tooling suite is operational. Gen 4 content is seeded and reachable through a correctly gated, conditions-blocked playthrough. Long-duration synthesis is server-restart-safe.

---

### Era V — Prestige & Economy Foundation ✅ COMPLETE
**Deliverable:** The prestige system is redesigned with a branch architecture, the economy is calibrated to support meaningful progression walls, and Automation Infrastructure is implemented as the first prestige branch (Phase R). A player on their second or later run experiences automation infrastructure at Gen 4 that their first run did not have.

**Phases in this era:** G (completion), P, Q, R.

---

### Era VI — Long-Duration Synthesis & Gen 5 Content ✅ COMPLETE
**Deliverable:** Synthesis times of 4–120 hours are stable and server-restart-safe. Gen 5 design is complete (dual-track, T12–T18, axionic_condensate capstone), content is seeded, and Gen 5 is fully validated through admin playthrough. Economy balancing (Gen 5 pass) complete.

**Phases in this era:** J1, I, B3, J2 (Gen 5 pass).

---

### Era VII — Gen 6 Content ✅ COMPLETE
**Deliverable:** Gen 6 design is complete (three-track convergence, T18–T24, spacetime_nexus capstone), content is seeded, Gen 6 is technically reachable, and economy balancing covers all six generations. Three-track architecture validated. Triple Reactor Array materially improves the Gen 6 critical path as designed.

**Phases in this era:** B4, J2 (Gen 6 pass).

---

### Era VIII — UX & Discovery Overhaul ← ACTIVE
**Duration estimate:** 4–6 weeks  
**Deliverable:** The UI, objective system, discovery experience, and information architecture are scaled for a six-generation game. A new player can navigate from Gen 1 through Gen 6 with directional guidance at every tier, legible substance presentation, and a discovery system that allows reasoning toward syntheses rather than requiring blind enumeration.

**Why this era is necessary:** The game has outgrown the UI built for Gen 1–3. Substance names are too long for current panels. The objective system was patched through T24 but needs deeper structural revision. Gen 5–6 complexity makes blind experimentation in the Experiments panel effectively impossible. The discovery system was designed when recipes could be guessed; it cannot scale to multi-input, multi-condition Gen 6 reactions.

**Phases in this era:** U.

---

### Era IX — Polish, Balancing, and Finalization
**Duration estimate:** 4–8 weeks  
**Deliverable:** The game is content-complete, pacing-balanced, visually evolved across generations, save-hardened, and ready for a real player to experience Gen 1 through Gen 6.

**Phases in this era:** K (reactor evolution), L (save hardening, onboarding, final balance, performance audit).

---

## Part 2 — Immediate Next Steps

The following steps were the founding implementation sequence. They are preserved as historical record. All three are complete. The current active phase is Phase U — see Part 4.

### Step 1 — Schema Audit and Alignment ✅ COMPLETE (Phase A)
### Step 2 — Gen 1–3 Content Seeding ✅ COMPLETE (Phase B1)
### Step 3 — User Inventory and Queue Foundation ✅ COMPLETE (Phase C)

---

## Part 3 — Dependency Graph

The following dependencies are absolute. Building out of order requires re-building.

```
Schema audit (Phase A) ✅
    │
    └── Phase B1: Gen 1–3 content seeding + validation ✅
            │
            ├── User inventory + queue foundation (Phase C) ✅
            │       │
            │       ├── Unlock orchestration (Phase D) ✅
            │       │
            │       └── Synthesis engine: reaction time enforcement (Phase E) ✅
            │               │
            │               └── Conditions enforcement engine (Phase F) ✅
            │                       │
            │                       └── Phase B2: Gen 4 content seeding ✅
            │                               │
            │                               └── Debug & test tooling (Phase G) ✅
            │                                       │
            │                                       └── Phase P: Prestige System Redesign ✅
            │                                               │
            │                                               └── Phase Q: Economy & Scarcity Overhaul ✅
            │                                                       │
            │                                                       └── Phase R: Prestige Branch #1 (Automation) ✅
            │                                                               │
            │                                                               ├── Phase J1: Economy Architecture (design) ✅
            │                                                               │       │
            │                                                               │       └─── Phase I: Long-Duration Synthesis ✅ ──┐
            │                                                               │                                                  │
            │                                                               └─────────────────────────────────────────────────┘
            │                                                                               │
            │                                                                       Phase B3: Gen 5 Design + Seeding ✅
            │                                                                               │
            │                                                                       Phase J2: Economy Balancing (Gen 5) ✅
            │                                                                               │
            │                                                                       Phase B4: Gen 6 Design + Seeding ✅
            │                                                                               │
            │                                                                       Phase J2: Economy Balancing (Gen 6) ✅
            │                                                                               │
            │                                                                       Phase U: UX & Discovery Overhaul ← ACTIVE
            │                                                                               │
            │                                                                       Phase K: Reactor Evolution
            │                                                                               │
            │                                                                       Phase L: Save Hardening + Polish
```

**Critical path summary:**

- **Phase U is the current active gate.** All content phases are complete. The bottleneck is now UX, information architecture, and discovery guidance.
- **Phase K after Phase U:** Reactor evolution (visual, audio, language) calibrates to a stable UI context. Phase K cannot be tested against a UI still being restructured.
- **Phase L last:** Save hardening and corruption guards require all long-duration synthesis vectors to exist before they can be defended.
- **J2 ongoing but no longer a gate:** Economy balancing passes for Gen 5 and Gen 6 are complete. Prestige saturation at high Gen 6 run count is a known architectural issue (Branch 2 solution deferred). Ongoing tuning continues during Phase U and K without blocking progress.
- **Phase B4 complete before Phase K:** ✅ Met. Content is frozen; reactor evolution can be implemented.
- **Phase I before Phase B3:** ✅ Met. Long-duration synthesis is server-restart-safe and duration-agnostic.
- **Phase P before Phase R:** ✅ Met. Branch architecture was confirmed before automation implementation began.
- **Phase Q before Phase B3:** ✅ Met. Gen 5 gate mechanism was specified before Gen 5 content was designed.
- **Phase J1 before Phase B3:** ✅ Met. Economy architecture preceded Gen 5 seeding.

---

## Part 4 — Recommended Implementation Order

---

### Phase A — Schema Alignment ✅ COMPLETE
**What:** Audit and update Reaction, Substance, and User models. No new UI. No new features.

Deliverables:
- `reactionKey` string field on Reaction (unique, indexed)
- `conditions` field typed as `[String]` instead of `Object`
- `standard_synthesis` added to `reactionType` enum
- `generationTier` (1–6) on both Reaction and Substance
- `type: "artifact"` added to Substance enum
- `hintText` field on Substance
- `inventory` (array), `unlockTier`, `activeQueue` added to User (see Appendix for deviation from original spec names)
- `reactorCapabilities: [String]` added to User — stores the set of reactor capabilities the player has unlocked (e.g., `["high_temperature", "catalyst"]`). This field is the authoritative source for conditions enforcement: at queue time, check that every condition in `reaction.conditions` appears in `user.reactorCapabilities`.

**Test:** Existing seed files still run. Existing tests still pass. No behavior change for any existing feature.

---

### Phase B1 — Gen 1–3 Content Seeding ✅ COMPLETE
**What:** Replace placeholder seeds with Gen 1–3 substance and reaction data from the reaction graph design. Gen 4–6 content is not seeded here.

Deliverables:
- All Gen 1 substances seeded with correct fields (hintText, generationTier, unlockTier, energyCost, reactionTime, conditions)
- All Gen 1 reactions seeded with correct reactionKey, reactants, products, tiers
- All Gen 2 substances and reactions seeded
- All Gen 3 substances and reactions seeded
- Seed validation script: verifies no dangling references, all unlock tiers in correct range, all energy costs within generation band, all gate substances have `discoveredByDefault: true`

**Test:** Manual playthrough — admin can synthesize every Gen 1–3 product by manually setting unlock tier and inventory. All reactions execute. No database errors.

---

### Phase C — User Inventory and Queue Model ✅ COMPLETE (Stages 1–13)
**What:** Add user-level inventory tracking and synthesis queue persistence to the backend.

Deliverables:
- `inventory` updated on reaction completion (remove reactants, add product)
- `activeQueue` entries created on reaction queue, stored in DB
- Queue entries resolve at server time: if `now > expectedCompletion`, reaction is complete on next user request
- Inventory and queue state pushed to client via WebSocket on relevant state changes
- Multiple queue slot support (slot count enforced, initially 1)

**Test:** Queue a reaction. Restart the server. Reconnect. Reaction is still in progress, completes correctly.

---

### Phase D — Unlock Orchestration ✅ COMPLETE for Gen 1–6
**What:** Implement milestone-based tier gating. Synthesis of a gate substance unlocks the next tier.

**Status note:** Tier gating is fully functional for Gen 1–6 via the queue system. `completeReaction` advances `user.unlockTier` using `snapshot.productUnlocksUserTier` on first production of a gate substance. Routes enforce `unlockTier` gating. WS completion events carry `prevUnlockTier`/`newUnlockTier`. Gen 4–6 gate transitions validated through full admin playthroughs. `resolveQueue` sorts completions by `productUnlocksUserTier` ascending to prevent out-of-order batch advancement.

Deliverables:
- Gate substance definitions stored in config or DB, not hardcoded in logic
- On reaction completion: check if product is a gate substance → if so, evaluate tier advance
- Tier advance: new reactions become discoverable (via `discoveredByDefault` flag and `unlockTier` gating)
- Client receives tier-unlock notification via WebSocket, UI reflects newly available reactions

Gate definitions (all confirmed in implementation):
- Tier 1→4 (Gen 1→Gen 2): synthesize Iron Oxide + Ammonia
- Tier 4→7 (Gen 2→Gen 3): synthesize Bronze + Sulfuric Acid
- Tier 7→9 (Gen 3→Gen 4): synthesize Steel + Lithium-Ion Cell
- Tier 9→13 (Gen 4 advancing): nuclear_fuel_pellet (→T12), quantum_substrate (→T13)
- Tier 13→18 (Gen 5): topological_insulator (→T14), chromodynamic_fiber (→T15), bose_nova_remnant (→T16), quantum_vacuum_lattice (→T17), axionic_condensate (→T18)
- Tier 18→24 (Gen 6): vacuum_crystallite (→T19), holographic_substrate (→T20), planck_lattice (→T21), entropic_foam (→T22), graviton_condensate (→T23), spacetime_nexus (→T24)

**Test:** Fresh account, play Gen 1. Attempt to queue a Gen 2 reaction — blocked. Synthesize Iron Oxide. Synthesize Ammonia. Gen 2 reactions appear. Verify each gate transition through T24.

---

### Phase E — Reaction Time Enforcement ✅ COMPLETE for Gen 1–6 (Stages 1–13)
**Status:** Stage 12 (atomic double-completion hardening) and Stage 13 (debug tooling) are complete. The synthesis queue is production-ready for all six generations. Phase F (conditions) and Phases B2–B4 (Gen 4–6 seeding) are all complete.

**What:** Enforce `reactionTime` from the seed data. Reactions no longer resolve instantly.

Deliverables:
- Queue entry created with `expectedCompletion = now + reactionTime`
- Client displays countdown timer per active queue entry
- Server resolves completion on WebSocket reconnect or periodic check
- Completion notification pushed to client via WebSocket

**Test:** Queue a Gen 2 reaction (e.g., Sulfuric Acid at 8 minutes). Countdown displays correctly. After 8 minutes, synthesis completes, inventory updates, notification appears.

---

### Stage 12 — Atomic Double-Completion Hardening ✅ COMPLETE
`resolveQueue` now uses a MongoDB atomic `findOneAndUpdate` claim with `$elemMatch` to transition each due entry from `processing → resolving` before running side effects. Only the request that wins the claim runs `completeReaction`. Stale `resolving` entries (>30s) are automatically recovered to `processing` on the next `resolveQueue` call. Multi-tab WebSocket sync bug fixed in the same pass.

### Stage 13 — Debug/Admin Tooling ✅ COMPLETE (see Phase G)
`server/routes/dev.js` implements dev-only endpoints: queue inspect, fast-forward, capability grant/revoke, inventory grant, tier set, time acceleration, and notification cleanup. Mounted behind double gate: `NODE_ENV !== 'production'` AND `DEV_ADMIN_ENABLED=true`.

---

### Phase F — Conditions Enforcement Engine ✅ COMPLETE
**What:** Implement conditions as reactor-state requirements. A reaction with conditions `["plasma_state", "extreme_pressure"]` cannot be queued unless the reactor currently has those capabilities.

Deliverables:
- Conditions registry: a config mapping each condition name to what enables it (which tier, which prior synthesis)
- Reactor state per user: `reactorCapabilities: [String]` on User model
- Queue validation: reject queue attempts where reactor lacks required conditions, return specific error identifying which conditions are missing
- Conditions UI: display which conditions a recipe requires, which are active vs. missing
- `evaluateCapabilityUnlocks.js`: evaluates capability grants on reaction completion (tier-crossing and substance-based triggers)

**Architecture note:** Conditions are modeled as a reactor capability set. `reaction.conditions.every(c => user.reactorCapabilities.includes(c))`. Adding Gen 5–6 conditions required only config entries, not new validation code — the architecture proved correct through Gen 6.

**Test:** Attempt to queue Hydrogen Plasma (requires `plasma_state`, `extreme_temperature`). Reactor lacks `plasma_state`. UI shows "reactor not capable: plasma_state." After unlocking via correct progression path, queue succeeds.

---

### Phase B2 — Gen 4 Content Seeding ✅ COMPLETE
**What:** Seed all Gen 4 substances and reactions now that the conditions enforcement engine is operational and validated.

Deliverables (all complete):
- All 8 Gen 4 substances seeded (Hydrogen Plasma, Ballistic Composite, Ceramic Superconductor, Metallic Hydrogen, Cryogenic Matrix, Nuclear Fuel Pellet, Reactive Plasma Core, Quantum Substrate)
- All 8 Gen 4 reactions seeded with correct reactionKey, reactants, products, tiers, energy costs, reaction times, and conditions arrays
- Gen 4 conditions all registered and enforced
- Gen 4 full playthrough validated: Tier 9→10→11→12→13 gate progression confirmed

**Result:** Gen 4 is fully reachable. Hydrogen Plasma blocks without `plasma_state`; Nuclear Fuel Pellet blocks without `radiation_bombardment` + `extreme_pressure`. Reactive Plasma Core and Quantum Substrate both synthesize correctly.

---

### Phase G — Debug & Test Tooling ✅ COMPLETE

**What:** Complete the admin/debug suite required for economy validation, prestige playtesting, and all late-generation testing.

**Implementation status:**

| Deliverable | Status |
|---|---|
| Active queue inspect | ✅ `GET /api/dev/users/:username/queue` |
| Queue fast-forward | ✅ `POST /api/dev/users/:username/queue/:id/fast-forward` |
| Reactor capability grant/revoke | ✅ `POST /api/dev/users/:username/capabilities` |
| Delivered notification cleanup | ✅ `DELETE /api/dev/users/:username/pending-notifications/delivered` |
| Inventory grant | ✅ `POST /api/dev/users/:username/inventory` |
| Tier set | ✅ `POST /api/dev/users/:username/tier` |
| Time acceleration multiplier | ✅ `POST /api/dev/users/:username/time-acceleration` |
| Offline progress simulation | ✅ via time-acceleration + reconnect cycle |

**Validation:** Full Gen 5 and Gen 6 admin playthroughs completed using the complete debug suite. Time acceleration and inventory grants used to advance through all six generations in accelerated sessions. All gate transitions triggered correctly.

---

### Phase P — Prestige System Redesign ✅ COMPLETE

**What:** Resolve the three implementation blockers in `docs/prestige-system-redesign.md` and produce an implementation-ready specification for Phase R.

**Design blockers resolved:**

**Blocker 1 — Shard economy:** Option C confirmed (Branch 0: reaction acceleration; Branch 1: automation infrastructure). Existing multipliers repositioned as Branch 0. Automation Infrastructure implemented as Branch 1.

**Blocker 2 — Blueprint cost order of magnitude:** Blueprint costs confirmed in the range of 30–200 shards each (Atmospheric Separator: 80, Carbon Scrubber: 150, Nitrogen Condenser: 100, Iron Smelter: 150, Sulfur Extractor: 80). Reactor Capacity slots: 30 (second) and 150 (third). Queue Buffer: 60 (first), 200 (extended).

**Blocker 3 — Construction material quantities:** All five module construction requirements specified with exact quantities. See Phase R deliverables for full list.

**Additional deliverables:**
- Big Bang route change: `user.generators` reset on Big Bang; `user.blueprints` survive unconditionally
- Prestige branch interface implemented with Branch 0 and Branch 1 sections
- `upgradeCosts` arrays per module (4 levels, energy + materials confirmed)

---

### Phase Q — Economy & Scarcity Overhaul ✅ COMPLETE

**What:** Design a progression economy capable of creating meaningful gates at each generation boundary, with specific attention to the Gen 5 gate mechanism.

**Deliverables (all resolved):**

- **Gen 5 gate mechanism:** Infrastructure pressure via Gen 4 material feedstock — Gen 5 reactions require Gen 4 outputs (Reactive Plasma Core, Quantum Substrate, Nuclear Fuel Pellet, Metallic Hydrogen) as reactants. Players without automation face meaningful feedstock constraints during multi-day Gen 5 synthesis windows.

- **Shard reward recalibration:** Formula adjusted to widen the gap between Tier 9 and Tier 12 payouts. `shardValue` fields on substances provide the correct per-substance weight. Gen 5 and Gen 6 shardValues specified (Gen 5: 18–55 per substance; Gen 6: 60–130 per substance).

- **Gen 5 shardValue specification:** All Gen 5 substance shardValues confirmed before B3 seeding. Full Gen 5 run yields approximately 450 total shards.

- **Economic wall definition:** Gen 5 gate is infrastructure pressure (feedstock throughput). Gen 6 gate is quantity scarcity + long reaction windows (48h–120h) making slot count a genuine critical-path factor.

- **Prestige progression arc:** Run 1 = taste of system. Run 5 = Gen 1–2 noticeably faster. Run 10 = spending most run time at Gen 4+. Run 20 = Gen 1–3 is warmup; automation is a genuine force multiplier.

**Known architectural issue:** Prestige saturation occurs during extended Gen 6 play (tree exhausts at approximately 1,930 shards, reachable after 3 Gen 5 runs + 1 Gen 6 run). Branch 2 (new capabilities: persistence, reactor specialization, discovery mastery) is the architectural solution. Branch 2 is deferred to a future phase.

---

### Phase R — Prestige Branch #1 Implementation (Automation Infrastructure) ✅ COMPLETE

**What:** Implement the two-layer Automation Infrastructure system as the first prestige branch, as specified in `docs/prestige-system-redesign.md`.

**Architecture:** Two-layer system confirmed by design.
- Layer 1 — Blueprint (permanent, shard-purchased, survives Big Bang)
- Layer 2 — Module construction (per-run, energy + Gen 4 materials, resets on Big Bang)

**Implemented modules:**

| Module | Produces | Construction Requires |
|---|---|---|
| Atmospheric Separator | Hydrogen, Oxygen | Energy + Hydrogen Gas + Oxygen Gas + Ammonia |
| Carbon Scrubber | Carbon | Energy + Carbon + Graphene + Carbon Nanotube |
| Nitrogen Condenser | Nitrogen | Energy + Nitrogen Gas + Ammonia + Aramid Fiber |
| Iron Smelter | Iron | Energy + Iron Oxide + Steel + Stainless Steel |
| Sulfur Extractor | Sulfur | Energy + Sulfur + Sulfuric Acid + Chrome |

Each module supports 5 upgrade levels. `upgradeRateMultiplier: 1.5` per level, `upgradeCapMultiplier: 1.1` per level (decoupled to make fill time decrease with level rather than remain constant).

**Hard constraints (from prestige-system-redesign.md §2, Non-Goals) — all upheld:**
- Automation never queues a reaction
- Automation never produces Gen 2+ compounds
- Automation cannot be constructed before Gen 4 materials are available in that run
- Automation never triggers discovery or experiments

**Checkpoint (Prestige Branch #1 validation — all verified):**
- Blueprint purchase persists through Big Bang ✅
- Module construction requires blueprint ownership ✅
- Module construction requires Gen 4 materials ✅
- Production writes to inventory only; synthesis queue unchanged ✅
- Big Bang resets all constructed modules; blueprints survive ✅
- Prestige branch UI presents Branch 0 and Branch 1 as distinct branches ✅

---

### Phase J1 — Economy Architecture (Design) ✅ COMPLETE

**What:** Define the economic wall for each generation boundary and produce the implementation-ready specification for Gen 5 gating.

**Deliverables (all complete):**
- Gen 5 gate mechanism: infrastructure pressure (Gen 4 feedstock as reaction inputs) confirmed
- IV (Intrinsic Value) methodology adopted as calibration tool for Gen 5–6 substance design
- Gen 5–6 shardValue assignments finalized
- Shard formula and quantity scarcity adjustments implemented in `calculateGenesisShards.js` and seed data

---

### Phase I — Long-Duration Synthesis ✅ COMPLETE (2026-06-05)

**What:** Synthesis times of 4–120 hours work correctly, persist through server restarts, and display correctly to the player with real-world calendar time.

**Implementation notes (completed 2026-06-05):**
- `pruneAfter` now scales as `completedAt + max(24h, effectiveReactionTime)` — `calcPruneWindow(effectiveReactionTimeSec)` helper in `completeReaction.js`. Entries for long syntheses remain visible long enough for offline players to see them; short reactions are unaffected (24h floor preserved).
- Big Bang now guards against in-flight queue entries. Server returns 409 `{ requiresConfirmation: true, activeEntries: N }` without `force=true`. `BigBangPanel` shows contextual forfeit warning during the confirm step; client passes `force=true` after confirmation.
- Long-duration synthesis is technically ready for all generations. `expectedCompletion` is a bare `Date` with no ceiling; snapshots are durable; per-user mutex and atomic claim are duration-agnostic.

**Deliverables:**
- Time display: for any synthesis over 24 hours, display estimated real-world completion time ("Completes Thursday at 11:42 PM") alongside the countdown
- Offline completion: a synthesis that completes while the player is offline is correctly resolved on reconnect
- Server restart safety: active queue entries survive server restart. Queue stored in DB with wall-clock completion timestamps.
- Validation test: use Phase G debug tooling to simulate a 48-hour synthesis at 100× speed, confirm it survives a server restart mid-synthesis and completes correctly

---

### Phase B3 — Gen 5 Design + Seeding + Validation ✅ COMPLETE (2026-06-05)

**What:** Design Gen 5 substance and reaction content (informed by Phase Q and Phase J1 decisions), seed it, and validate it end-to-end.

**Dependencies (all were met):**
- Phase Q: Gen 5 gate mechanism confirmed ✅
- Phase J1: Economy architecture and Gen 5 shardValues specified ✅
- Phase I: Long-duration synthesis queue is server-restart-safe ✅

**Note on previous scope:** Phase B3 previously seeded both Gen 5 and Gen 6 simultaneously. This was split because Gen 6 design benefited from observing whether the Gen 5 economic wall held, whether the prestige pacing was correct at Gen 5 timescales, and whether the Gen 5 substance graph required adjustments after initial playtesting.

**Deliverables (all complete):**
- ✅ Gen 5 substance design (dual-track + capstone; 9 substances)
- ✅ All 9 Gen 5 substances seeded (`server/seeds/seedSubstances.js`) with shardValues 18–55, unlockTiers, and unlocksUserTier gates
- ✅ All 9 Gen 5 reactions seeded (`server/seeds/seedReactions.js`) with reactants, products, conditions, and reaction times 8h–48h
- ✅ New Gen 5 conditions registered (`server/config/conditionRegistry.js`): `quantum_coherence` (from topological_insulator), `zero_point_field` (from superfluid_condensate), `nucleon_compression` (from chromodynamic_fiber)
- ✅ Shard projection validated against actual `calculateGenesisShards` formula: full Gen 5 run yields ~450 shards total
- ✅ Gen 5 full playthrough validated using Phase G debug tooling (time acceleration + inventory grants)
- ✅ Gen 5 economic wall validated: Gen 4 feedstock pressure confirmed; automation provides meaningful throughput improvement

**Implementation notes (2026-06-05):**
- Dual-track structure: Track A (topological_insulator → superfluid_condensate → bose_nova_remnant → quantum_vacuum_lattice) and Track B (photonic_crystal → chromodynamic_fiber → magnetar_filament → strangeon_matter), converging at axionic_condensate (T18 capstone)
- Tier gates: topological_insulator → T14, chromodynamic_fiber → T15, bose_nova_remnant → T16, quantum_vacuum_lattice → T17, axionic_condensate → T18
- All three Gen 5 conditions required simultaneously for the capstone reaction
- Countdown display updated: reactions ≥1h show `Xh XXm XXs` format

---

### Phase J2 — Economy Balancing (Tuning) ✅ Initial passes complete

**What:** Systematic numeric calibration across all six generations.

**Balancing passes completed:**
1. ✅ Gen 1–3 economy: verified after Phase R automation live; quantity scarcity applied
2. ✅ Gen 4 economy with automation: validated with Phase R automation operational
3. ✅ Gen 5 economy: validated after Phase B3 playthrough; shard yields and feedstock pressure confirmed
4. ✅ Gen 6 economy: validated after Phase B4 playthrough; confirmed three-slot critical path compression; prestige saturation at extended Gen 6 play identified (Branch 2 deferred)

**Ongoing:** Ongoing tuning continues during Phase U and Phase K without blocking progress. Branch 2 (new prestige capabilities) addresses the saturation issue and is deferred to a future design phase.

**What changes:** BEU costs, reaction times, production rates, shard formula constants. What does not change: the structural graph, substance names, reaction inputs/outputs, or generation assignments.

---

### Phase B4 — Gen 6 Design + Seeding + Validation ✅ COMPLETE (2026-06-05)

**What:** Design Gen 6 substance and reaction content (informed by Gen 5 observations), seed it, and validate end-to-end.

**Why deferred from B3:** Gen 6 design was informed by Gen 5 results. The Gen 5 economic wall, shard pacing, and feedstock pressure were all observed before Gen 6 content was committed. The Gen 6 reaction graph was specifically designed to address the one gap in Gen 5's architecture: Gen 5 had two parallel tracks (making 2 slots strongly beneficial but 3 slots only a buffer improvement); Gen 6 was required to have three simultaneous tracks, making Triple Reactor Array a critical-path improvement rather than a convenience.

**Deliverables (all complete):**
- ✅ Gen 6 theme: Entropic Horizons (10 substances; three-track seed → mid → output → capstone convergence)
- ✅ All 10 Gen 6 substances seeded: vacuum_crystallite, causal_diamond_fiber, cosmic_string_fragment (seeds, T18), holographic_substrate, planck_lattice, brane_filament (mids, T19), entropic_foam, graviton_condensate, moduli_condensate (outputs, T20/T21), spacetime_nexus (capstone, T22)
- ✅ All 10 Gen 6 reactions seeded with reactionKey, reactants, products, tiers, energy costs, and reaction times 48h–120h
- ✅ New Gen 6 conditions registered: `holographic_encoding` (from holographic_substrate), `metric_tension` (from planck_lattice), `causal_isolation` (from brane_filament)
- ✅ Three-track convergence validated: all three tracks must complete before spacetime_nexus is accessible
- ✅ Triple Reactor Array materially improves critical path: 3× speedup vs 1-slot serialization across three 48h+ parallel tracks
- ✅ Gen 6 full playthrough validated using admin tools: T18→T19→T20→T21→T22→T23→T24 progression confirmed
- ✅ Tier progression bug fixed: T20/T22 skip resolved — `resolveQueue` now sorts batch completions by `productUnlocksUserTier` ascending; client WS handler loops through intermediate tiers
- ✅ Seed validation passes on complete Gen 1–6 content: 67 substances, 67+ reactions, zero errors

**Design constraint (locked and met):**  
Gen 6 contains a genuine 3-track dependency section where three independent synthesis tracks must all be completed before progression can continue. Triple Reactor Array is a critical-path improvement at this point. In Gen 5, two parallel tracks made 2 slots strongly beneficial; Gen 6 corrects the gap: three simultaneous 48h+ tracks make the third slot mandatory for any player who does not want to serialize them.

---

### Phase U — UX & Discovery Overhaul ← CURRENT ACTIVE PHASE

**What:** Redesign the UI and discovery systems to support a six-generation game. The content arc is complete; the player experience is not.

**Why this phase is necessary now:** Gen 5 and Gen 6 have been validated technically. The blockers to a real player experiencing the full game are not content gaps — they are usability and discovery gaps. Substance names are too long for current panels. The objective system was patched through T24 but was not architected for multi-generation depth. Discovery through the Experiments panel requires blind enumeration of reactant combinations — feasible at Gen 1–3, impractical at Gen 5–6 complexity. These are all structural issues, not cosmetic ones.

**Sub-phases:**

**A. UI Architecture Review**
- Audit substance name presentation across all panels (inventory, queue, experiments, notebook)
- Design a scalable approach to long-name handling (truncation strategy, symbol display, tooltip anchoring)
- Audit layout scalability across generation scaling (Gen 6 substance lists, reaction condition lists)
- Evaluate information density: what is visible at a glance vs. what requires interaction
- Produce a UI architecture recommendation before implementing fixes

**B. Objective System Revision**
- Current state: `getCurrentGoal()` was patched to cover T0–T24 with single-line directional strings. This is functional but shallow.
- Desired state: objective guidance that responds to the player's actual progress within a tier, not just which tier they are at. A player at T13 who has built topological_insulator but not photonic_crystal should receive different guidance than one who has neither.
- Inventory-aware objective logic: use `hasProduced()` checks at each tier to branch guidance
- Multi-generation awareness: the system must understand that Gen 5 has two tracks and Gen 6 has three, and guide accordingly
- Non-spoilery: guidance should orient without revealing exact recipes

**C. Discovery & Experiment Redesign**
- Current state: Experiments panel presents ingredient slots; player guesses combinations. Works for Gen 1–2 (2–3 ingredient recipes, no conditions). Breaks at Gen 5–6 (4–5 ingredient recipes, multiple conditions required, 60+ substances in scope).
- Required: a discovery system that allows players to reason toward correct combinations
- Options to evaluate: hint tiers (unlock more specific hints over time), category filtering (ingredients from the same generation), condition-narrowing (show only recipes that would be gated by current conditions), partial match feedback (X of Y ingredients correct)
- Do not implement a full recipe reveal. The discovery tension is the game.
- Improve notebook/discovery feedback: when a reaction is discovered, what information is surfaced immediately vs. over time?

**D. Progression Visibility**
- Players currently have no clear view of what generation they are in, what tier they are at, or what the next gate substance is
- Add generation state indicator (Gen 1 through Gen 6, with current tier)
- Add "next milestone" visibility: what tier-unlocking synthesis is the next goal
- Improve visibility into unlocked conditions and their prerequisites
- Do not reveal the full reaction graph — maintain the discovery mechanic while eliminating disorientation

**E. Information Architecture Audit**
Audit each panel for information density, navigability, and generation-appropriate presentation:
- **Inventory** — grouping by generation, symbol/name legibility at scale
- **Queue** — long substance name truncation, multi-slot layout
- **Reactor** — core interaction remains primary; UI panels should not visually compete
- **Notebook** — discovery log readability at 50+ entries
- **Objectives** — depth and inventory-awareness (see sub-phase B)
- **Prestige** — Branch 0 and Branch 1 legibility; upgrade cost/effect at a glance
- **Automation** — generator status, production rate, cap visibility

**Prerequisite for Phase K:** Phase K (reactor evolution) calibrates visual and language state changes to specific generation transitions. It requires a stable UI context to test against. Phase U establishes that stable context.

**Test:** A new playthrough from Gen 1 with no prior knowledge. At every tier transition, the objective system should orient the player toward the correct next action without revealing the recipe. At Gen 5 entry, the discovery system should provide enough scaffolding for a patient player to find the first Gen 5 synthesis. At Gen 6 entry, the three-track structure should be legible from the UI.

---

### Phase K — Reactor Evolution

**What:** The reactor's visual state, notification language, and UI language evolve as the player progresses through generations.

**Prerequisite:** Phase U complete. Phase B4 complete (content frozen). Visual and language transitions calibrate to specific substance names and generation boundaries that cannot change after implementation.

Deliverables:
- Generation-state tracking: client knows which generation the player is in
- Visual states per generation: defined, implemented, tested
- Notification language per generation: Gen 1 ("Synthesis complete. New reactions unlocked.") vs. Gen 6 ("Spacetime Nexus — confirmed.")
- UI language shift for Gen 6 completions: drop "synthesis complete" framing, use "[Substance] — [status]"
- Gen 6 visual quieting: reactor becomes more still as it becomes more powerful

**Test:** Playthrough from Gen 1 to Gen 6 using Phase G debug tooling. Verify visual and language state changes at each generation transition feel distinct and correct.

---

### Phase L — Save Hardening and Polish

**What:** The game survives server restarts, database migrations, and extended play sessions without corruption. UI polish, onboarding, and final balance passes.

Deliverables:
- Migration versioning: schema changes have migration scripts, not destructive re-seeds
- Long-duration reaction anti-corruption: if a reaction's expected completion time is in the past on reconnect, it completes with correct retroactive inventory update (not lost)
- Onboarding flow: first-run experience, tooltip guidance for Gen 1
- Tutorial: guide to the reactor core interaction, first synthesis, first notebook entry
- Final balance pass: all generations verified with blind playtester
- Performance audit: WebSocket reconnect behavior, Three.js memory management, MongoDB query patterns

---

## Part 5 — Risk Analysis

---

### Risk 1 — Prestige Economy Misalignment (HIGH — mitigated)
**What:** The prestige system is redesigned but the specific shard reward calibration decisions are not made rigorously in Phase Q before Gen 5 content is designed. Gen 5 seeding assumes an economic gate that does not hold in practice.

**Consequence:** Gen 5 is reachable without prestige on run 1. The prestige loop fails to sustain engagement.

**Mitigation:**
- Phase Q deliverables included a specific, testable definition of the Gen 5 economic gate
- Phase B3 validation included an explicit test: zero-prestige fresh account blocked by feedstock pressure
- Gen 5 gate mechanism (infrastructure pressure via Gen 4 feedstock) held as designed

**Resolution (2026-06-05):** Gen 5 and Gen 6 both validated through admin playthroughs. The economic gates held. Prestige saturation was identified as a late-game concern (after 3+ Gen 5 runs) and deferred to Branch 2. This risk is substantially mitigated for the current content arc.

---

### Risk 2 — Long-Duration Synthesis Queue Corruption (HIGH — mitigated)
**What:** Gen 5–6 synthesis times are 24–120 hours. If a server restart corrupts the queue — or a schema migration truncates `activeQueue` — a player loses 24–72 hours of real time.

**Consequence:** Player trust destroyed. Unrecoverable without manual intervention.

**Mitigation:**
- Queue entries stored in MongoDB with wall-clock timestamps (implemented in Phase C)
- Queue entries are immutable once created: the only mutation is status transition to `completed`
- Migration scripts must explicitly handle `activeQueue` entries — never drop the field or collection
- At every schema migration checkpoint: verify active queues survive the migration in a staging environment

**Test point:** Phase I completion (verified). Automated test: queue a synthesis, deliberately crash the server, restart, verify queue survives.

---

### Risk 3 — Conditions System Complexity Explosion (MEDIUM-HIGH — resolved)
**What:** The conditions system starts with 9 conditions (Gen 1–4) and ends with 15+ conditions (Gen 6). If conditions are implemented as per-reaction logic rather than as a reactor capability registry, each new condition requires new code.

**Consequence:** Gen 5–6 conditions are either not implemented or implemented with hacks.

**Resolution (2026-06-05):** Gen 5 added 3 conditions and Gen 6 added 3 conditions — all as `conditionRegistry.js` config entries with zero new validation code. The architecture was validated correct through Gen 6. 15 conditions are registered and enforced; adding future conditions requires only a config entry.

---

### Risk 4 — Progression Deadlock (MEDIUM)
**What:** A player gets into a state where they have the recipe, the reactants, and the correct tier, but a bug prevents synthesis completion — and they are stuck.

**Consequence:** Recovery requires admin intervention or a save reset.

**Mitigation:**
- Gate substances have `discoveredByDefault: true`
- Queue completion is idempotent (atomic `processing → resolving → completed` transition)
- Phase G debug tooling allows admin inventory/tier adjustment for recovery

**Test point:** Phase D completion. Simulate every Gen 1→Gen 2→Gen 3 gate transition. Each should complete without deadlock.

---

### Risk 5 — Gen 5–6 Pacing Failure (MEDIUM — partially mitigated)
**What:** Long synthesis windows in Gen 5–6 (24–120 hours) leave the player with nothing to do while waiting.

**Consequence:** Late-game retention failure. The game's most ambitious content is never reached by most players.

**Mitigation:**
- Automation infrastructure (Phase R) ensures Gen 1 feedstock production runs during long synthesis windows
- Multi-slot prestige unlocks (Expanded Reactor Bay, Triple Reactor Array) allow parallel synthesis across tracks
- Queue buffer allows pre-queuing the next synthesis

**Current state:** Gen 5 and Gen 6 have been validated through admin playthroughs. The parallel-track design of Gen 6 (three tracks that can run simultaneously with Triple Reactor Array) directly addresses the "nothing to do while waiting" problem for progressed players. Pacing for a real first-run player is not yet validated — that is a Phase L (blind playtester) concern.

---

### Risk 6 — Automation Implemented Before Prestige Architecture Is Decided (HIGH — resolved)
**What:** If Phase R implementation begins before Phase P resolves the three design blockers, the implementation will be built against an unconfirmed architecture and require refactoring.

**Resolution (2026-06-05):** Phase P preceded Phase R structurally. All three blockers were resolved before Phase R implementation began. Automation was implemented against the confirmed branch architecture and has been validated through Gen 5 and Gen 6 playthroughs. This risk is closed.

---

### Risk 7 — Content Graph Bugs in Seed Data (MEDIUM — mitigated through Gen 6)
**What:** The seed data has 67+ substances and 67+ reactions with complex cross-references. A single incorrect reactant reference silently corrupts the progression graph.

**Consequence:** A reaction is unreachable (wrong tier), consumes the wrong substance, or has no product.

**Mitigation:**
- Seed validation script runs on every seed: verifies no dangling references, all unlock tiers consistent, no circular dependencies
- Full admin playthroughs of Gen 5 and Gen 6 validated the complete graph end-to-end
- Three graph corrections were applied during Gen 6 design before seeding (AC cascade bug, HS double-consumption, redundant VC in entropic_foam)

**Current state:** Seed validation passes on complete Gen 1–6 content with zero errors. Content is frozen after Phase B4.

---

## Part 6 — Checkpoint Structure

Avoid "build everything then test." Test at each era boundary.

---

### Checkpoint 1 — Gen 1–3 Content Validity ✅ COMPLETE (End of Phase B1)

---

### Checkpoint 2 — Gen 1 Playthrough ✅ COMPLETE (End of Phase D, Gen 1 only)

---

### Checkpoint 3 — Full Gen 1→Gen 3 Playthrough ✅ COMPLETE (End of Phase E)

---

### Checkpoint 4 — Conditions Engine + Gen 4 Validation ✅ COMPLETE (End of Phase F + Phase B2)
**Verified:**
- Gen 1–3 and Gen 4 conditions enforced correctly
- Gen 4 full playthrough: Reactive Plasma Core and Nuclear Fuel Pellet reachable
- Phase G complete: full debug suite operational

---

### Checkpoint 5 — Debug Tooling Complete (End of Phase G) ✅ COMPLETE
**Verified:**
- Inventory grant: admin can add any substance × quantity to any player inventory
- Tier set: admin can set player unlockTier to any value instantly
- Time acceleration: synthesis timers compress by the configured multiplier
- Full Gen 1→Gen 6 playthrough performed in accelerated sessions using complete debug suite

---

### Checkpoint 6 — Prestige Architecture Confirmed (End of Phase P) ✅ COMPLETE
**Verified:**
- Shard economy option confirmed (Option C: Branch 0 + Branch 1)
- Blueprint cost range confirmed (30–200 shards per module)
- Construction material quantities per module specified and implemented
- Prestige branch UI approved and implemented
- Big Bang route change complete (generators reset, blueprints survive)

---

### Checkpoint 7 — Economy Architecture Confirmed (End of Phase Q) ✅ COMPLETE
**Verified:**
- Gen 5 gate mechanism specified and implemented (Gen 4 feedstock infrastructure pressure)
- Shard reward calibration targets documented and applied
- Gen 5 shardValues specified and seeded
- Prestige progression arc targets documented

---

### Checkpoint 8 — Prestige Branch #1 Operational (End of Phase R) ✅ COMPLETE
**Verified:**
- Blueprint purchase persists through Big Bang
- Module construction requires Gen 4 materials (cannot construct in Gen 1–3)
- Production writes to inventory only; synthesis queue is unchanged by automation
- Big Bang resets all constructed modules; blueprints survive
- Prestige branch interface presents Branch 0 and Branch 1 correctly
- Gen 1–4 economy re-validated with automation active

---

### Checkpoint 9 — Long-Duration Survival Test (End of Phase I) ✅ COMPLETE
**Verified (2026-06-05):**
- Queue infrastructure handles arbitrary durations — `expectedCompletion` is duration-agnostic
- `pruneAfter` scales with reaction duration (`max(24h, effectiveReactionTime)`)
- Big Bang guards in-flight queue entries (server 409 backstop + client forfeit warning)
- Offline completion delivery is duration-agnostic (pendingNotifications buffer, lazy resolution on reconnect)

---

### Checkpoint 10 — Gen 5 Technical Completion (End of Phase B3) ✅ COMPLETE (2026-06-05)
**Verified:**
- ✅ Gen 5 seed runs clean: 9 substances inserted, 9 reactions inserted, 0 errors
- ✅ Gen 5 conditions registered and enforced: `quantum_coherence`, `zero_point_field`, `nucleon_compression`
- ✅ Gen 5 full playthrough using time acceleration: T12→T13→T14→T15→T16→T17→T18 confirmed
- ✅ Gen 5 economic wall observation: Gen 4 feedstock pressure confirmed; automation meaningfully reduces Gen 5 wait time

---

### Checkpoint 11 — Full Gen 1→Gen 6 Technical Completion (End of Phase B4) ✅ COMPLETE (2026-06-05)
**Verified:**
- ✅ Player account advanced through all six generations using Phase G debug tooling
- ✅ All Gen 6 substances synthesizable
- ✅ Spacetime Nexus synthesis completes correctly
- ✅ T18→T19→T20→T21→T22→T23→T24 gate chain confirmed (tier skip bug resolved)
- ✅ No database corruption at any point in the accelerated playthrough
- ✅ Seed validation passes: 67 substances, 67+ reactions, 15 conditions, 0 errors

---

### Checkpoint 12 — Economy Final Balance (End of Phase J2)
**Initial passes complete.** Ongoing calibration continues through Phases U, K, and L.

**Target pacing ranges:**
- Gen 1: new player reaches Gen 2 in approximately 30–60 minutes of active play
- Gen 2: player reaches Gen 3 in approximately 2–4 hours of active play
- Gen 3: player reaches Gen 4 gate in approximately 1–2 weeks of casual play
- Gen 4: player reaches Gen 5 gate in approximately 1–2 months of casual play (first prestige likely required)
- Gen 5: player reaches Gen 6 gate in approximately 1–3 months of casual play
- Gen 6: Spacetime Nexus completes approximately 1–3 months after Gen 6 entry

---

### Checkpoint U — UX & Discovery Overhaul Complete (End of Phase U)
**What to verify:**
- UI legibility: all substance names, condition names, and reaction names are readable at all panel sizes
- Objective depth: at each tier, `getCurrentGoal()` responds to the player's actual inventory state, not just tier number
- Discovery scaffolding: a player at Gen 5 entry can reason toward the first Gen 5 synthesis using available hints
- Information architecture: each panel presents the right information at the right depth; no panel is information-overloaded
- Progression visibility: at any point in a run, the player can identify which generation they are in and what the next gate substance is

**Gate:** Do not begin Phase K (reactor evolution) until this checkpoint passes. Phase K visual and language calibration requires a stable UI context.

---

### Content Freeze Checkpoint — Before Phase K (Reactor Evolution)
**Status: ✅ Met.** Phase B4 is complete. No new substances, reactions, conditions, or generation content will be added after this point. The content graph is frozen.

**Why:** Reactor evolution (visual, audio, language) calibrates to specific generation transitions and specific substance names. Content changes after evolution is implemented require re-testing every transition.

---

## Part 7 — Philosophy Preservation

This section contains constraints that **must not be violated** by any future implementation decision.

---

### Constraint 1 — The Reactor Is the Game
The reactor is not a background widget. It is not a timer display. It is the central interactive object.

**Violation pattern:** Feature requests for non-reactor activities — collection screens, crafting trees, skill trees, upgrade panels — given equal visual weight to the reactor.

**Guard:** Every new UI surface is evaluated: does it help the player interact with the reactor, or does it become a second game inside the game?

---

### Constraint 2 — Anti-Encyclopedia Design
Substances are not information sources. They are things the player made.

**Violation pattern:** A "substance detail screen" with physical properties, historical context, electron configuration diagrams — an encyclopedia, not a reactor.

**Guard:** Each substance has exactly one piece of information beyond its name: the `hintText`. One line. What the reactor tells you.

---

### Constraint 3 — Synthesis Queue Is Player-Driven, Not Automated
The player queues every synthesis. No system, no automation module, no trigger queues a synthesis on the player's behalf.

**What automation does:** Automation Infrastructure (Phase R) writes produced elements directly to inventory. It does not interact with the synthesis queue at any point.

**What automation does not do:** Automation never queues a reaction. Never triggers discovery. Never advances a tier. The synthesis queue has exactly one entry point: the player explicitly selecting a reaction and pressing queue.

**Violation pattern:** "Quality of life" automation that watches inventory and auto-queues a synthesis when reactants are available. Or automation being extended to queue Gen 2+ compound synthesis.

**Guard:** The synthesis queue entry point is architecturally singular. Any PR adding a second entry point is rejected. This is the most important guard in the codebase.

---

### Constraint 4 — Conditions Are Physical Requirements, Not Flavor Text
A reaction with `conditions: ["plasma_state"]` cannot execute if the reactor does not have `plasma_state` capability. Hard block, not a visual label.

**Violation pattern:** Implementing conditions as cosmetic tags that display in the UI but don't validate at queue time.

**Guard:** Checkpoint 4 (already passed). If a reaction with an unmet condition can be queued, the enforcement is broken.

---

### Constraint 5 — Emotional Pacing Is Not Negotiable
Synthesis times are not placeholder values to be tuned down when playtesters say things feel slow.

**Violation pattern:** "Gen 3 feels slow — can we halve the synthesis times?" halved because it makes the tester happy.

**Guard:** Economy balancing changes must be justified against the pacing targets. A change to synthesis times requires a written justification accounting for downstream effect on generation completion time.

---

### Constraint 6 — Gen 6 Scarcity Philosophy
Gen 6 substances are artifacts, not resources. They are synthesized once. They are not mass-produced. They are not automated.

**Violation pattern:** Extending automation scope to produce Gen 5+ substances passively.

**Guard:** Automation scope is bounded at Gen 1 raw elements. Every extension of automation scope must be evaluated against this constraint explicitly, in writing, before implementation.

---

### Constraint 7 — Myth Through Physics, Not Through Magic
The game's escalation from chemistry to cosmic alchemy must remain scientifically grounded at every step.

**Violation pattern:** Future content additions introducing substances with non-physics-adjacent names because "they sound cool."

**Guard:** The game is complete at Gen 6. There is no Gen 7. Spacetime Nexus is the end.

---

### Constraint 8 — The Ending Is Stillness
The Spacetime Nexus completion notification is quiet. No fanfare. No victory screen. The reactor synthesizes a piece of the fabric of spacetime and becomes still.

**Violation pattern:** A completion screen with animation and "You did it!" text.

**Guard:** The completion experience aligns with the game's tonal thesis: the reactor does not celebrate. It simply reaches the end of what is possible.

---

### Constraint 9 — Automation Is Prestige Infrastructure, Not an Idle-Game Feature
Automation modules are not convenience features that passively remove clicking. They are permanent capabilities the reactor earns across Big Bang cycles. They are purchased with Genesis Shards (permanent) and constructed with Gen 4 materials (per-run). They require reaching Gen 4 in a given run before they can be activated.

**Violation pattern:** Implementing automation as a midgame unlock (available before first Big Bang). Framing automation as "reducing clicking." Treating automation as a quality-of-life feature rather than a prestige infrastructure investment.

**Guard:** Automation modules cannot be constructed without a blueprint. Blueprints require Genesis Shards. Genesis Shards are earned only through Big Bang. Therefore: zero Big Bangs = zero blueprints = zero automation. This is structural. If any implementation path allows automation before a Big Bang has occurred, it violates this constraint.

---

## Appendix — Model Change Summary

Quick reference for the schema changes made across all phases. Where the implemented field name differs from the original spec, the actual name is shown.

### Reaction model additions:
```
reactionKey: { type: String, required: true, unique: true, index: true }
generationTier: { type: Number, required: true, min: 1, max: 6 }
// conditions: changed from { type: Object } to:
conditions: { type: [String], default: [] }
// reactionType enum: "standard_synthesis" added
```

### Substance model additions:
```
// Implemented as substanceKey (not reactionKey — substanceKey is the correct name for a substance identifier)
substanceKey: { type: String, required: true, unique: true, index: true }
generationTier: { type: Number, required: true, min: 1, max: 6 }
hintText: { type: String }
fantasyWeight: { type: Number, min: 1, max: 5 }
// type enum: "artifact" added (also "material" for intermediate Gen 3+ substances)
```

### User model additions (all implemented):
```
// Implemented as inventory array (not substanceInventory Map) — array form required for
// MongoDB .populate() support. Functionally equivalent.
inventory: [{
  substance: { type: ObjectId, ref: 'Substance', required: true },
  quantity:  { type: Number, required: true, min: 0 }
}]

// discoveredReactions not implemented as an explicit field.
// Discovery is handled implicitly: reactions have discoveredByDefault: Boolean,
// and queue entries carry wasDiscovery: Boolean.

// Implemented as unlockTier (not unlockedTier)
unlockTier: { type: Number, default: 0 }

activeQueue: [{
  reaction:           { type: ObjectId, ref: 'Reaction' },
  reactionKey:        { type: String, required: true },
  slot:               { type: Number, default: 0 },
  startTime:          { type: Date, required: true },
  expectedCompletion: { type: Date, required: true },
  completedAt:        { type: Date, default: null },
  pruneAfter:         { type: Date, default: null },
  status:             { type: String, enum: ['processing', 'resolving', 'completed', 'failed'], default: 'processing' },
  claimedAt:          { type: Date, default: null },
  reactantsConsumed:  { type: Boolean, default: false },
  revealOnCompletion: { type: Boolean, default: false },
  wasDiscovery:       { type: Boolean, default: false },
  snapshot: {
    reactionName, energyCost, productKey, productName,
    productQuantity, productUnlocksUserTier, reactants: [{ substanceKey, name, quantity }]
  }
}]

// Per-user reactor capability set.
reactorCapabilities: { type: [String], default: [] }

// Added in Phase R (implemented):
blueprints: [{ blueprintKey: String, level: Number, purchasedAt: Date }]
generators: [{ moduleKey: String, level: Number, constructedAt: Date, lastTick: Date, pausedAt: Date | null }]
lastActiveAt: { type: Date }

// Added in Phase R (pending notifications — implemented):
pendingNotifications: [{
  type:        { type: String },
  payload:     { type: Object },
  createdAt:   { type: Date },
  deliveredAt: { type: Date, default: null }
}]
```
