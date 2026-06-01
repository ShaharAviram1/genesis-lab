# Genesis Lab — Implementation Roadmap

**Version:** 1.4  
**Status:** Active Implementation — Prestige & Economy Foundation Phase  
**Date:** 2026-06-01  
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
> **New critical path:**
> Phase G completion → Phase P → Phase Q → Phase R → Phase J1 + Phase I (parallel) → Phase B3 → Phase J2 → Phase B4 → Phase K → Phase L
>
> **Recommended next implementation target:**  
> **Phase G completion** (inventory grant, tier set, time acceleration multiplier — the three remaining debug endpoints). Phase G is a hard prerequisite for Phase Q economy work and for all late-generation testing. It must be finished before the prestige and economy design phases can be validated with real playthrough data.

---

## Preamble — The Current State

Genesis Lab has a working technical foundation:

**Built and functional:**
- Authentication (login/register, session management)
- Reactor visual layer (Three.js/R3F, rings, motes, bloom, GLB core, Big Bang sequence)
- WebSocket reactor simulation (activity, decay, energy tick loop)
- Reaction execution (queued reactions, energy deduction)
- Experiments panel (reaction discovery surface)
- Notebook/history (reaction log)
- Progression skeleton (unlockTier, discoveredByDefault fields)
- MongoDB models (Substance, Reaction, User)
- Gen 1–3 content (31 reactions, full substance graph, seeded and playtested)
- Runtime isolation per user (WebSocket sessions)
- Polished reactor identity (animations, effects, UI)
- **Persistent synthesis queue** — `activeQueue` schema with full snapshot, `resolveQueue`, `completeReaction`, `pruneCompletedEntries`; all routes centralized
- **Reaction timing enforcement** — Gen 1–3 `reactionTime` values applied; server enforces timing via `expectedCompletion`; zero-duration path completes in-process
- **Queue WebSocket events** — `synthesis_queued`, `synthesis_completed`, `synthesis_discovered`, `synthesis_failed`, `queue_state`
- **QueuePanel** — countdown display, reactor occupied state, unknown synthesis label
- **Unlock orchestration (Gen 1–3)** — `unlockTier` advances at completion via `snapshot.productUnlocksUserTier`; tier gating enforced across all routes
- **Offline completion delivery** — `pendingNotifications` with `deliveredAt`; HTTP routes create pending notifications when user is offline; WS connect drains and marks delivered exactly once; no replay
- **Atomic double-completion hardening** — Stage 12; `processing → resolving → completed/failed` atomic claim via `findOneAndUpdate` + `$elemMatch`; stale resolving recovery after 30s; multi-tab WS sync fixed (all sockets per username share one session `Set`)
- **Dev/admin debug tooling** — Stage 13; queue inspect, fast-forward `expectedCompletion`, capability grant/revoke, delivered notification cleanup; double-gated (`NODE_ENV !== production` AND `DEV_ADMIN_ENABLED=true`)
- **Conditions enforcement engine (Phase F)** — `conditionRegistry.js` (9 conditions: 5 substance-based, 4 tier-based), `validateConditions.js`, `evaluateCapabilityUnlocks.js` (tier-crossing semantics); wired at queue start in reactions.js and reactorRuntime.js; `reactorCapabilities: [String]` on User model; UI enforcement in SelectedReactionPanel (Reactor Requirements section, lacks-capability status, collapsible Reactor Capabilities panel)
- **Gen 4 content seeded (Phase B2)** — 8 substances (Tier 9–12 gate progression: graphene→9, lithium_ion_cell→10, hydrogen_plasma→11, nuclear_fuel_pellet→12), 8 reactions with full conditions enforcement; 48 total substances, 39 total reactions; Gen 4 full playthrough validated

**Not yet built (full scope):**
- **Debug tooling completion (Phase G)** — inventory grant, tier set, and time acceleration multiplier endpoints are missing; queue inspect, fast-forward, capability grant/revoke, and notification cleanup are operational
- **Prestige system redesign (Phase P)** — shard economy recalibration, prestige branch architecture implementation-ready spec, Big Bang route redesign
- **Economy & scarcity overhaul (Phase Q)** — economic wall design for generation boundaries, Gen 5 gate mechanism specification, shard reward calibration
- **Automation infrastructure as prestige branch (Phase R)** — blueprint purchase system, module construction engine, prestige branch UI (replaces the current Upgrades panel)
- Long-duration synthesis (Phase I) — synthesis times 4–72 hours, multi-hour persistence testing
- Economy architecture design (Phase J1) — precedes Gen 5 seeding
- Gen 5 design and content seeding (Phase B3)
- Economy balancing (Phase J2)
- Gen 6 design and content seeding (Phase B4)
- Reactor evolution (Phase K)
- Save/persistence hardening (Phase L)
- Onboarding and tutorial

The transition from this state to the designed game requires disciplined sequencing. Every major system depends on prior systems. Build out of order and you will re-build.

---

## Part 1 — Implementation Eras

Eight eras, sequential. Each era produces a testable, playable checkpoint.

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

### Era IV — Conditions, Debug Tooling & Gen 4 Content ✅ COMPLETE (Phase G partially complete)
**Deliverable:** Conditions are enforced at synthesis queue time. Core debug tooling is operational (4 of 8 endpoints). Gen 4 content is seeded and reachable through a correctly gated, conditions-blocked playthrough.

**Phase G in progress:** Three debug endpoints remain (inventory grant, tier set, time acceleration). Phase G completion is the single prerequisite for everything that follows.

---

### Era V — Prestige & Economy Foundation
**Duration estimate:** 6–10 weeks  
**Deliverable:** The prestige system is redesigned with a branch architecture, the economy is calibrated to support meaningful progression walls, and Automation Infrastructure is implemented as the first prestige branch (Phase R). A player on their second or later run experiences automation infrastructure at Gen 4 that their first run did not have.

**Why this era must precede Gen 5:** Without a designed economic wall for Gen 5, seeding Gen 5 content produces reactions that are reachable on a first run. Without a redesigned prestige system, automation is implemented in isolation and must be refactored when the branch architecture is defined. Without economy architecture, Phase J2 balancing has no targets to balance toward.

**Phases in this era:** G (completion), P, Q, R.

---

### Era VI — Long-Duration Synthesis & Gen 5 Content
**Duration estimate:** 5–8 weeks  
**Deliverable:** Synthesis times of 4–72 hours are stable and server-restart-safe. Gen 5 design is complete, content is seeded, and Gen 5 is technically reachable. Economy balancing for Gen 5 is underway.

**Why Long-Duration Synthesis moves here:** Phase I (long-duration synthesis) was previously placed before automation. That ordering assumed automation was a midgame feature that needed to exist before Gen 5 timescales. Under the revised architecture, automation is post-Big-Bang prestige infrastructure. Phase I is a prerequisite for Gen 5 seeding, not for automation. Moving it here reflects that correct dependency without disrupting Gen 5 sequencing.

**Phases in this era:** J1, I, B3, J2 (first pass).

---

### Era VII — Gen 6 Content
**Duration estimate:** 3–5 weeks  
**Deliverable:** Gen 6 design is complete (informed by Gen 5 observations), content is seeded, Gen 6 is technically reachable, economy balancing covers all six generations.

**Why Gen 6 is its own era:** Gen 6 should be designed after observing the results of Gen 5 in practice — particularly whether the Gen 5 economic wall held, whether the shard economy paced correctly, and whether the prestige branch investments provided the right quality of run compression. Designing Gen 6 before Gen 5 is observed repeats the errors that created the current design debt.

**Phases in this era:** B4, J2 (Gen 6 pass), K.

---

### Era VIII — Polish, Balancing, and Finalization
**Duration estimate:** 4–8 weeks  
**Deliverable:** The game is content-complete, pacing-balanced, visually evolved across generations, save-hardened, and ready for a real player to experience Gen 1 through Gen 6.

**Phases in this era:** L (save hardening, onboarding, final balance, performance audit).

---

## Part 2 — Immediate Next Steps

The following steps were the founding implementation sequence. They are preserved as historical record. All three are complete. The current active sequence begins at Phase G completion — see Part 4.

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
            │                               └── Debug & test tooling (Phase G) ← IN PROGRESS
            │                                       │
            │                                       └── Phase P: Prestige System Redesign
            │                                               │
            │                                               └── Phase Q: Economy & Scarcity Overhaul
            │                                                       │
            │                                                       └── Phase R: Prestige Branch #1 (Automation)
            │                                                               │
            │                                                               ├── Phase J1: Economy Architecture (design)
            │                                                               │       │
            │                                                               │       └─── Phase I: Long-Duration Synthesis ──┐
            │                                                               │                                               │
            │                                                               └──────────────────────────────────────────────┘
            │                                                                               │
            │                                                                       Phase B3: Gen 5 Design + Seeding
            │                                                                               │
            │                                                                       Phase J2: Economy Balancing (Gen 5)
            │                                                                               │
            │                                                                       Phase B4: Gen 6 Design + Seeding
            │                                                                               │
            │                                                                       Phase J2: Economy Balancing (Gen 6)
            │                                                                               │
            │                                                                       Phase K: Reactor Evolution
            │                                                                               │
            │                                                                       Phase L: Save Hardening + Polish
```

**Critical path summary:**

- **Phase G completion is the immediate blocker.** Inventory grant, tier set, and time acceleration are hard prerequisites for both economy validation work and accelerated playthrough testing.
- **Phase P before Phase R:** The prestige branch architecture must be decided before the automation implementation begins. Implementing automation against an undecided architecture produces code that requires refactoring.
- **Phase Q before Phase B3:** The Gen 5 economic gate mechanism must be specified before Gen 5 content is designed. Seeding Gen 5 reactions before knowing what creates the Gen 5 wall produces content that may require re-seeding.
- **Phase J1 before Phase B3:** Economy architecture (design) must precede Gen 5 seeding. Gen 5 substance and reaction design depends on knowing what the economic wall looks like.
- **Phase I before Phase B3:** Server-restart-safe long-duration synthesis must exist before 24–72 hour reactions are seeded into the database.
- **Phase B4 after observing Phase B3:** Gen 6 is explicitly designed after Gen 5 results are known. No Gen 6 content is committed before Gen 5 is playtested.
- **Phase B4 complete before Phase K:** Reactor evolution (visual, audio, language) calibrates to specific generation transitions. Content must be frozen before evolution is implemented.
- **Phase L last:** Save hardening and corruption guards require all long-duration synthesis vectors to exist before they can be defended.

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

### Phase D — Unlock Orchestration ✅ COMPLETE for Gen 1–3 (via queue completion)
**What:** Implement milestone-based tier gating. Synthesis of a gate substance unlocks the next tier.

**Status note:** Tier gating is fully functional for Gen 1–3 via the queue system. `completeReaction` advances `user.unlockTier` using `snapshot.productUnlocksUserTier` on first production of a gate substance. Routes enforce `unlockTier` gating. WS completion events carry `prevUnlockTier`/`newUnlockTier`. Gen 4+ gate transitions validated as part of Phase B2/F work.

Deliverables:
- Gate substance definitions stored in config or DB, not hardcoded in logic
- On reaction completion: check if product is a gate substance → if so, evaluate tier advance
- Tier advance: new reactions become discoverable (via `discoveredByDefault` flag and `unlockTier` gating)
- Client receives tier-unlock notification via WebSocket, UI reflects newly available reactions

Gate definitions from the design:
- Tier 1→4 (Gen 1→Gen 2): synthesize Iron Oxide + Ammonia
- Tier 4→7 (Gen 2→Gen 3): synthesize Bronze + Sulfuric Acid
- Tier 7→9 (Gen 3→Gen 4): synthesize Steel + Lithium-Ion Cell
- Tier 9→13 (Gen 4→Gen 5): TBD in Phase Q (Gen 5 gate mechanism unspecified until economy overhaul)
- Tier 13→17 (Gen 5→Gen 6): TBD in Phase B4

**Test:** Fresh account, play Gen 1. Attempt to queue a Gen 2 reaction — blocked. Synthesize Iron Oxide. Synthesize Ammonia. Gen 2 reactions appear. Verify each gate transition.

---

### Phase E — Reaction Time Enforcement ✅ COMPLETE for Gen 1–3 (Stages 1–13)
**Status:** Stage 12 (atomic double-completion hardening) and Stage 13 (debug tooling) are complete. The synthesis queue is production-ready for Gen 1–3. Phase F (conditions) and Phase B2 (Gen 4 seeding) are also complete.

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

### Stage 13 — Debug/Admin Tooling ✅ COMPLETE (partial — see Phase G)
`server/routes/dev.js` implements four dev-only endpoints: queue inspect, fast-forward, capability grant/revoke, and delivered notification cleanup. Mounted behind double gate: `NODE_ENV !== 'production'` AND `DEV_ADMIN_ENABLED=true`.

---

### Phase F — Conditions Enforcement Engine ✅ COMPLETE
**What:** Implement conditions as reactor-state requirements. A reaction with conditions `["plasma_state", "extreme_pressure"]` cannot be queued unless the reactor currently has those capabilities.

Deliverables:
- Conditions registry: a config mapping each condition name to what enables it (which tier, which prior synthesis)
- Reactor state per user: `reactorCapabilities: [String]` on User model
- Queue validation: reject queue attempts where reactor lacks required conditions, return specific error identifying which conditions are missing
- Conditions UI: display which conditions a recipe requires, which are active vs. missing
- `evaluateCapabilityUnlocks.js`: evaluates capability grants on reaction completion (tier-crossing and substance-based triggers)

**Architecture note:** Conditions are modeled as a reactor capability set. `reaction.conditions.every(c => user.reactorCapabilities.includes(c))`. Adding Gen 5–6 conditions requires only a config entry, not new validation code.

**Test:** Attempt to queue Hydrogen Plasma (requires `plasma_state`, `extreme_temperature`). Reactor lacks `plasma_state`. UI shows "reactor not capable: plasma_state." After unlocking via correct progression path, queue succeeds.

---

### Phase B2 — Gen 4 Content Seeding ✅ COMPLETE
**What:** Seed all Gen 4 substances and reactions now that the conditions enforcement engine is operational and validated.

Deliverables (all complete):
- All 8 Gen 4 substances seeded (Hydrogen Plasma, Ballistic Composite, Ceramic Superconductor, Metallic Hydrogen, Cryogenic Matrix, Nuclear Fuel Pellet, Reactive Plasma Core, Quantum Substrate)
- All 8 Gen 4 reactions seeded with correct reactionKey, reactants, products, tiers, energy costs, reaction times, and conditions arrays
- Gen 4 conditions all registered and enforced
- Gen 4 full playthrough validated: Tier 9→10→11→12 gate progression confirmed

**Result:** Gen 4 is fully reachable. Hydrogen Plasma blocks without `plasma_state`; Nuclear Fuel Pellet blocks without `radiation_bombardment` + `extreme_pressure`. Reactive Plasma Core and Quantum Substrate both synthesize correctly at Tier 12.

---

### Phase G — Debug & Test Tooling ← IN PROGRESS

**What:** Complete the admin/debug suite required for economy validation, prestige playtesting, and all late-generation testing. This is a required engineering deliverable.

**Current implementation status:**

| Deliverable | Status |
|---|---|
| Active queue inspect | ✅ `GET /api/dev/users/:username/queue` |
| Queue fast-forward | ✅ `POST /api/dev/users/:username/queue/:id/fast-forward` |
| Reactor capability grant/revoke | ✅ `POST /api/dev/users/:username/capabilities` |
| Delivered notification cleanup | ✅ `DELETE /api/dev/users/:username/pending-notifications/delivered` |
| **Inventory grant** | ❌ not yet implemented |
| **Tier set** | ❌ not yet implemented |
| **Time acceleration multiplier** | ❌ not yet implemented |
| Offline progress simulation | ❌ not yet implemented |
| Upstream cost display | ❌ optional |

**Remaining deliverables:**

- **Inventory grant:** `POST /api/dev/users/:username/inventory` — body: `{ substanceKey: String, quantity: Number }`. Resolves substanceKey to ObjectId, adds to `user.inventory`. Required for Gen 4 economy testing, prestige playthrough validation, and Gen 5 seeding validation.
- **Tier set:** `POST /api/dev/users/:username/tier` — body: `{ tier: Number }`. Sets `user.unlockTier` to any value, immediately unlocking or locking content. Required for rapid progression testing across generation boundaries.
- **Time acceleration multiplier:** `POST /api/dev/users/:username/time-acceleration` — body: `{ multiplier: Number }`. Applied at queue resolution: compresses `expectedCompletion` by the multiplier. Required for Gen 4 economy balancing and hard prerequisite for Gen 5 testing. Without this endpoint, every Gen 4 reaction test requires 3–15 real minutes of waiting.

**Gate:** Phase G completion is the single prerequisite for Phases P, Q, and R. Do not begin prestige architecture work without inventory grant, tier set, and time acceleration in place — the validation methodology for those phases depends on rapid playthrough simulation.

**Test:** Using the complete debug suite, advance a fresh account from Gen 1 to Tier 12 in under 30 minutes using time acceleration and inventory grants. Verify all gate transitions trigger correctly and all conditions blocks work.

---

### Phase P — Prestige System Redesign

**What:** Resolve the three implementation blockers in `docs/prestige-system-redesign.md` and produce an implementation-ready specification for Phase R. This is a design completion phase, not an implementation phase.

**Design blockers to resolve (from prestige-system-redesign.md §Part III):**

**Blocker 1 — Shard economy confirmation (Option C recommended, not confirmed)**  
Option C (fold existing multipliers into Branch 0 as Reactor Efficiency; add Automation Infrastructure as Branch 1) must be explicitly confirmed. This determines the prestige panel architecture, the Big Bang route, and whether multiplier purchases remain available going forward. Decision required before the prestige UI is touched.

**Blocker 2 — Blueprint cost order of magnitude**  
Blueprint costs need an order of magnitude decision before the purchase route can be configured meaningfully. The economic-progression-analysis.md established that ~40 shards per blueprint (the original design target) is misaligned by roughly one order of magnitude — a 20-run arc requires total upgrade spending of ~3,500–5,000 shards, and current Gen 4 runs yield ~328–361 shards each. Blueprint costs in the range of 100–500 shards each are indicated. The exact values are balancing questions; the order of magnitude must be decided now.

**Blocker 3 — Construction material quantities**  
The five V1 modules have confirmed material types (Graphene, Lithium-Ion Cell, Doped Silicon, Aramid Fiber, Stainless Steel, Carbon Nanotube per module). Exact quantities must be specified — a construction requiring 1 Graphene vs. 3 Graphene is a meaningfully different economic decision at the moment the player first enters Gen 4.

**Deliverables:**
- Option C confirmed (or alternative decided) with full UI implication documented
- Blueprint cost range confirmed per module (even if not final — a working range suffices for implementation)
- Construction material quantities per module specified (initial candidate values)
- Big Bang route change spec: `user.generators` reset, `user.blueprints` survive — implementation-ready
- Prestige branch interface wireframe (branch 0 + branch 1 layout)
- Migration strategy execution plan (how the old Upgrades panel becomes the branch interface)

**Gate:** Do not begin Phase R implementation until all three blockers are resolved. Do not begin Phase R until the blueprint cost range is confirmed — the purchase route cannot be tested without representative values.

---

### Phase Q — Economy & Scarcity Overhaul

**What:** Design a progression economy capable of creating meaningful gates at each generation boundary, with specific attention to the Gen 5 gate mechanism. This is a design phase. No code changes.

**Context:**  
The economic-progression-analysis.md established that Genesis Lab currently has no meaningful economic wall. Energy income (40–100 energy/second at sustained activity) is 50–100× faster than reaction energy demand (0.4–0.8 energy/second). The game's economy is time-dominated, not resource-dominated. No synthesis is economically gated. Shard rewards at the first Big Bang (149 shards at Tier 9) are already within reach of affording 3+ blueprints, meaning automation can be unlocked in a single run without meaningful multi-run gating.

**Required deliverables:**

- **Gen 5 gate mechanism specification.** What prevents a zero-prestige player from reaching Gen 5 on a first run? Options include: a prestige-gated construction resource as a reaction input; a shard-consumed synthesis component; a dependency on automation modules that require Big Bang investment to build. Energy cost scaling alone cannot create a Gen 5 wall — the income model trivially supports any reasonable energy cost increase. This decision must be made before Gen 5 content is designed.

- **Shard reward recalibration.** Current formula yields ~149 shards at Tier 9 first run and ~328 shards at Tier 12 Gen 4 run. The target: first Big Bang should yield enough to buy 1–2 small upgrades (taste of the system, not transformation). Gen 4 deep run should yield enough to maintain momentum across 2–3 upgrade tracks. The formula may need adjustment to widen the gap between Tier 9 and Tier 12 payouts — the current 2.2× ratio does not reflect the 3–5× additional effort required to go from Tier 9 to Tier 12. Adjustments do NOT require schema changes — only formula changes in `calculateGenesisShards.js`.

- **Gen 5 shardValue specification.** Gen 5 substances will carry shardValues that feed the shard formula. These must be designed now (before Gen 5 content is seeded) so that the prestige pacing across Eras VI–VII is intentional, not accidental.

- **Economic wall definition per generation boundary.** A specific, testable definition of what constitutes the economic gate at Gen 4→Gen 5 and Gen 5→Gen 6. This becomes the acceptance criterion for Phase B3 and B4 validation.

- **Prestige progression arc targets.** What should Big Bang #1, #5, #10, and #20 feel different in economic terms? From the prestige-loop-analysis.md analysis, the targets are roughly: run 1 → taste of system; run 5 → Gen 1-2 noticeably faster; run 10 → spending most run time at Gen 4; run 20 → Gen 1-3 is warmup, Gen 4 capstones still hard. The economy must be calibrated to these targets, not to naive shard arithmetic.

**Gate:** Do not begin Phase B3 (Gen 5 seeding) without a confirmed Gen 5 gate mechanism. Do not design Gen 5 reactions without knowing what they feed into or what they require from the prestige system.

---

### Phase R — Prestige Branch #1 Implementation (Automation Infrastructure)

**What:** Implement the two-layer Automation Infrastructure system as the first prestige branch, as specified in `docs/prestige-system-redesign.md`. This phase replaces the former Phase H (Automation Framework), which treated automation as an independent idle-game feature. Automation is prestige infrastructure. The design, philosophy, and integration points are different accordingly.

**Architecture:** Two-layer system confirmed by design.
- Layer 1 — Blueprint (permanent, shard-purchased, survives Big Bang)
- Layer 2 — Module construction (per-run, energy + Gen 4 materials, resets on Big Bang)

**Implementation steps (from prestige-system-redesign.md §13):**

**Step 1 — User model extension**  
Add `blueprints: [{ blueprintKey: String, purchasedAt: Date }]` and `generators: [{ moduleKey: String, level: Number, constructedAt: Date, pausedAt: Date | null }]` to the User schema. Add `lastActiveAt: Date` for offline catch-up. Blueprint purchase amounts and construction requirements come from a server-side config, not hardcoded in schema.

**Step 2 — Blueprint purchase and Big Bang integration**  
Route `POST /api/users/:username/blueprints/:blueprintKey`: validates shard balance against blueprint cost config, deducts shards, appends to `user.blueprints`. In the Big Bang route: reset `user.generators = []`. Do NOT touch `user.blueprints` — blueprints survive Big Bang unconditionally. Also: fix the known activeQueue Big Bang bug (queue entries from previous run must be cancelled at Big Bang time, not leaked into the new run's inventory).

**Step 3 — Construction and production engine**  
Route `POST /api/users/:username/generators/:moduleKey/construct`: validates blueprint ownership, deducts energy + material costs from inventory, appends to `user.generators` at Level 1. In `reactorRuntime.js`: add a production tick (every 30 seconds or configurable): for each active generator, calculate yield since last tick, apply per-substance storage cap, write to inventory. Offline catch-up: compute from `lastActiveAt` delta on reconnect, capped at configurable maximum.

**Step 4 — Upgrade route**  
Route `POST /api/users/:username/generators/:moduleKey/upgrade`: validates blueprint ownership and constructed status, deducts upgrade cost (energy + materials from config), increments `level`.

**Step 5 — UI: Prestige Branch Interface + Generators Panel**  
Retire the existing flat Upgrades panel. Replace with a branch-organized prestige interface: Branch 0 (Reactor Efficiency — existing multipliers, repositioned) and Branch 1 (Automation Infrastructure — blueprint shop). Add `GeneratorsPanel.jsx` as a collapsible panel visible when any blueprint is owned — shows per-module construct vs. running state, upgrade button, pause toggle, storage-capped indicator.

**V1 modules:**

| Module | Produces | Construction Requires |
|---|---|---|
| Atmospheric Separator | Hydrogen, Oxygen | Energy + Graphene + Lithium-Ion Cell |
| Carbon Scrubber | Carbon | Energy + Graphene + Doped Silicon |
| Nitrogen Condenser | Nitrogen | Energy + Aramid Fiber + Doped Silicon |
| Iron Smelter | Iron | Energy + Stainless Steel + Carbon Nanotube |
| Sulfur Extractor | Sulfur | Energy + Stainless Steel + Carbon Nanotube |

(Exact quantities: TBD — confirmed in Phase P Blocker 3)

**Hard constraints (from prestige-system-redesign.md §2, Non-Goals):**
- Automation never queues a reaction. The synthesis queue has exactly one entry point: the player.
- Automation never produces Gen 2+ compounds. Only Gen 1 raw elements.
- Automation cannot be constructed before Gen 4 materials are available in that run. Gen 1–3 is always fully manual.
- Automation never triggers discovery or experiments.

**Test:** With one blueprint owned, complete a run from fresh account to Gen 4. Verify automation cannot be constructed before first Graphene is available. Construct the module. Verify it produces the correct element into inventory at the correct rate. Big Bang. Verify `user.generators` is cleared but `user.blueprints` survives. On the next run, verify the blueprint shows as owned but the module must be constructed again.

**Checkpoint (Prestige Branch #1 validation):**
- Blueprint purchase persists through Big Bang
- Module construction requires blueprint ownership
- Module construction requires Gen 4 materials (cannot construct in Gen 1–3)
- Production writes to inventory only — synthesis queue is unchanged
- Big Bang resets all constructed modules
- Blueprints survive Big Bang unconditionally
- The prestige branch UI presents Branch 0 and Branch 1 as distinct branches in the same interface

---

### Phase J1 — Economy Architecture (Design)

**What:** Define the economic wall for each generation boundary and produce the implementation-ready specification for Gen 5 gating. This phase runs in parallel with Phase I preparation (they have no dependency on each other).

**Context:**  
Phase J was previously a single balancing phase that ran concurrent with Gen 5–6 seeding and reactor evolution. The economic-progression-analysis.md revealed that the game's economy currently lacks structure to create meaningful generation gates. Economy architecture (the design of what creates the walls) must precede economy balancing (tuning numbers within a confirmed design). These are different activities requiring different precedence.

**Deliverables:**
- Gen 5 gate mechanism implementation spec (from Phase Q's decision)
- If the Gen 5 gate requires a new schema field (a prestige-gated resource, a shard-consumed component), that schema change is specified here and implemented before Phase B3 seeding
- IV (Intrinsic Value) methodology adopted as a calibration tool for Gen 5–6 substance design — ensures new substances produce the correct economic curve
- Gen 5–6 shardValue assignments finalized, informed by the desired prestige pacing arc
- Shard formula changes (if any, from Phase Q) implemented in `calculateGenesisShards.js`

**Gate:** Phase J1 deliverables must be complete before Phase B3 begins. Gen 5 substance and reaction design depends on knowing what the economic wall looks like.

---

### Phase I — Long-Duration Synthesis

**What:** Synthesis times of 4–72 hours work correctly, persist through server restarts, and display correctly to the player with real-world calendar time.

**Note on repositioning:** Phase I was previously placed before automation (Phase H). Under the revised architecture, automation is Post-Big-Bang prestige infrastructure (Phase R), not a prerequisite for long-duration synthesis. Phase I's correct position is after Phase R (automation must be live to validate that long-duration synthesis coexists correctly with the production tick engine) and before Phase B3 (Gen 5 content cannot be seeded before long-duration queue persistence is validated).

**Deliverables:**
- Time display: for any synthesis over 24 hours, display estimated real-world completion time ("Completes Thursday at 11:42 PM") alongside the countdown
- Offline completion: a synthesis that completes while the player is offline is correctly resolved on reconnect
- Server restart safety: active queue entries survive server restart. Queue stored in DB with wall-clock completion timestamps.
- Validation test: use Phase G debug tooling to simulate a 48-hour synthesis at 100× speed, confirm it survives a server restart mid-synthesis and completes correctly

**Test:** Queue a 12-hour synthesis. Terminate the server process. Restart the server. Reconnect as the player. The synthesis is still in progress, countdown is correct, and it completes normally. Only after this test passes does Phase B3 seeding begin.

---

### Phase B3 — Gen 5 Design + Seeding + Validation

**What:** Design Gen 5 substance and reaction content (informed by Phase Q and Phase J1 decisions), seed it, and validate it end-to-end. Gen 6 content is explicitly deferred to Phase B4 — Gen 6 design should observe Gen 5 results first.

**Dependencies (all must be complete):**
- Phase Q: Gen 5 gate mechanism confirmed
- Phase J1: Economy architecture and Gen 5 shardValues specified
- Phase I: Long-duration synthesis queue is server-restart-safe

**Note on previous scope:** Phase B3 previously seeded both Gen 5 and Gen 6 simultaneously. This is split because Gen 6 design benefits from observing whether the Gen 5 economic wall held, whether the prestige pacing was correct at Gen 5 timescales, and whether the Gen 5 substance graph required adjustments after initial playtesting.

**Deliverables:**
- Gen 5 substance design (informed by Phase Q gate mechanism and IV curve targets)
- All Gen 5 substances seeded with correct shardValues, unlockTiers, and reaction times
- All Gen 5 reactions seeded with reactants, products, conditions, and economic gate requirements
- New Gen 5 conditions registered (names TBD in Phase Q)
- Gen 5 full playthrough validated using Phase G debug tooling (time acceleration + inventory grants)
- Gen 5 economic wall validated: zero-prestige player cannot reach Gen 5 on run 1 (if that is the decided gate)

**Gate:** Do not begin Phase B4 until Gen 5 has been playtested and the economic wall observation is documented.

---

### Phase J2 — Economy Balancing (Tuning)

**What:** Systematic numeric calibration across all six generations. This phase runs in passes — one pass after Gen 5 seeding (Phase B3), one pass after Gen 6 seeding (Phase B4).

**Balancing order:**
1. Gen 1–3 economy: already partially validated — re-verify after Phase R automation is live (automation changes the feedstock constraint materially)
2. Gen 4 economy with automation: validate with Phase R automation operational
3. Gen 5 economy (after Phase B3 seed + Gen 5 playthrough)
4. Gen 6 economy (after Phase B4 seed + Gen 6 playthrough)

**Tools required:** Phase G debug tooling (time acceleration, inventory grants, tier setting). Without these, balancing is guesswork.

**What changes:** BEU costs, reaction times, production rates, shard formula constants. What does not change: the structural graph, substance names, reaction inputs/outputs, or generation assignments.

---

### Phase B4 — Gen 6 Design + Seeding + Validation

**What:** Design Gen 6 substance and reaction content (informed by Gen 5 observations), seed it, and validate end-to-end.

**Why deferred from B3:** Gen 6 design should be informed by Gen 5 results. If the Gen 5 economic wall did not hold as designed, Gen 6 design must be adjusted. If the Gen 5 shard payouts were miscalibrated, Gen 6 shardValues must be adjusted. Designing Gen 6 before Gen 5 is observed produces speculative content that may require re-seeding.

**Deliverables:**
- Gen 6 substance design (informed by Gen 5 observations and Gen 6 philosophy from generation-philosophy-v2.md)
- All Gen 6 substances seeded (Prima Materia, Aether, Void Crystal, False Vacuum Seed, Philosopher's Stone, Dark Matter Crystal)
- All Gen 6 reactions seeded with correct reactionKey, reactants, products, tiers, energy costs, reaction times (24h–72h), and conditions arrays
- New Gen 6 conditions registered (`temporal_drift`, `vacuum_decay`, `causality_shear`)
- Gen 6 full playthrough validated using Phase G debug tooling
- Gen 6 economic wall validated
- Seed validation script passes on complete Gen 1–6 content with zero errors

**Content gate:** Gen 6 content must not be seeded until the Gen 5 economic wall observation is documented and Gen 5 balancing (Phase J2 first pass) is complete.

---

### Phase K — Reactor Evolution

**What:** The reactor's visual state, notification language, and UI language evolve as the player progresses through generations.

**Prerequisite:** Phase B4 complete. Content must be frozen before evolution is implemented — visual and language transitions calibrate to specific substance names and generation boundaries that cannot change after implementation.

Deliverables:
- Generation-state tracking: client knows which generation the player is in
- Visual states per generation: defined, implemented, tested
- Notification language per generation: Gen 1 ("Synthesis complete. New reactions unlocked.") vs. Gen 6 ("Philosopher's Stone — confirmed.")
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

### Risk 1 — Prestige Economy Misalignment Persists (HIGH)
**What:** The prestige system is redesigned (Phase P) but the specific shard reward calibration decisions are not made rigorously in Phase Q before Gen 5 content is designed. Gen 5 seeding assumes an economic gate that does not hold in practice.

**Consequence:** Gen 5 is reachable without prestige on run 1. The Gen 5 "wall" is illusory. Players do not feel meaningful prestige pressure to improve their reactor before attempting Gen 5. The prestige loop fails to sustain engagement.

**Mitigation:**
- Phase Q deliverables include a specific, testable definition of the Gen 5 economic gate — not a vague intention, but an exact mechanism
- Phase B3 validation includes an explicit test: a zero-prestige fresh account must not be able to reach Gen 5 within a reasonable run (if that is the decided gate type)
- If the gate mechanism uses a new schema field (e.g., a prestige-gated construction resource), that field is added in Phase J1 and seeded before Phase B3 content is designed against it

**Test point:** Phase B3 validation. Run a zero-prestige playthrough using time acceleration. Verify Gen 5 is blocked by the intended mechanism.

---

### Risk 2 — Long-Duration Synthesis Queue Corruption (HIGH)
**What:** Gen 5–6 synthesis times are 6–72 hours. If a server restart corrupts the queue — or a schema migration truncates `activeQueue` — a player loses 24–72 hours of real time.

**Consequence:** Player trust destroyed. Unrecoverable without manual intervention.

**Mitigation:**
- Queue entries stored in MongoDB with wall-clock timestamps (already implemented in Phase C)
- Queue entries are immutable once created: the only mutation is status transition to `completed`
- Migration scripts must explicitly handle `activeQueue` entries — never drop the field or collection
- At every schema migration checkpoint: verify active queues survive the migration in a staging environment

**Test point:** Phase I completion. Automated test: queue a synthesis, deliberately crash the server, restart, verify queue survives.

---

### Risk 3 — Conditions System Complexity Explosion (MEDIUM-HIGH)
**What:** The conditions system starts with 9 conditions (Gen 1–4) and ends with 15+ conditions (Gen 6). If conditions are implemented as per-reaction logic rather than as a reactor capability registry, each new condition requires new code.

**Consequence:** Gen 5–6 conditions are either not implemented or implemented with hacks.

**Mitigation:**
- Conditions are data-driven: `conditionRegistry.js` is the single source of truth. Adding a new condition requires only a config entry and seed data — no new code.
- Validated at Phase F (Gen 4 conditions added without new code). The architecture is already proven correct.

**Test point:** Phase B3 seeding. Adding Gen 5 conditions should require config changes only, no new validation code.

---

### Risk 4 — Progression Deadlock (MEDIUM)
**What:** A player gets into a state where they have the recipe, the reactants, and the correct tier, but a bug prevents synthesis completion — and they are stuck.

**Consequence:** Recovery requires admin intervention or a save reset.

**Mitigation:**
- Gate substances should have `discoveredByDefault: true`
- Queue completion is idempotent (atomic `processing → resolving → completed` transition)
- Phase G debug tooling allows admin inventory/tier adjustment for recovery

**Test point:** Phase D completion. Simulate every Gen 1→Gen 2→Gen 3 gate transition. Each should complete without deadlock.

---

### Risk 5 — Gen 5–6 Pacing Failure (MEDIUM)
**What:** Long synthesis windows in Gen 5–6 (6–48 hours) leave the player with nothing to do while waiting.

**Consequence:** Late-game retention failure. The game's most ambitious content is never reached by most players.

**Mitigation:**
- Automation infrastructure (Phase R) ensures Gen 1 feedstock production runs during long synthesis windows
- The production pressure audit documents which Gen 4 substances need restocking for Gen 5 forward progress
- Queue slot expansion (a future prestige branch) is the primary long-term mitigation

**Test point:** Phase I completion (long-duration synthesis validated, Phase B3 seeded). Test Gen 5 progression with automation active using debug time acceleration.

---

### Risk 6 — Automation Implemented Before Prestige Architecture Is Decided (HIGH — now mitigated)
**What:** If Phase R implementation begins before Phase P resolves the three design blockers (shard economy option, blueprint cost order of magnitude, construction material quantities), the implementation will be built against an unconfirmed architecture and require refactoring when that architecture is confirmed.

**Consequence:** Automation is refactored once or twice before shipping. Delay to Era V completion.

**Mitigation:** Phase P is a hard prerequisite for Phase R. No Phase R implementation work begins until all three Phase P blockers are resolved. Phase G completion gates Phase P, which gates Phase R. The sequencing enforces this.

**Why this risk was elevated:** The former Phase H (Automation Framework) was positioned as an independent feature rather than as a prestige branch. This created pressure to implement it without prestige design being settled. Under the current architecture, Phase P must precede Phase R structurally — the ordering enforces the correct dependency.

---

### Risk 7 — Content Graph Bugs in Seed Data (MEDIUM)
**What:** The seed data has 50+ substances and 50+ reactions with complex cross-references. A single incorrect reactant reference silently corrupts the progression graph.

**Consequence:** A reaction is unreachable (wrong tier), consumes the wrong substance, or has no product.

**Mitigation:**
- Seed validation script runs on every seed: verifies no dangling references, all unlock tiers consistent, no circular dependencies
- Run the validation script in CI: seed changes that break validation fail the build

**Test point:** Phase B1 completion. Seed validation passes with zero errors. Run again after Phase B2, B3, and B4.

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
- Phase G partial: 4 of 8 debug endpoints operational

---

### Checkpoint 5 — Debug Tooling Complete (End of Phase G)
**What to verify:**
- Inventory grant: admin can add any substance × quantity to any player inventory
- Tier set: admin can set player unlockTier to any value instantly
- Time acceleration: synthesis timers compress by the configured multiplier
- Full Gen 1→Tier 12 playthrough in under 30 minutes using the complete debug suite

**Gate:** Do not begin Phase P until this checkpoint passes. All economy validation work depends on rapid playthrough capability.

---

### Checkpoint 6 — Prestige Architecture Confirmed (End of Phase P)
**What to verify:**
- Shard economy option confirmed (Option C or explicit alternative)
- Blueprint cost range confirmed (order of magnitude with working values)
- Construction material quantities per module specified
- Prestige branch UI wireframe approved
- Big Bang route change spec complete

**Gate:** Do not begin Phase R implementation until this checkpoint passes.

---

### Checkpoint 7 — Economy Architecture Confirmed (End of Phase Q)
**What to verify:**
- Gen 5 gate mechanism specified and testable
- Shard reward calibration targets documented
- Gen 5 shardValues specified
- Prestige progression arc targets documented (run 1/5/10/20 feel targets)

**Gate:** Do not begin Phase B3 without this checkpoint passing. Do not design Gen 5 substance content before the economic wall mechanism is confirmed.

---

### Checkpoint 8 — Prestige Branch #1 Operational (End of Phase R)
**What to verify:**
- Blueprint purchase persists through Big Bang
- Module construction requires Gen 4 materials (cannot construct in Gen 1–3)
- Production writes to inventory only; synthesis queue is unchanged by automation
- Big Bang resets all constructed modules; blueprints survive
- Prestige branch interface presents Branch 0 and Branch 1 correctly
- Gen 1–4 economy re-validated with automation active: not trivially accelerated

---

### Checkpoint 9 — Long-Duration Survival Test (End of Phase I)
**What to verify:**
- A 12-hour synthesis persists through a server restart with no data loss
- A 48-hour synthesis (simulated at 1000× speed) completes correctly
- Offline completion resolves correctly on reconnect

**Gate:** Do not begin Phase B3 until this checkpoint passes.

---

### Checkpoint 10 — Gen 5 Technical Completion (End of Phase B3)
**What to verify:**
- Gen 5 full playthrough using debug tooling: all Gen 5 substances reachable
- Gen 5 economic wall holds: zero-prestige player is blocked by the intended mechanism
- Gen 5 conditions enforced (all new conditions registered and enforced correctly)
- Seed validation script passes on Gen 1–5 content with zero errors

**Gate:** Do not begin Phase B4 until Gen 5 is playtested and economic wall observation is documented.

---

### Checkpoint 11 — Full Gen 1→Gen 6 Technical Completion (End of Phase B4)
**What to verify:**
- A player account can be manually advanced through all six generations using Phase G debug tooling
- All Gen 6 substances are synthesizable
- Dark Matter Crystal synthesis completes correctly
- No database corruption at any point in the accelerated playthrough

**This checkpoint confirms technical completeness only.** Economy balancing continues through Phase J2.

---

### Checkpoint 12 — Economy Final Balance (End of Phase J2)
**Target pacing ranges:**
- Gen 1: new player reaches Gen 2 in approximately 30–60 minutes of active play
- Gen 2: player reaches Gen 3 in approximately 2–4 hours of active play
- Gen 3: player reaches Gen 4 gate in approximately 1–2 weeks of casual play
- Gen 4: player reaches Gen 5 gate in approximately 1–2 months of casual play (first prestige likely required)
- Gen 5: player reaches Gen 6 gate in approximately 1–3 months of casual play
- Gen 6: Dark Matter Crystal completes approximately 1–3 months after Gen 6 entry

---

### Content Freeze Checkpoint — Before Phase K (Reactor Evolution)
**What:** No new substances, reactions, conditions, or generation content is added after this point. The content graph is frozen.

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

**Guard:** The game is complete at Gen 6. There is no Gen 7. Dark Matter Crystal is the end.

---

### Constraint 8 — The Ending Is Stillness
The Dark Matter Crystal completion notification is "Dark Matter Crystal — stable." Two words after the substance name. No fanfare. No victory screen.

**Violation pattern:** A completion screen with animation and "You did it!" text.

**Guard:** The completion experience is specified in §11.11 of the reaction graph design. Not open for redesign without explicit re-evaluation of the game's tonal thesis.

---

### Constraint 9 — Automation Is Prestige Infrastructure, Not an Idle-Game Feature
Automation modules are not convenience features that passively remove clicking. They are permanent capabilities the reactor earns across Big Bang cycles. They are purchased with Genesis Shards (permanent) and constructed with Gen 4 materials (per-run). They require reaching Gen 4 in a given run before they can be activated.

**Violation pattern:** Implementing automation as a midgame unlock (available before first Big Bang). Framing automation as "reducing clicking." Treating automation as a quality-of-life feature rather than a prestige infrastructure investment.

**Guard:** Automation modules cannot be constructed without a blueprint. Blueprints require Genesis Shards. Genesis Shards are earned only through Big Bang. Therefore: zero Big Bangs = zero blueprints = zero automation. This is structural. If any implementation path allows automation before a Big Bang has occurred, it violates this constraint.

---

## Appendix — Model Change Summary

Quick reference for the schema changes made in Phase A. Where the implemented field name differs from the original spec, the actual name is shown.

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

### User model additions (Phase A + Phase R pending):
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

// Added in Phase R (pending):
blueprints: [{ blueprintKey: String, purchasedAt: Date }]
generators: [{ moduleKey: String, level: Number, constructedAt: Date, pausedAt: Date | null }]
lastActiveAt: { type: Date }
```
