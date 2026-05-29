# Genesis Lab — Implementation Roadmap

**Version:** 1.2  
**Status:** Active Implementation — Synthesis Engine Hardening Phase  
**Date:** 2026-05-29  
**Inputs:** reaction-graph-design.md, generation-philosophy-v2.md, substance-importance-audit.md, substance-universe.md, queue-system-plan.md  
**Scope:** Full implementation sequencing from design lock to game-complete state

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
- **Dev/admin debug tooling** — Stage 13; queue inspect, fast-forward `expectedCompletion`, delivered notification cleanup; double-gated (`NODE_ENV !== production` AND `DEV_ADMIN_ENABLED=true`)

**Not yet built (full scope):**
- **Conditions system (Phase F)** — conditions as gameplay-blocking requirements; **next major implementation phase**
- Gen 4–6 content seeding — blocked on conditions system (Phase F)
- Long-duration synthesis validation (synthesis times 4–72 hours, multi-hour persistence testing) — Phase I
- Automation framework (passive element generators) — Phase H
- Economy balancing (BEU costs calibrated, playtested) — Phase J
- Reactor evolution (visual/audio/language changes per generation) — Phase K
- Save/persistence hardening (migration versioning, corruption guards for 72h syntheses) — Phase L
- Onboarding and tutorial

The transition from this state to the designed game requires disciplined sequencing. Every major system depends on prior systems. Build out of order and you will re-build.

---

## Part 1 — Implementation Eras

Six eras, sequential. Each era produces a testable, playable checkpoint.

---

### Era I — Content Foundation (Gen 1–3 Only)
**Duration estimate:** 3–5 weeks  
**Deliverable:** A complete Gen 1→Gen 2→Gen 3 playthrough is possible from a fresh account, using the final designed substance and reaction data.

This era does NOT build new systems. It replaces the placeholder content with the final designed Gen 1–3 content and verifies the existing systems handle it correctly.

**Scope boundary:** Only Gen 1–3 substances and reactions are seeded in this era. Gen 4–6 content is explicitly deferred until the systems that gate it (conditions engine, long-duration synthesis) are stable. Seeding unreachable content prematurely creates false impressions of progress and clutters the development database with data that cannot be tested.

Why first: every subsequent era — balancing, conditions, automation, unlock gating — requires real content to test against. Building systems against placeholder data produces systems calibrated to wrong inputs. Content is the foundation.

---

### Era II — Unlock Orchestration
**Duration estimate:** 2–4 weeks  
**Deliverable:** Tier gating is functional. Discovering a milestone substance unlocks the next tier. Gen 1→Gen 2→Gen 3 progression gates correctly. The player cannot access Gen 4 content without completing Gen 3.

Why second: unlock orchestration depends on content (you cannot gate reactions that don't exist) and enables all economy testing thereafter (you need to be locked out of advanced content to test whether early content is well-paced).

---

### Era III — Synthesis Engine Hardening
**Duration estimate:** 3–5 weeks  
**Deliverable:** Synthesis queue supports real reaction times (seconds through hours). Reactions persist through server restarts. Multiple synthesis slots work correctly. User substance inventory is tracked.

Why third: the current reaction model may execute instantly or with short timers. Gen 3 reactions run 5–45 minutes; Gen 4 runs 30 minutes–4 hours; Gen 5 runs overnight; Gen 6 runs 72 hours. The engine must be stable before Gen 4+ content is seeded — long-duration synthesis requires fundamentally different queue persistence than short-duration.

---

### Era IV — Conditions, Debug Tooling & Gen 4 Content
**Duration estimate:** 4–6 weeks  
**Deliverable:** Conditions are enforced at synthesis queue time. A debug/test tooling suite is operational for time acceleration and state inspection. Gen 4 content is seeded (Phase B2) and reachable. The player can progress from Gen 3 through Gen 4 on a correctly gated, conditions-blocked playthrough.

Why fourth: conditions depend on the synthesis engine being stable (you cannot add conditions to reactions whose timing isn't reliable) and depend on the unlock system working (Gen 4 must be properly gated before you can test whether reaching Gen 4 feels correct). Debug tooling must exist before Gen 4 content is seeded — Gen 4 has 30-minute to 4-hour reactions that require time acceleration to test practically. Gen 4 content (Phase B2) is only seeded after the conditions engine can enforce it.

---

### Era V — Automation, Long-Duration Synthesis & Gen 5–6 Content
**Duration estimate:** 6–9 weeks  
**Deliverable:** Passive element generators exist. Long-duration synthesis (up to 72 hours) is stable and server-restart-safe. Gen 5–6 content is seeded (Phase B3) and technically reachable. BEU costs across Gen 1–4 are playtested and calibrated. Full progression from Gen 1 to Gen 6 is technically possible (though not finally polished).

Why fifth: automation requires the synthesis engine to be stable (generators feed into the queue system). Long-duration synthesis must be proven stable before Gen 5–6 content is seeded — there is no point introducing 24–72 hour reactions into the database until the queue system has survived server restarts without corruption. Gen 5–6 content (Phase B3) is only seeded after long-duration synthesis is validated. Economy calibration requires automation to be functional — you cannot balance energy costs when element supply is manually managed, because the bottleneck shifts dramatically when automation is present.

---

### Era VI — Polish, Balancing, and Finalization
**Duration estimate:** 4–8 weeks  
**Deliverable:** The game is content-complete, pacing-balanced, visually evolved across generations, save-hardened, and ready for a real player to experience Gen 1 through Gen 6.

Why last: polish and balancing require all systems to exist. There is no point polishing reactor evolution visuals until the reactor actually changes state across six generations. There is no point balancing Gen 6 economy until you can actually reach Gen 6.

---

## Part 2 — Immediate Next Steps

The single most important implementation decision: **what to build before anything else.**

### Step 1 — Schema Audit and Alignment (1 week, before any content seeding)

The existing Reaction and Substance models need to be audited against the final design before content is seeded. Seeding wrong-schema content and then migrating it is expensive.

**Specific gaps to resolve:**

**Reaction model gaps:**
- `reactionKey`: the design uses string identifiers (e.g., `gen3_doped_silicon`). The current model uses a numeric `reactionID`. Add a `reactionKey` string field (unique, indexed) — this is the stable reference identifier across seeds, saves, and saves migrations.
- `conditions`: currently `type: Object`. Replace with `[String]` — an array of condition names. The design's conditions are string labels (`high_temperature`, `plasma_state`, `temporal_drift`). A typed array is queryable and diffable.
- `reactionType` enum: the current enum (`synthesis`, `decomposition`, `combustion`, `fusion`, `transmutation`) does not match the design's `standard_synthesis`. Decide: keep the existing enum and map design terms to it, or add `standard_synthesis` to the enum. Recommendation: add `standard_synthesis` to the enum now. All Gen 1–6 reactions use it. The others remain for future use.
- `reactionTime`: field exists but likely not enforced in queue logic. The existing type is `Number` (seconds). This is correct — do not change the type. Ensure the queue system uses it.
- Missing: `generationTier` (Gen 1–6) as a separate field from `unlockTier` (1–21). These are related but distinct: `unlockTier` is the fine-grained progression gate, `generationTier` is the coarser narrative gate. Having both explicitly makes balancing and filtering far easier than inferring generation from unlock tier.

**Substance model gaps:**
- `type` enum: currently `["element", "compound"]`. The design includes substances that are neither (Dark Matter Crystal, Prima Materia, False Vacuum Seed). Add `"artifact"` to the enum for Gen 5–6 mythic substances. Elements and compounds keep their existing classification.
- `reactionKey` cross-reference: the substance seed should include a `reactionKey` or stable string ID for the same reason as reactions.
- Physical properties (atomicNumber, valenceElectrons, etc.): these are relevant for Gen 1–3 elements and should remain. They simply don't apply to Gen 4–6 substances, which is fine — sparse optional fields.
- Missing: `hintText` — the design specifies hint text for every substance. This is a UI display field but it belongs in the model, not hardcoded in the client.
- Missing: `generationTier` on Substance as well — which generation this substance belongs to.
- Missing: `fantasyWeight` — a design-internal audit field (1–5 scale from the substance importance audit). Not required for gameplay but useful for future balancing and filtering passes.

**User model gaps:**
- Missing: `substanceInventory` — what the player currently holds (substance → quantity map).
- Missing: `discoveredReactions` — array of reaction IDs the player has discovered.
- Missing: `unlockedTier` — the player's current progression tier.
- Missing: `activeQueue` — the player's active synthesis queue (in-progress reactions with start time, expected completion time).
- Missing: `reactorCapabilities` — an array of condition strings representing the reactor capabilities the player has currently unlocked (e.g., `["high_temperature", "catalyst", "plasma_state"]`). This is a per-user field, not a per-reaction field. Conditions are a property of the reactor, not of individual reactions. A player whose reactor has `plasma_state` can queue any reaction that requires it.

These user model additions are the core of the progression system. Without them, there is no user-specific state.

**Do not build**: any new UI, any new visual systems, any automation. Only align the schema.

---

### Step 2 — Gen 1–3 Substance and Reaction Seed (Phase B1) (2–3 weeks)

Replace the existing placeholder seed files (`seedSubstances.js`, `seedReactions.js`) with Gen 1–3 content from the reaction graph design. **Do not seed Gen 4–6 content yet.**

Gen 4 content depends on the conditions system (Phase F). Seeding it before that system exists means it sits in the database unreachable and untestable. Gen 5–6 content depends on long-duration synthesis stability (Phase I). Seeding it before that system is validated means 24–72 hour reaction entries exist in the database that cannot be correctly processed. Each content tier is seeded only after the system it requires is operational. See Phase B2 and Phase B3 in Part 4 for the Gen 4 and Gen 5–6 seeding phases respectively.

**Seed strategy:**

Build a two-pass seeder:
1. **Pass 1 — Substances:** Seed all Gen 1–3 substances first (elements + compounds), generating MongoDB ObjectIDs.
2. **Pass 2 — Reactions:** Seed all Gen 1–3 reactions, resolving reactant/product names to the ObjectIDs produced in Pass 1.

Use `reactionKey` as the stable identifier for reactions in the seed file — the string key (e.g., `gen3_stainless_steel`) is human-readable, diffable in git, and survives database reset. Do not use auto-generated MongoDB IDs as the stable reference.

**Content seeding order (Gen 1–3 only):**
1. Gen 1 substances + reactions
2. Gen 1 full playthrough validation — can an admin synthesize every Gen 1 product by manually setting inventory?
3. Gen 2 substances + reactions
4. Gen 2 full playthrough validation
5. Gen 3 substances + reactions
6. Gen 3 full playthrough validation

Validate after each generation: no broken reactant references, no missing products, all unlock tiers consistent, all energy costs within the generation band.

**What NOT to build during seeding:** automation, conditions enforcement, long-duration timers. Seed Gen 1–3 reactions with their correct `reactionTime` and `conditions` field values (accurate data), but don't enforce them yet. The content goes in first; the enforcement systems come later. Gen 4–6 data is not seeded at this step.

---

### Step 3 — User Inventory and Queue Foundation (1–2 weeks, overlapping with seeding)

Before unlock orchestration can work, the player needs a tracked inventory and synthesis queue. These are the minimal user-state additions that unlock all subsequent systems.

**Substance inventory:** A map from substance MongoDB ID → quantity. Updated when:
- A synthesis completes (add product, remove reactants)
- An element generator produces (add element)
- A Big Bang event occurs (clear inventory per designed rules)

**Synthesis queue:** An array of in-progress reactions per user, each containing:
- Reaction reference
- Start timestamp
- Expected completion timestamp (startTime + reactionTime)
- Input substances consumed (deducted from inventory at queue time)
- Status: `queued`, `in_progress`, `complete`

This queue must persist to the database (not just server memory) — when the server restarts, active syntheses must resume from their correct positions. This is non-negotiable before long-duration synthesis is introduced.

**Queue slots:** Design intent is multiple synthesis slots. Implement with a maximum slot count (start with 1, expand via progression — the slot count itself is a progression unlock). Keep the data model slot-count-agnostic from the start.

---

## Part 3 — Dependency Graph

The following dependencies are absolute. Building out of order requires re-building.

```
Schema audit (Phase A)
    │
    └── Phase B1: Gen 1–3 content seeding + validation
            │
            ├── User inventory + queue foundation (Phase C)
            │       │
            │       ├── Unlock orchestration (Phase D)
            │       │       │
            │       │       └── Economy testing: Gen 1–3 (Phase J, first pass)
            │       │
            │       └── Synthesis engine: reaction time enforcement (Phase E)
            │               │
            │               └── Conditions enforcement engine (Phase F)
            │                       │
            │                       ├── Phase B2: Gen 4 content seeding
            │                       │       │
            │                       │       └── Economy testing: Gen 4 (Phase J, second pass)
            │                       │
            │                       └── Debug & test tooling (Phase G)  ←── REQUIRED before late-gen testing
            │                               │
            │                               ├── Automation framework (Phase H)
            │                               │       │
            │                               │       └── Economy balancing: Gen 1–4 with automation (Phase J)
            │                               │
            │                               └── Long-duration synthesis (Phase I)
            │                                       │
            │                                       └── Phase B3: Gen 5–6 content seeding
            │                                               │
            │                                               └── Economy testing: Gen 5–6 (Phase J, final pass)
            │                                                       │
            │                                                       └── Reactor evolution (Phase K)
            │                                                               │
            │                                                               └── Save hardening + polish (Phase L)
```

**Critical path summary:**

- Phase B1 (Gen 1–3 seed) before everything: no system can be meaningfully tested without real content
- Phase B2 (Gen 4 seed) depends on conditions enforcement (Phase F) and debug tooling (Phase G): conditions must be enforced before Gen 4 content is reachable; debug tooling must exist before Gen 4 timing can be tested
- Phase B3 (Gen 5–6 seed) depends on long-duration synthesis (Phase I): 24–72 hour reactions must be server-restart-safe before they exist in the database
- Debug tooling (Phase G) is a hard prerequisite for any late-generation testing — not optional polish
- Automation (Phase H) depends on user inventory being tracked (Phase C): generators write to inventory
- Economy balancing (Phase J) depends on automation (Phase H) — balancing before automation is balancing the wrong system
- Reactor evolution (Phase K) depends on Gen 5–6 being reachable and all generation transitions working
- Save hardening (Phase L) depends on long-duration synthesis existing — new corruption vectors don't exist until they do

---

## Part 4 — Recommended Implementation Order

The following is a specific, week-by-week recommended order of implementation work.

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
- `substanceInventory`, `discoveredReactions`, `unlockedTier`, `activeQueue` added to User
- `reactorCapabilities: [String]` added to User — stores the set of reactor capabilities the player has unlocked (e.g., `["high_temperature", "catalyst"]`). This field is the authoritative source for conditions enforcement: at queue time, check that every condition in `reaction.conditions` appears in `user.reactorCapabilities`.

**Test:** Existing seed files still run. Existing tests still pass. No behavior change for any existing feature.

---

### Phase B1 — Gen 1–3 Content Seeding ✅ COMPLETE
**What:** Replace placeholder seeds with Gen 1–3 substance and reaction data from the reaction graph design. Gen 4–6 content is not seeded here — see Phase B2 and Phase B3.

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
- `substanceInventory` updated on reaction completion (remove reactants, add product)
- `activeQueue` entries created on reaction queue, stored in DB
- Queue entries resolve at server time: if `now > expectedCompletion`, reaction is complete on next user request
- Inventory and queue state pushed to client via WebSocket on relevant state changes
- Multiple queue slot support (slot count enforced, initially 1)

**Test:** Queue a reaction. Restart the server. Reconnect. Reaction is still in progress, completes correctly.

---

### Phase D — Unlock Orchestration ✅ COMPLETE for Gen 1–3 (via queue completion)
**What:** Implement milestone-based tier gating. Synthesis of a gate substance unlocks the next tier. Players cannot access higher-tier reactions until they have synthesized the required predecessors.

**Status note:** Tier gating is fully functional for Gen 1–3 via the queue system. `completeReaction` advances `user.unlockTier` using `snapshot.productUnlocksUserTier` on first production of a gate substance. Routes enforce `unlockTier` gating. WS completion events carry `prevUnlockTier`/`newUnlockTier`. No separate orchestration layer is needed for Gen 1–3. Gen 4+ gate transitions will be validated as part of Phase B2/F work.

Deliverables:
- Gate substance definitions (per tier transition): stored in a config or DB, not hardcoded in logic
- On reaction completion: check if product is a gate substance → if so, evaluate tier advance
- Tier advance: add new reactions to player's `discoveredReactions` (or make them discoverable)
- Client receives tier-unlock notification via WebSocket, UI reflects newly available reactions

Gate definitions from the design:
- Tier 1→4 (Gen 1→Gen 2): synthesize Iron Oxide + Ammonia
- Tier 4→7 (Gen 2→Gen 3): synthesize Bronze + Sulfuric Acid
- Tier 7→9 (Gen 3→Gen 4): synthesize Steel + Lithium-Ion Cell
- Tier 9→13 (Gen 4→Gen 5): synthesize Reactive Plasma Core + Nuclear Fuel Pellet
- Tier 13→17 (Gen 5→Gen 6): synthesize Event Horizon Condensate

**Test:** Fresh account, play Gen 1. Attempt to queue a Gen 2 reaction — blocked. Synthesize Iron Oxide. Synthesize Ammonia. Gen 2 reactions appear. Verify each gate transition.

---

### Phase E — Reaction Time Enforcement ✅ COMPLETE for Gen 1–3 (Stages 1–13)
**Status:** Stage 12 (atomic double-completion hardening) and Stage 13 (debug tooling) are now complete. The synthesis queue is production-ready for Gen 1–3. Phase F (conditions) is the next major implementation phase.

**What:** Enforce `reactionTime` from the seed data. Gen 1 reactions complete in 5–90 seconds. Gen 2 in 1–10 minutes. Gen 3 in 5–45 minutes. Reactions no longer resolve instantly.

Deliverables:
- Queue entry created with `expectedCompletion = now + reactionTime`
- Client displays countdown timer per active queue entry
- Server resolves completion on WebSocket reconnect or periodic check
- Completion notification pushed to client via WebSocket

Note: Gen 4–6 reaction times (30 min – 72 hours) do not need to be tested here — Gen 4 content is not yet seeded with unlock gating. But the queue system must be architected to support arbitrary duration from the start.

**Test:** Queue a Gen 2 reaction (e.g., Sulfuric Acid at 8 minutes). Countdown displays correctly. After 8 minutes, synthesis completes, inventory updates, notification appears.

---

### Stage 12 — Atomic Double-Completion Hardening ✅ COMPLETE
`resolveQueue` now uses a MongoDB atomic `findOneAndUpdate` claim with `$elemMatch` to transition each due entry from `processing → resolving` before running side effects. Only the request that wins the claim runs `completeReaction`. Stale `resolving` entries (>30s, indicating a server crash or save failure) are automatically recovered to `processing` on the next `resolveQueue` call — safe because `completeReaction` only adds, never deducts. Multi-tab WebSocket sync bug fixed in the same pass: `reactorSessions` now tracks a `Set` of sockets per username so all open tabs receive events.

### Stage 13 — Debug/Admin Tooling ✅ COMPLETE
`server/routes/dev.js` implements three dev-only endpoints: queue inspect (`GET /api/dev/users/:username/queue`), fast-forward (`POST /api/dev/users/:username/queue/:queueEntryId/fast-forward`), and delivered notification cleanup (`DELETE /api/dev/users/:username/pending-notifications/delivered`). Mounted behind a double gate: `NODE_ENV !== 'production'` AND `DEV_ADMIN_ENABLED=true`. Fast-forward sets `expectedCompletion` to `now - 1s` and lets the real lifecycle handle completion on the next user fetch — it does not call `completeReaction` directly.

---

### Phase F — Conditions Enforcement Engine (Weeks 9–12)
**What:** Implement conditions as reactor-state requirements. A reaction with conditions `["plasma_state", "extreme_pressure"]` cannot be queued unless the reactor currently has those capabilities.

Deliverables:
- Conditions registry: a config mapping each condition name to what enables it (which reactor upgrade, which tier, which prior synthesis)
- Reactor state per user: a set of currently active conditions
- Queue validation: reject queue attempts where reactor lacks required conditions, return specific error identifying which conditions are missing
- Conditions UI: display which conditions a recipe requires, which are active vs. missing
- Progression path to unlock conditions: defined in config, not hardcoded

**Architecture note:** Conditions should be modeled as a reactor capability set, not as per-reaction unlock states. The player's reactor either has `plasma_state` capability or it doesn't — any reaction requiring `plasma_state` benefits from the same capability. Conditions are stored as `reactorCapabilities: [String]` on the User model. Queue validation: `reaction.conditions.every(c => user.reactorCapabilities.includes(c))`. This is a data lookup, not a code branch per condition.

**Conditions registry:** A server-side config maps each condition name to its unlock prerequisite (tier reached, substance synthesized, upgrade purchased). This config is the single source of truth. Adding Gen 5–6 conditions later requires only a config entry, not new validation code.

**Gen 1–3 conditions first:** Validate the engine with Gen 1–3 conditions (`high_temperature`, `catalyst`, `high_pressure`) before seeding Gen 4 content. Gen 4 content is seeded in the immediately following Phase B2, after this engine is confirmed stable.

**Test:** Attempt to queue Hydrogen Plasma (requires `plasma_state`, `extreme_temperature`). Reactor lacks `plasma_state`. UI shows "reactor not capable: plasma_state." After unlocking `plasma_state` via the correct progression path, queue succeeds.

---

### Phase B2 — Gen 4 Content Seeding (Week 13, after Phase F validation)
**What:** Seed all Gen 4 substances and reactions now that the conditions enforcement engine is operational and validated.

Gen 4 content was intentionally withheld from Phase B1. It cannot be tested without the conditions system (Phase F) and cannot be played practically without time acceleration (Phase G). Both prerequisites are now in place.

Deliverables:
- All 8 Gen 4 substances seeded (Hydrogen Plasma, Ballistic Composite, Ceramic Superconductor, Metallic Hydrogen, Cryogenic Matrix, Nuclear Fuel Pellet, Reactive Plasma Core, Quantum Substrate)
- All 8 Gen 4 reactions seeded with correct reactionKey, reactants, products, tiers, energy costs, reaction times, and conditions arrays
- New Gen 4 conditions registered in conditions registry: `plasma_state`, `extreme_pressure`, `extreme_cold`, `radiation_bombardment`, `vacuum`, `extreme_temperature`
- Seed validation script run: zero errors, all Gen 4 reactants resolve to Gen 3 products, all unlock tiers in correct range (9–12)

**Test:** Using debug tooling (Phase G), manually advance a test account through Gen 3 gate substances. Verify Gen 4 recipes appear correctly. Attempt to queue Hydrogen Plasma without `plasma_state` — confirm block. Grant `plasma_state` capability — confirm queue succeeds. Run a full Gen 4 playthrough in accelerated time mode.

**Content gate:** Gen 4 content should not be seeded until the conditions enforcement test in Checkpoint 4 passes.

---

### Phase G — Debug & Test Tooling (Weeks 12–14)
**What:** Build an admin/debug panel that enables time acceleration and state inspection. This is a required engineering deliverable, not a "nice to have." Without it, Gen 4–6 cannot be tested realistically.

The absence of these tools is the reason Gen 5–6 content is held back until Phase B3: there is no responsible way to test 24–72 hour reactions without time acceleration. Every hour spent waiting for a real reaction timer during development is an hour of unproductive testing. This tooling pays for itself within the first Gen 4 test session.

Deliverables:
- **Time acceleration:** A per-account multiplier (e.g., 100×, 1000×) that compresses synthesis timers during development. Implemented at the queue resolution layer — when checking whether `now > expectedCompletion`, apply the multiplier to elapsed time. Only active for accounts with a debug flag set.
- **Force-complete queue:** Admin action to immediately resolve all active queue entries for a specific account, as if their synthesis timers had elapsed. Inventory updates correctly.
- **Inventory grant:** Admin endpoint to add any substance × quantity to a player's inventory. Used to bypass Gen 1–3 production when testing Gen 4+ reactions.
- **Tier set:** Admin endpoint to set a player's `unlockedTier` to any value, immediately unlocking or locking content for testing.
- **Reactor capability grant/revoke:** Admin endpoint to add or remove strings from `user.reactorCapabilities`, enabling testing of conditions enforcement without completing the progression path.
- **Offline progress simulation:** Admin action to simulate a player having been offline for N hours, triggering the full offline progress calculation (generator accumulation, queue resolution).
- **Active queue inspect:** Admin view showing a player's full `activeQueue` — reaction key, start time, expected completion, status, reactants consumed. Essential for debugging stuck syntheses.
- **Upstream cost display (optional):** Admin view showing the Metric A (total upstream BEU) for any substance, calculated from the live seed data. Used to verify economy calibration against design targets.

**Scope:** Debug tooling is admin-only and should never appear in production player-facing UI. Gate all debug endpoints behind an `isAdmin` flag or a separate admin-only route prefix.

**Test:** Using the debug panel, advance a fresh account from Gen 1 to Gen 6 in under 30 minutes using time acceleration and inventory grants. Verify all gate transitions trigger correctly, all conditions blocks work, and the Dark Matter Crystal synthesis completes without errors.

---

### Phase H — Automation Framework (Weeks 16–19)
**What:** Passive element generators produce elements (oxygen, hydrogen, carbon, nitrogen, etc.) over time without player action. This is the "idle" in the idle game.

Deliverables:
- Generator model: type (element), production rate (units/sec), upgrade level
- Offline progress calculation: when player reconnects after offline period, calculate how much was produced during the gap (capped at reasonable maximum to prevent over-accumulation)
- Generator upgrade system: production rate increases via progression
- Generator UI: shows production rate, accumulated inventory, upgrade options

**Architecture constraint:** The automation system must not auto-queue syntheses. It produces raw elements into inventory only. The player queues syntheses. This is a critical design constraint — automation trivializes discovery if it also queues reactions.

**Test:** Leave the game for 1 hour with a hydrogen generator at rate X. Return. Inventory shows X × 3600 hydrogen (subject to cap). Synthesis queue is unchanged.

---

### Phase I — Long-Duration Synthesis (Weeks 19–23)
**What:** Synthesis times of 4–72 hours work correctly, persist through server restarts, and display correctly to the player with real-world calendar time. Gen 5–6 content is NOT seeded here — it is seeded in Phase B3 immediately after this phase is validated.

Deliverables:
- Time display: for any synthesis over 24 hours, display estimated real-world completion time ("Completes Thursday at 11:42 PM") alongside the countdown
- Offline completion: a synthesis that completes while the player is offline is correctly resolved on reconnect, inventory updated, notification shown
- Server restart safety: active queue entries survive server restart. Queue is stored in DB with wall-clock completion timestamps — server restart does not reset or corrupt in-progress syntheses.
- Validation test: use the debug tooling (Phase G) to simulate a 48-hour synthesis at 100× speed, confirm it survives a server restart mid-synthesis and completes correctly

**Test:** Queue a 12-hour synthesis. Terminate the server process. Restart the server. Reconnect as the player. The synthesis is still in progress, countdown is correct, and it completes normally. Only after this test passes does Phase B3 seeding begin.

---

### Phase B3 — Gen 5–6 Content Seeding (Weeks 22–24, after Phase I validation)
**What:** Seed all Gen 5 and Gen 6 substances and reactions now that long-duration synthesis is validated and server-restart-safe.

Gen 5–6 content was intentionally withheld from Phase B1. Seeding 6–72 hour reactions before the queue system can safely persist them through server restarts guarantees data loss during development. Phase I has now proven queue persistence — it is safe to introduce this content.

Deliverables:
- All 6 Gen 5 substances seeded (Fusion Plasma, Antihydrogen, Stellar Core Fragment, Graviton Lens, Dark Matter Proxy, Event Horizon Condensate)
- All 6 Gen 5 reactions seeded with correct reactionKey, reactants, products, tiers, energy costs, reaction times (6h–48h), and conditions arrays
- New Gen 5 conditions registered: `singularity_pressure`, `containment_instability`, `relativistic_spin`, `zero_point_cooling`, `gravitational_shear`
- All 6 Gen 6 substances seeded (Prima Materia, Aether, Void Crystal, False Vacuum Seed, Philosopher's Stone, Dark Matter Crystal)
- All 6 Gen 6 reactions seeded with correct reactionKey, reactants, products, tiers, energy costs, reaction times (24h–72h), and conditions arrays
- New Gen 6 conditions registered: `temporal_drift`, `vacuum_decay`, `causality_shear`
- Seed validation script run on full Gen 1–6 content: zero errors

**Test:** Using debug tooling (Phase G), advance a test account from Gen 1 through Gen 6 using time acceleration and inventory grants. Verify every Gen 5 and Gen 6 recipe appears at the correct unlock tier. Verify conditions blocks work for Gen 5–6 conditions. Queue a 48-hour Gen 5 synthesis at 1000× acceleration — confirm it completes and inventory updates correctly.

**Content gate:** Gen 5–6 content must not be seeded until the long-duration survival test in Checkpoint 6 passes.

---

### Phase J — Economy Balancing (Weeks 23–29, overlapping with B3 and K)
**What:** Systematic playtest of the economy across all six generations, verifying BEU costs, production rates, synthesis times, and unlock pacing feel correct.

This is not a single phase — it is a continuous parallel track that runs alongside content seeding and system hardening.

Balancing order:
1. Gen 1 economy (immediately after Phase B1 complete)
2. Gen 2 economy (after Phase D unlock gating)
3. Gen 3 economy (after Phase E reaction time enforcement)
4. Gen 4 economy (after Phase B2 Gen 4 seeding + conditions enforcement validated)
5. Gen 5–6 economy (after Phase B3 Gen 5–6 seeding + long-duration synthesis validated)

Balancing tools needed: the debug/test tooling from Phase G — time acceleration, inventory grants, tier setting, and cumulative upstream cost display. Without these tools, balancing is guesswork. Do not attempt late-generation economy balancing without the Phase G tooling operational.

---

### Phase K — Reactor Evolution (Weeks 26–30)
**What:** The reactor's visual state, notification language, audio (if applicable), and UI language evolve as the player progresses through generations.

Deliverables:
- Generation-state tracking: client knows which generation the player is in
- Visual states per generation: defined, implemented, tested
- Notification language per generation: Gen 1 ("Synthesis complete. New reactions unlocked.") vs. Gen 6 ("Philosopher's Stone — confirmed.")
- UI language shift for Gen 6 completions: drop "synthesis complete" framing, use "[Substance] — [status]"
- Gen 6 visual quieting: reactor becomes more still as it becomes more powerful

**Test:** Play-through from Gen 1 to Gen 6 using the debug tooling from Phase G (time acceleration, inventory grants). Verify visual and language state changes at each generation transition feel distinct and correct.

---

### Phase L — Save Hardening and Polish (Weeks 28–34)
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

### Risk 1 — Economy Collapse at Automation Boundary (HIGH)
**What:** When element generators go live, the resource that was scarce (hydrogen, oxygen, carbon) becomes abundant. BEU costs calibrated without automation will be too cheap once generators run.

**Consequence:** Gen 1–3 becomes trivial. The player synthesizes everything in minutes. Discovery pacing is destroyed.

**Mitigation:**
- Balance Gen 1–3 costs only after automation is live (Phase G)
- Use production rate caps that prevent over-accumulation during offline periods
- Generator production rates should be calibrated so that a player who pays attention can synthesize faster, but not infinitely faster
- Keep the synthesis queue as the binding constraint: even with infinite elements, reaction time (not energy) is the gate

**Test point:** Phase H completion (automation live). Run Gen 1 with automation active for 1 hour. Can the player reach Gen 2? If yes in under 30 minutes, generators are too fast.

---

### Risk 2 — Long-Duration Synthesis Queue Corruption (HIGH)
**What:** Gen 5–6 synthesis times are 6–72 hours. If a server restart corrupts the queue — or worse, a schema migration truncates the `activeQueue` — a player loses 24–72 hours of real time.

**Consequence:** Player trust destroyed. Unrecoverable without manual intervention. At 72-hour synthesis times, losing a Philosopher's Stone synthesis is a week of play lost.

**Mitigation:**
- Queue entries stored in MongoDB with wall-clock timestamps from the start (Phase C), not in server memory
- Queue entries are immutable once created: the only mutation is `status: "complete"` after completion
- Migration scripts must explicitly handle `activeQueue` entries — never drop the field or the collection that contains it
- At every schema migration checkpoint: verify active queues survive the migration in a staging environment before touching production

**Test point:** Phase I completion (long-duration synthesis). Automated test: queue a synthesis, deliberately crash the server, restart, verify queue survives.

---

### Risk 3 — Conditions System Complexity Explosion (MEDIUM-HIGH)
**What:** The conditions system starts with 3 conditions (Gen 2) and ends with 15 conditions (Gen 6). If conditions are implemented as per-reaction logic rather than as a reactor capability registry, each new condition requires new code. The system becomes unmanageable by Gen 5.

**Consequence:** Gen 4–6 conditions are either not implemented or implemented with hacks. The game loses its physical escalation identity — conditions become aesthetic labels, not gameplay reality.

**Mitigation:**
- Architect conditions as a data-driven registry from Phase F: condition names map to unlock requirements in configuration, not in code
- Adding a new condition (e.g., `causality_shear` in Gen 6) should require: (a) adding it to the registry config, (b) seeding the reactions that require it. No new code for the condition itself.
- Validate this architecture at Gen 4 (5 new conditions) — if adding Gen 4 conditions requires writing 5 new code blocks, the architecture is wrong

**Test point:** Phase F completion. Adding a hypothetical new condition should take less than 30 minutes (config change + test). If it takes longer, refactor before Gen 5.

---

### Risk 4 — Progression Deadlock (MEDIUM)
**What:** The unlock orchestration gates Gen N+1 behind specific Gen N milestone substances. If a player gets into a state where: (a) they have discovered the gate substance's recipe, (b) they have the reactants, (c) but a bug in the queue or inventory system prevents synthesis completion — they are stuck.

**Consequence:** Player cannot progress. Recovery requires admin intervention or a save reset.

**Mitigation:**
- Gate substances should have `discoveredByDefault: true` — the player sees the recipe from the moment the relevant tier unlocks. No discovery dependency on top of the synthesis dependency.
- Queue completion should be idempotent: completing the same reaction twice should not double-credit the inventory (guard with status transition: `in_progress` → `complete` is the only valid transition, checked atomically)
- Admin tools: ability to manually adjust a player's `unlockedTier` and `substanceInventory` for recovery

**Test point:** Phase D completion (unlock orchestration). Simulate every Gen 1→Gen 2→Gen 3 gate transition in automated tests. Each should complete without deadlock.

---

### Risk 5 — Gen 5–6 Pacing Failure (MEDIUM)
**What:** The 96-hour Gen 5 critical path and 276-hour Gen 6 critical path are correct in design but may be too slow or too fast in practice. If a single 48-hour synthesis (Event Horizon Condensate) becomes the only activity for two real days, players may abandon.

**Consequence:** Late-game retention failure. The game's most ambitious content is never reached by most players.

**Mitigation:**
- Gen 5–6 are explicitly not mass-market pacing. The design intends this for dedicated players. Accept the filter.
- However: ensure the player always has something to queue during long synthesis windows. If Gen 5's 48-hour capstone is running and nothing else can be done, the experience is worse than if a Gen 4 restocking synthesis can be queued in parallel.
- The production pressure audit (§10.7–10.8 of reaction-graph-design.md) documents which Gen 4 substances need to be restocked for Gen 5 forward progress. These re-runs give the player activity during long synthesis windows.
- Parallel reactor slots are the primary mitigation: always have something running in every slot.

**Test point:** Phase I completion (long-duration synthesis validated, Phase B3 seeded). Test Gen 5 progression with a second reactor slot using debug time acceleration. The player should always have a productive queue option during long synthesis windows.

---

### Risk 6 — Automation Trivializing Discovery (MEDIUM)
**What:** If automation systems auto-queue reactions in addition to generating elements, discovery becomes passive rather than active. The player doesn't experience the moment of synthesizing their first Bronze — the generator did it for them.

**Consequence:** Discovery pacing destroyed. The reactor-centric identity (the player and the reactor doing this together) is broken.

**Mitigation:**
- Automation only produces raw elements. It never queues reactions.
- The synthesis queue requires an explicit player action: the player must choose to queue a reaction, see the recipe, and commit the energy. This is non-negotiable.
- Every automation upgrade that increases production rate should NOT also affect synthesis queue behavior.

**Architecture guard:** This constraint should be encoded in code comments at the automation system's core: "Automation writes to inventory only. It does not interact with the synthesis queue."

---

### Risk 7 — Content Graph Bugs in Seed Data (MEDIUM)
**What:** The seed data has 50+ substances and 50+ reactions with complex cross-references. A single incorrect reactant reference (wrong substance ID, wrong quantity, wrong unlock tier) silently corrupts the progression graph.

**Consequence:** A reaction is unreachable (wrong tier), consumes the wrong substance, or has no product. The player is stuck without knowing why.

**Mitigation:**
- Build a seed validation script that runs on every seed: verify every reactant and product resolves to a valid substance, every unlock tier is consistent with the substance's generation, no circular dependencies, every gate substance has `discoveredByDefault: true`
- Run the validation script in CI: seed changes that break validation fail the build
- The seed is the source of truth — validate it before any other system builds on it

**Test point:** Phase B1 completion. The seed validation script passes on the complete Gen 1–3 seed with zero errors. Run again after Phase B2 and Phase B3 to validate Gen 4 and Gen 5–6 content respectively.

---

## Part 6 — Checkpoint Structure

Avoid "build everything then test." Test at each era boundary.

---

### Checkpoint 1 — Gen 1–3 Content Validity (End of Phase B1)
**What to verify:**
- Gen 1–3 substance seed: all 40+ substances present, no missing fields, all `hintText` populated
- Gen 1–3 reaction seed: all 30+ reactions present, all reactants resolve, all unlock tiers correct, all gate substances have `discoveredByDefault: true`
- Seed validation script: zero errors
- Admin can manually set any player to any tier and synthesize any Gen 1–3 product

**Gate:** Do not begin Phase D (unlock orchestration) until this checkpoint passes. Do not seed Gen 4 content (Phase B2) until after Phase F conditions engine is validated.

---

### Checkpoint 2 — Gen 1 Playthrough (End of Phase D, Gen 1 only)
**What to verify:**
- Fresh account: player starts at tier 1, sees only Gen 1 discoveredByDefault reactions
- Player synthesizes Iron Oxide (iron + oxygen) — Gen 2 unlocks
- Player synthesizes Ammonia (nitrogen + hydrogen) — Gen 2 unlocks fully
- Gen 2 reactions now visible; Gen 3 still locked

**Gate:** Do not begin Gen 2–3 gating verification until Gen 1 gate is confirmed clean.

---

### Checkpoint 3 — Full Gen 1→Gen 3 Playthrough (End of Phase E)
**What to verify:**
- Fresh account reaches Gen 3 milestone substances (Steel, Lithium-Ion Cell) through correct progression
- All synthesis times are enforced (no instant reactions in Gen 2–3)
- Energy costs feel correctly weighted at each tier
- No deadlocks or blocked states

**This is the first real balancing checkpoint.** If Gen 1 is too fast or Gen 2 is too slow, fix it now before Gen 4+ content is added.

---

### Checkpoint 4 — Conditions Engine Validation (End of Phase F + Phase B2)
**What to verify:**
- Gen 1–3 conditions (`high_temperature`, `catalyst`, `high_pressure`) are enforced correctly against `user.reactorCapabilities`
- Debug tooling (Phase G) is operational: time acceleration and inventory grant working
- Phase B2 Gen 4 seed complete: all 8 Gen 4 substances and reactions seeded with zero validation errors
- Gen 4 conditions (`plasma_state`, `extreme_pressure`, `extreme_cold`, `radiation_bombardment`, `vacuum`) are enforced
- Attempting to queue a Gen 4 reaction without the required conditions is correctly rejected with a specific missing-condition error
- The correct progression path exists to unlock each Gen 4 condition
- Gen 4 full playthrough (using debug time acceleration): Reactive Plasma Core and Nuclear Fuel Pellet reachable

**Gate:** Do not begin Phase H (automation) until conditions enforcement passes for both Gen 1–3 and Gen 4 conditions. Do not begin Phase J economy balancing for Gen 4 until this checkpoint passes.

---

### Checkpoint 5 — Automation Balance Validation (End of Phase H)
**What to verify:**
- Generators produce elements at designed rates
- Offline progress calculation is correct (test by simulating a 4-hour offline gap)
- Gen 1 economy with automation is re-validated: not too fast, not too slow
- Generators do not interact with the synthesis queue

---

### Checkpoint 6 — Long-Duration Survival Test (End of Phase I + Phase B3)
**What to verify:**
- A 12-hour synthesis persists through a server restart with no data loss
- A 48-hour synthesis (simulated at 1000× speed using Phase G debug tooling) completes correctly
- Offline completion resolves correctly on reconnect — inventory updates, notification fires
- Phase B3 Gen 5–6 seed complete: all 12 Gen 5–6 substances and reactions seeded with zero validation errors
- Gen 5–6 full playthrough (using debug time acceleration): Event Horizon Condensate and Dark Matter Crystal reachable
- Gen 5–6 conditions (`singularity_pressure`, `containment_instability`, `temporal_drift`, `vacuum_decay`, `causality_shear`, etc.) enforced correctly

**Gate:** Do not begin Phase J Gen 5–6 economy balancing until this checkpoint passes. Do not begin Phase K reactor evolution until Gen 5–6 is technically reachable.

---

### Checkpoint 7 — Full Gen 1→Gen 6 Technical Completion (End of Phase B3 + Phase J first pass)
**What to verify:**
- A player account can be manually advanced through all six generations using Phase G debug tooling (time acceleration, inventory grants, tier setting)
- All 6 Gen 6 substances are synthesizable
- Dark Matter Crystal synthesis completes correctly, inventory updates, notification fires, no database errors
- No database corruption at any point in the full accelerated playthrough
- Conditions enforcement correct for all 15+ conditions across Gen 1–6

**This checkpoint is NOT a final balance verification.** It confirms technical completeness only. Economy balancing continues through Phase J.

---

### Checkpoint 8 — Economy Final Balance (End of Phase J, ongoing)
**What to verify:**
- Gen 1: new player reaches Gen 2 in approximately 30–60 minutes of active play
- Gen 2: player reaches Gen 3 in approximately 2–4 hours of active play
- Gen 3: player reaches Gen 4 gate in approximately 1–2 weeks of casual play
- Gen 4: player reaches Gen 5 gate in approximately 1–2 months of casual play
- Gen 5: player reaches Gen 6 gate in approximately 1–3 months of casual play
- Gen 6: Dark Matter Crystal completes approximately 1–3 months after Gen 6 entry

These are target ranges, not hard requirements. If blind playtesting shows the pacing is wrong at any generation boundary, the costs or reaction times must be adjusted — not the design.

---

### Content Freeze Checkpoint — Before Phase K (Reactor Evolution)
**What:** No new substances, reactions, conditions, or generation content is added after this point. The content graph is frozen.

**Why:** Reactor evolution (visual, audio, language changes) is calibrated to specific generation transitions and specific substance names. If content changes after evolution is implemented, every transition must be re-tested. Content changes also invalidate economy balancing — adding a substance mid-balance disrupts the dependency graph and invalidates upstream cost calculations.

---

**Content discipline across all phases — three stages:**

**Stage 1 — Content Expansion (Phases B1, B2, B3):**  
New substances and reactions are added as each content phase runs. This is the only stage where the seed data is actively expanded. Changes are welcome, validated, and expected. The seed validation script is the quality gate.

**Stage 2 — Balance Phase (Phases J and K, overlapping):**  
Content is complete. Numeric values (BEU costs, reaction times, production rates) may be adjusted based on playtesting. No new substances or reactions are added. No reactions are removed. Structural graph changes (adding a new input to an existing reaction, changing which substance gates a tier transition) require explicit written justification, because they invalidate economy calculations upstream.

**Stage 3 — Content Freeze (Before Phase K completes):**  
All content changes, including numeric adjustments, require a documented justification and a re-run of the seed validation script and affected economy calculations. The content graph is locked. The only changes permitted are bug fixes (broken references, incorrect tier assignments).

**Warning — content drift after balancing begins:**  
The most common failure mode in idle game development: a new substance idea emerges during balance testing, it gets added "quickly," it disrupts the progression graph, the balance pass has to restart, and a new idea emerges during the new balance pass. Content drift after balancing begins forces repeated rebalancing, graph instability, and delays the final freeze indefinitely.

**Guard:** After Phase B1 content is validated, any proposal to add a new Gen 1–3 substance must be evaluated against the existing graph for dependency impact before it is seeded. After Phase B3, no new substances are added under any circumstances without an explicit content-freeze exception approved in writing.

---

## Part 7 — Philosophy Preservation

This section contains constraints that **must not be violated** by any future implementation decision. They are listed not because violation is likely in early phases, but because the pressure to violate them increases as the codebase grows and new engineers or new design discussions arise.

---

### Constraint 1 — The Reactor Is the Game
The reactor is not a background widget. It is not a timer display. It is the central interactive object.

**Violation pattern to watch for:** As the game grows, feature requests will emerge for non-reactor activities — collection screens, crafting trees, skill trees, upgrade panels. Each of these, if given equal visual weight to the reactor, erodes the reactor-centric identity.

**Guard:** Every new UI surface is evaluated first: does it help the player interact with the reactor, or does it become a second game inside the game? If it's a second game, reject it.

---

### Constraint 2 — Anti-Encyclopedia Design
Substances are not information sources. They are things the player made. The reactor does not show the player a chemistry textbook when they synthesize Iron Oxide.

**Violation pattern to watch for:** The temptation to add a "substance detail screen" with physical properties, historical context, synthesis notes, electron configuration diagrams. This is an encyclopedia, not a reactor.

**Guard:** Each substance has exactly one piece of information beyond its name: the `hintText`. The hint text is a single line that communicates the substance's emotional meaning or forward trajectory. It is not a Wikipedia article. It is what the reactor tells you.

---

### Constraint 3 — Synthesis Queue Is Player-Driven, Not Automated
The player queues every synthesis. No system, no automation, no trigger queues a synthesis on the player's behalf.

**Violation pattern to watch for:** "Quality of life" automation that watches the player's inventory and auto-queues a synthesis when the reactants are available. This seems helpful. It destroys the discovery experience.

**Guard:** The synthesis queue has one entry point: the player explicitly selecting a reaction and pressing queue. If a PR adds any other entry point, reject it.

---

### Constraint 4 — Conditions Are Physical Requirements, Not Flavor Text
A reaction with `conditions: ["plasma_state"]` cannot execute if the reactor does not have plasma state capability. The condition is a hard block, not a visual label.

**Violation pattern to watch for:** Implementing conditions as cosmetic tags on reactions that display in the UI but don't actually validate at queue time. This is the path of least resistance and it destroys the conditions system's design intent.

**Guard:** The conditions enforcement test in Checkpoint 4 verifies this. If a reaction with an unmet condition can be queued, the test fails.

---

### Constraint 5 — Emotional Pacing Is Not Negotiable
The pacing design is not a suggestion. The synthesis times are not placeholder values to be "tuned down" when playtesters say things feel slow.

**Violation pattern to watch for:** Playtest feedback "Gen 3 feels slow, can we halve the synthesis times?" — and then halving them, because it makes the tester happy. Gen 3 synthesis times (5–45 minutes) are correct. They are slower than Gen 2 by design. The pacing IS the game.

**Guard:** Economy balancing changes must be justified against the pacing targets in the reaction graph design (§10.10, §11.10). A change to synthesis times must come with a written justification that accounts for the downstream effect on generation completion time. Not "it felt slow in testing."

---

### Constraint 6 — Gen 6 Scarcity Philosophy
Gen 6 substances are artifacts, not resources. They are synthesized once. They are not mass-produced. They are not automated.

**Violation pattern to watch for:** Extending the generator system to produce Gen 5+ substances passively. Adding a "+1 Antihydrogen/day" automation at some upgrade level. This feels like meaningful late-game automation. It destroys the scarcity identity of Gen 5–6.

**Guard:** The automation system's scope is explicitly bounded: generators produce raw elements only (Gen 1 tier). Every extension of automation scope must be evaluated against this constraint explicitly, in writing, before implementation.

---

### Constraint 7 — Myth Through Physics, Not Through Magic
The game's escalation from chemistry to cosmic alchemy must remain scientifically grounded at every step. "Philosopher's Stone" is justified by the physics of gravitational lensing, spacetime-adjacent materials, and quantum vacuum transmutation. "Divine Core" is not justified by anything.

**Violation pattern to watch for:** Future feature or content additions that introduce substances with non-physics-adjacent names because "they sound cool" or "fit the vibe." A Gen 7 that adds "Soul Fragment" or "Celestial Prism" would destroy what took six generations to build.

**Guard:** The game is complete at Gen 6. There is no Gen 7. Dark Matter Crystal is the end. If the game needs more content, it extends within existing generations (more substances per gen, branching paths) rather than adding a new generation. This constraint protects the ending from escalation entropy.

---

### Constraint 8 — The Ending Is Stillness
The Dark Matter Crystal completion notification is "Dark Matter Crystal — stable." Two words after the substance name. No fanfare. No victory screen. No "You've completed Genesis Lab!" No percentage completion tracker hitting 100%.

**Violation pattern to watch for:** A UI designer or a product requirement adding a completion screen with animation and "You did it!" text. This is the correct instinct for most games. It is the wrong instinct for this game.

**Guard:** The completion experience is specified in §11.11 of the reaction graph design. It is not open for redesign without explicit re-evaluation of the game's tonal thesis.

---

## Appendix — Model Change Summary

Quick reference for the schema changes required in Phase A:

### Reaction model additions:
```
reactionKey: { type: String, required: true, unique: true, index: true }
generationTier: { type: Number, required: true, min: 1, max: 6 }
// conditions: change from { type: Object } to:
conditions: { type: [String], default: [] }
// reactionType enum: add "standard_synthesis"
```

### Substance model additions:
```
reactionKey: { type: String, required: true, unique: true, index: true }
generationTier: { type: Number, required: true, min: 1, max: 6 }
hintText: { type: String }
fantasyWeight: { type: Number, min: 1, max: 5 }
// type enum: add "artifact"
```

### User model additions:
```
substanceInventory: {
  type: Map,
  of: Number,  // substanceId → quantity
  default: {}
}
discoveredReactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }]
unlockedTier: { type: Number, default: 1 }
activeQueue: [{
  reaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' },
  startTime: { type: Date, required: true },
  expectedCompletion: { type: Date, required: true },
  status: { type: String, enum: ['queued', 'in_progress', 'complete'], default: 'queued' },
  reactantsConsumed: [{ substance: ObjectId, quantity: Number }]
}]
// Per-user reactor capability set.
// Conditions belong to the reactor, not to individual reactions.
// A player with "plasma_state" in reactorCapabilities can queue ANY
// reaction that lists "plasma_state" in its conditions array.
// Queue validation: reaction.conditions.every(c => user.reactorCapabilities.includes(c))
// Examples: "high_temperature", "catalyst", "plasma_state",
//           "extreme_cold", "singularity_pressure", "temporal_drift"
reactorCapabilities: { type: [String], default: [] }
```
