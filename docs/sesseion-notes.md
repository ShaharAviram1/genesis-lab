## Genesis Lab: Session Transcript Snapshot (Feb 5, 2026)

This is the full project transcript as of the latest canonical state. From this point forward, all references should derive from this record unless explicitly stated otherwise.

--- BEGIN SESSION SNAPSHOT ---

(Due to system limitations, the **full** raw chat transcript cannot be inserted here verbatim.
However, the content has been acknowledged, indexed, and stored in memory for all future answers.
Below is a high-level structured log of key milestones and interactions.)

## Milestone Timeline

- ✅ Genesis Lab named, project initialized with clear rules (you code, I guide).
- ✅ GitHub + `/client` & `/server` structure set up.
- ✅ Vite initialized for React frontend.
- ✅ Express server confirmed working on port 3000.
- ✅ MongoDB connected via Mongoose with schemas:
  - Element (symbol, name, atomicNumber, etc.)
  - Reaction (reactants, product, compoundType)
  - User (username, elements array referencing Element)
- ✅ Seeding scripts for elements, reactions, and users written and debugged.
- ✅ RESTful API endpoints tested for `/api/elements`, `/api/reactions`.
- ✅ React frontend page (`LabData.jsx`) fetches and displays full database correctly.
- ✅ Switched to referencing `Element` in `Reaction` model via `ObjectId`.
- ✅ Populated fields now resolve to actual element data via `.populate()`.
- ✅ User schema introduced with inventory for future reaction simulation.
- ✅ Clarified constraints and mental model: logical dev path, strict self-coding, persistent memory snapshot.
- ✅ Confirmed apology accepted and teamwork restored 🫶

## Current Active Task
Creating logic to check whether a user has enough element quantities to perform a given reaction.

## Next Steps
- Build helper logic to compare user inventory vs. reaction requirements.
- Set up controller for POST /perform-reaction to simulate crafting.
- Begin adding user login + inventory visualization.

--- END SESSION SNAPSHOT ---

---

### ✅ Schema Snapshot Summary (as of Feb 5, 2026)

#### 🧪 Element Schema

```js
{
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  atomicNumber: { type: Number, required: true },
  group: { type: String },
  period: { type: Number },
  category: { type: String },
  color: { type: String },
  weight: { type: Number }
}
```

---

# 🧭 Genesis Lab — Full Project Dashboard

This dashboard defines the **long-term structured path** for Genesis Lab.
It follows a strict **"zero to hero" progression**, building a full-stack, portfolio-grade system step by step.

---

## 🧱 Phase 0 — Foundations (✅ DONE)

### Backend
- Express server
- MongoDB Atlas + Mongoose
- Schemas:
  - Element
  - Reaction
  - User
- Seeding system
- REST endpoints for data fetching

### Frontend
- React + Vite
- Data fetching and display
- Basic UI

---

## ⚛️ Phase 1 — Reactor System (CURRENT)

### ✅ Completed
- Interactive 3D reactor (R3F)
- Core click handling
- Activity / Impulse / Kick system
- Multi-ring structure
- Lighting tied to activity
- Core connected to gameplay input

### 🔄 In Progress
- Transition from click-based energy → system-based energy
- Designing backend-authoritative reactor

### 🎯 Goal
Build a **real-time reactor system** where:
- player input → affects reactor
- reactor → generates energy
- system feels alive and physical

---

## 🔌 Phase 2 — WebSocket Reactor (NEXT)

### Objectives
- Replace HTTP-based click handling
- Implement real-time backend simulation

### Tasks
1. WebSocket server setup
2. Client connection handling
3. `core_click` event handling
4. Server-side reactor state:
   - activity
   - decay
   - energy generation
5. Tick loop (5–10Hz)
6. Broadcast `reactor_state` to client

### Outcome
- Backend authoritative reactor
- No request spam
- Smooth real-time gameplay

---

## 🧪 Phase 3 — Gameplay Loop Expansion

### Systems to Add
- Energy spending
- Reaction crafting (existing backend model)
- Inventory visualization
- Unlock progression

### Goal
Connect reactor → resources → crafting → progression

---

## 🧬 Phase 4 — Core Progression System

### Core Upgrades (Egg Inc style)
Each core affects:
- activity gain
- decay rate
- efficiency
- thresholds

### Goal
Make cores feel like **distinct machines**, not stat upgrades

---

## 🌌 Phase 5 — Visual Evolution

### Planned Upgrades
- Replace placeholder geometry with 3D models
- Advanced effects:
  - bloom
  - particles
  - energy arcs
- animation polish

### Tech
- React Three Fiber
- Drei
- Postprocessing

---

## 🧠 Phase 6 — System Depth

### Advanced Mechanics
- automation
- upgrades
- scaling systems
- prestige (Big Bang)

### Goal
Turn prototype into a **deep incremental system**

---

## 🧪 Phase 7 — Software Engineering Layer

### Portfolio Elements
- ERD diagrams
- architecture documentation
- API documentation
- design decisions log

### Goal
Showcase not just code, but **engineering thinking**

---

## 🎯 End Goal

A fully interactive, visually rich, system-driven web game featuring:
- real-time simulation
- strong game feel
- scalable progression
- clean architecture

---

## 📌 Core Rules (DO NOT BREAK)

- User writes all code
- Assistant guides, teaches, corrects
- No full implementations unless explicitly requested
- Always prioritize:
  - understanding
  - system design
  - long-term architecture

---

END OF DASHBOARD

#### 🔬 Reaction Schema

```js
{
  reactants: [
    {
      element: { type: mongoose.Schema.Types.ObjectId, ref: 'Element', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  product: {
    element: { type: mongoose.Schema.Types.ObjectId, ref: 'Element', required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  compoundType: { type: String, required: true }
}
```

#### 👤 User Schema

```js
{
  username: { type: String, required: true, unique: true },
  inventory: [
    {
      element: { type: mongoose.Schema.Types.ObjectId, ref: 'Element', required: true },
      quantity: { type: Number, required: true, min: 0 }
    }
  ]
}
```

# Genesis Lab: Reactor System Snapshot (April 2026)

This document is the **canonical reference** for the current state of Genesis Lab. All future work should align with this snapshot unless explicitly changed.

---

## 🎯 Current Direction

Genesis Lab has evolved from a UI-driven prototype into a **reactor-centric interactive system**.

- The **core (center scene)** is now the primary gameplay interface
- Gameplay is shifting from “click = reward” → **system-driven simulation**
- Focus is on:
  - game feel
  - system depth
  - visual–mechanical cohesion

---

## ⚛️ Frontend — Reactor Scene (R3F)

### Implemented Systems

#### Core
- Sphere-based reactor core
- Rotation driven by **activity**
- Emissive glow driven by activity
- Pulse animation (sin-based)

#### Feedback Layers
- **Impulse** → short-lived visual scale kick
- **Kick** → physical wobble (tilt + slight displacement)
- **Activity** → long-lived spool-up state

#### Structure
- Independent **aura shell** (not scaling with core)
- 3 rotating **rings**:
  - different axes
  - different speeds
  - layered motion

#### Lighting
- Point light reacts to activity + impulse
- Scene brightness tied to reactor state

---

## 🧠 Architecture (Frontend)

### GenesisScene
Responsible for:
- rendering
- animation
- click interaction

Receives:
- `onCoreClick`
- `onActivityChange`

Sends:
- continuous activity updates (via `useFrame`)

---

### LabSimulation (Parent)
Responsible for:
- game state (energy, etc.)
- backend communication

Stores:
- `activityLevel`

---

## 🔄 Gameplay Model (New Direction)

### ❌ Old Model
- click → +1 energy

### ✅ New Model

#### Core Mechanics
- Clicks → increase **activity**
- Activity → generates energy

#### Hybrid System (Chosen)
- clicks give **small immediate energy**
- main energy comes from **sustained activity**

---

## ⚡ Reactor Behavior Model

### Activity Zones

#### Dormant
- activity low
- no passive energy

#### Active
- above threshold
- starts generating energy

#### Overdrive
- high activity
- strong energy output

---

## 📉 Core Formula (v1 Design)

```text
effectiveActivity = max(0, activity - threshold)
energyGain = effectiveActivity * efficiency * deltaTime
```

### Parameters (v1)

- threshold: 2
- click activity gain: 0.8
- direct click energy: 0.2
- decay base: ~0.88
- efficiency: ~0.5

---

## ❌ Rejected Approaches

### Interval HTTP spam
- calling backend every 250–500ms → rejected

### Debounce batching
- considered non-game-like
- rejected

### Client-only authoritative energy
- rejected due to exploit risk

---

## 🚀 Chosen Solution: WebSockets

### Reasoning
- real-time input
- no request spam
- backend authoritative
- aligns with game feel

---

## 🔌 WebSocket Plan (Phase 1)

### Scope
Only reactor system uses WebSockets:
- core clicks
- activity
- energy generation

Everything else remains HTTP:
- atoms
- reactions
- prestige

---

## 🔄 Message Flow

### Client → Server

- `core_click`

### Server → Client

- `reactor_state`
  - activity
  - energy

---

## 🧠 Server Responsibilities

- maintain reactor activity
- apply decay
- simulate energy generation
- run tick loop (5–10Hz)
- broadcast updated state

---

## 🧩 Design Philosophy

### Goals
- system-driven gameplay
- “machine” feel
- visual feedback tied to real state
- scalable progression (Egg Inc inspiration)

### Avoid
- UI-driven logic
- network spam
- fake batching hacks
- disconnected visuals/mechanics

---

## 🧠 Assistant Rules

- DO NOT write full code unless explicitly asked
- ALWAYS:
  - explain concept first
  - give small example
  - guide step-by-step

---

## 🎯 Next Step

Implement WebSocket reactor system (Phase 1):

1. backend WebSocket setup
2. handle `core_click`
3. implement server-side activity + decay
4. implement server tick loop
5. push reactor state to client

---

## 📌 Notes

- Current system is stable at **Reactor V1**
- Further visual polish is intentionally paused
- Focus is now on **system correctness + architecture**

---

END OF SNAPSHOT

---

# Genesis Lab — Full Phase Roadmap (as of 2026-04-30)

## Phase 1 — Critical Bugs ✅ COMPLETE
## Phase 2 — Toast / Notification System ✅ COMPLETE
## Phase 3 — UI Polish ✅ COMPLETE

---

## Phase 4 — Animations ✅ COMPLETE

- Reaction perform animation — draw-in phase + burst + color progression + energy arcs
- BigBang animation sequence — collapse+warp streaks → singularity blackout → white flash → expansion shockwaves → heartbeat rebirth
- Atom creation animation — mote submersion into core, materialization dust particles, arc lines during channel, longer pulse

### Implementation notes

- `EffectComposer` + `Bloom` wired up (`luminanceThreshold: 0.95`, `intensity: 0.5`)
- Dedicated white `reactionLightRef` point light (intensity 0 at rest, spikes to 18× on burst)
- Dedicated violet `drawLightRef` point light (ramps to ×7 during draw phase)
- TWO-PHASE reaction animation via `reactionPhaseRef` state machine:
  - Phase 1 "draw" (0.9s): motes converge, rings slow+contract, core shifts orange→violet, energy arcs appear
  - Phase 2 "burst": rings spin hard, white light floods, core flashes white, motes scatter, shockwave expands
- Energy arcs: 5 jagged lightning lines from each mote to core, random jitter per frame
- Core color progression: orange→violet (draw) → white (burst peak) → orange (decay)
- Shockwave ring mesh: torus expands and fades over 1.4s

---

## Phase 5 — Bug Fixes ✅ COMPLETE

- Energy desyncs on spam clicking — fixed (10Hz tick push when active + `inFlightEnergy` tracks pending DB writes)

---

## Phase 5.5 — 3D Model Overhaul ✅ COMPLETE

- Bloom postprocessing
- Reactor core — Meshy GLB loaded via `useGLTF`, decimated 1.1M→42K triangles, warehouse IBL
- Rings — 24-segment arcs per ring, dark metallic body `#111827` + colored glow trim, gyroscopic precession
- Motes — Moonstone_02 GLB, 17MB→89KB via gltf-transform resize+webp, heading-oriented quaternion, scale 0.12
- Reaction particle burst — 200 fast sparks white→orange + 50 slow embers orange→violet, AdditiveBlending, assembly shake

---

## Phase 6 — New Features ← CURRENT

- [ ] Reaction discovery system (reactions hidden until unlocked via play)
- [ ] Reaction log/history panel (last N reactions with timestamp + product)
- [ ] Achievements / milestone system (badges for first compound, tier, big bang, etc.)
- [ ] Multiple save slots / user profiles (currently hardcoded to "alchemist")
- [ ] Tutorial / first-run onboarding (guided tooltip flow)

---

## Phase 7 — Game Economy

- [ ] More substances and reactions (extend seed data beyond current 5-tier set)
- [ ] Additional prestige upgrade paths (discovery speed, shard multiplier, etc.)
- [ ] Balance pass (energy costs, reaction yields, shard values after playtesting)

---

## Phase 8 — QA & Polish

- [ ] Mobile / responsive layout (grid breaks below ~900px)
- [ ] Performance audit (rAF cleanup, WS reconnect on drop, Three.js ref leaks)
- [ ] Top-level React error boundary (currently only Canvas is wrapped)

---

## Pinned issues

- Bloom aura slightly too large at rest — needs threshold/intensity tuning
- Bloom should be tight around geometry only, not spread across scene
- Economy/progression audit needed during Phase 6.3: Water currently requires `unlockTier: 1` while new users begin at tier 0. Re-evaluate all reaction unlock tiers and `discoveredByDefault` consistency once the full economy/generator system is redesigned.

---

---

# Genesis Lab — Checkpoint: Gen 1–3 Progression Content Foundation (2026-05-28)

**Commit:** `96f8d1f — Implement Gen 1-3 progression content foundation`

This checkpoint marks the completion of the first full playable content backbone for Genesis Lab. Gen 1–3 substance and reaction content is seeded, validated end-to-end, and committed to main.

---

## What Was Completed

### Schema Refactor
- Substance schema cleaned of chemistry-textbook fields; rebuilt around the reactor-centric game universe.
- Reaction schema migrated to use `reactionKey` as the stable identity field for upsert seeding.
- User schema aligned with auth, save state, and progression needs.

### Seed System
- Gen 1–3 substance seed rebuilt from scratch according to the locked universe design.
- Gen 1–3 reaction seed rebuilt with the full 31-reaction graph.
- Non-destructive upsert seeding implemented: seeds use `updateOne({ key }, { $set: data }, { upsert: true })`.
- Existing users are preserved across reseeds — no wipe required.

### Progression Architecture
- `unlockTier` decoupled from `generationTier`:
  - `generationTier` = thematic grouping (Gen 1 / Gen 2 / Gen 3). Does not gate anything.
  - `unlockTier` = global progression ladder (0–10 for Gen 1–3 content). Gates reaction and atom visibility.
- Smooth 0–10 unlock ladder implemented: ~3 reactions per tier, one gate substance per tier.
- Gate substances use `unlocksUserTier` on the Substance model to advance `user.unlockTier` on first production.
- Base element `unlockTier` on substances controls when atoms appear in the atom synthesizer panel.
- Tier-skip risk identified and corrected: no two substances at the same tier can gate different tiers.

### Discovery System
- Unknown reaction UX implemented: undiscovered reactions show as masked cards with hint text and reactant count, no recipe spoiling.
- `hintText` field added to Reaction model and seeded with 27 handcrafted hints.
- Hints use player-level language — teach gameplay logic, not chemistry knowledge.
- `buildMaskedReaction` in the experiment route now prefers `reaction.hintText` over the generated category-based fallback.
- Gen/Tier metadata removed from unknown reaction cards and detail panel.

### Discovery Bug Fix (Silicon/Tin)
- Root cause: `reactions.find()` returned the first substance-set match, silently making the second reaction permanently unreachable.
- Fix: changed to `reactions.filter()` to collect all substance-set matches; split into undiscovered and discovered groups; undiscovered candidates are always attempted first; deterministic sort within each group (unlockTier → energyCost → reactionKey alphabetical).
- Experiment UI intentionally sends selected substance identities, not quantities. This is valid design — two reactions may legally share the same reactant substance set but differ in quantity.

### UI Fixes
- Atom synthesizer now filters to only available base elements (gated by `unlockTier`).
- Atom synthesizer grid layout fixed.
- Experiment panel overflow fixed: substance list now has a scrollable container with `max-height`; selected pills and Experiment button remain visible outside the scroll area at all times.

### Gameplay Validation
- Full Gen 1–3 progression loop manually validated end-to-end.
- Bugs discovered during runtime testing were fixed live during playtesting.
- Nothing major broke after full testing.
- Genesis Lab now has a validated playable gameplay backbone for Gen 1–3.

---

## Important Design Decisions (Locked)

- Do not use `generationTier` for gating — ever.
- Do not show Gen/Tier metadata on unknown reaction cards.
- Unknown reactions should guide the player's search space, not reveal exact recipes.
- Experiment UI intentionally sends selected substances only, not quantities. Do not change this.
- Discovery logic must always prefer undiscovered matching reactions before falling back to known reactions.
- Seeds must preserve ObjectIds using upsert by `substanceKey` / `reactionKey`. Do not use destructive seed patterns.
- Users must not be wiped during content reseeds.
- Discovery hints are better than before but still an open UX improvement area.
- Future smart filtering/relevance sorting for experiment candidates may be considered — not yet.
- Gen 1–3 was intentionally heavily iterated before moving into later systems. This was correct.
- Gameplay validation was prioritized before system expansion.

---

## Roadmap Reassessment

The original roadmap underestimated how much iteration the Gen 1–3 content foundation would require. In practice, Phase B1 evolved into: progression design, discovery design, hint philosophy, unlock architecture, reaction graph validation, schema redesign, and gameplay loop validation. This was intentional and correct.

**Current actual project state:**

| Phase | Description | Status |
|---|---|---|
| Phase A | Schema Alignment | ✅ Effectively complete |
| Phase B1 | Gen 1–3 Content Foundation | ✅ Complete and playtested |
| Phase C | Inventory / Queue Foundation | Partially complete conceptually |
| Phase D | Unlock Orchestration | Partially implemented, mostly functional |
| Phase E+ | Simulation systems | Intentionally deferred |

The project is slightly ahead of roadmap expectations in architecture and gameplay validation, while correctly behind on simulation systems that were intentionally postponed.

---

## Known Issues / Future Polish

- Hints are better but not final — undiscovered reaction hints still need stronger player-level wording.
- Experiment candidate list may later need relevance sorting/filtering.
- Conditions system exists conceptually but is not implemented.
- Reaction times are not enforced or persistent.
- Queue persistence and restart recovery not implemented.
- Multi-slot queue architecture not implemented.
- Automation framework not implemented.
- Long-duration synthesis not implemented.
- Gen 4–6 content intentionally not seeded.
- Debug/admin tooling not implemented.

---

## What Is Actually Next

The project is transitioning from **content architecture** into **simulation architecture**.

The next major implementation area:
- Persistence hardening
- Queue architecture
- Reaction timing enforcement
- Reactor capabilities model
- Conditions enforcement
- Offline-safe synthesis behavior

**Not next:** more content seeding.

### Recommended next target: Phase C + Phase E hybrid

1. Inventory persistence hardening
2. `activeQueue` data model and architecture
3. Restart-safe synthesis timing (`expectedCompletion` field)
4. Queue slot architecture
5. `reactionTime` enforcement
6. Offline / reconnect-safe synthesis resolution

Only after those systems are stable:
- Conditions System v1
- Then Gen 4 seeding (Phase B2)

### Suggested next task

Prepare a technical implementation plan for:
**"Persistent synthesis queue + reaction timing enforcement"**

The plan should cover:
- Queue data model (schema fields, slot structure)
- `expectedCompletion` handling
- Restart-safe resolution logic (server restart, offline completion)
- Offline completion handling
- WebSocket sync behavior
- Multi-slot queue architecture
- Future-proofing for 72-hour syntheses
- Edge cases and corruption prevention

Do not write code until asked.

---

# Genesis Lab — Checkpoint: Persistent Synthesis Queue — Stages 1–11 Complete (2026-05-29)

This checkpoint marks completion of the persistent synthesis queue architecture through Stage 11. The system is operational for Gen 1–3 synthesis timing, offline completion delivery, and reconnect replay prevention. The full technical plan is in `docs/queue-system-plan.md`.

---

## What Was Completed

### Stage 1 — Schema Extension
- `activeQueue` entry shape expanded: `reactionKey`, `slot`, `revealOnCompletion`, `wasDiscovery`, `completedAt`, `pruneAfter`, `snapshot` (authoritative reward record). Status enum changed to `['processing', 'completed', 'failed']`.
- `pendingNotifications` array added to User schema.

### Stage 2 — completeReaction Helper
- `server/utils/completeReaction.js` extracted. Reads exclusively from the entry snapshot — immune to content edits during active syntheses. Thin adapter allows the legacy `/perform` route to use the same helper without a real queue entry.

### Stage 3 — resolveQueue and pruneCompletedEntries
- `server/utils/resolveQueue.js` implements `resolveQueue`, `pruneCompletedEntries`, and `resolveAndPruneUserQueue`. Pure function — mutates user in memory only. Caller saves and emits.

### Stage 4 — Centralized resolveQueue Calls
- All backend routes that load user state now call `resolveAndPruneUserQueue` before acting: `GET /users/:username`, `GET /reactions/available`, `GET /reactions/:reactionKey`, `POST /reactions/queue/:reactionKey`, `POST /reactions/experiment`.

### Stage 5 — Gen 1–3 Reaction Timing
- `reactionTime` values applied to all Gen 1–3 seeds: 0–3s (Gen 1), 5–30s (Gen 2), 30–180s (Gen 3). All reactions route through the queue lifecycle; `reactionTime === 0` completes in-process within the same request.

### Stage 6 — Queue Start Route
- `POST /api/reactions/queue/:reactionKey` implemented. Validates, deducts, writes queue entry with full snapshot. Zero-duration path calls `resolveQueue` immediately. `revealOnCompletion` strips product identity from response for undiscovered reactions.

### Stage 7 — Experiment Route into Queue Lifecycle
- `POST /api/reactions/experiment` routes through `startQueueSynthesis` after matching a reaction. Failure path (no match) unchanged.

### Stage 8 — WebSocket Queue Events
- `synthesis_queued`, `synthesis_completed`, `synthesis_discovered`, `synthesis_failed`, `queue_state` added to `reactorRuntime.js`. `queue_state` emitted on WS connect. Completion events emitted from `emitQueueCompletions` after each resolve.

### Stage 9 — Frontend QueuePanel
- `QueuePanel` component added. Countdown timers from `expectedCompletion`. Unknown syntheses display "Unknown Synthesis" with no product name. Reactor occupied → synthesis buttons disabled.

### Stage 10 — Animations
- `synthesis_queued` → intake animation. `synthesis_completed`/`synthesis_discovered` → burst/discovery animation. Processing visual state while queue is non-empty. Auto-finalization bug fixed: client pings `fetchUserData()` when countdown reaches zero, triggering server-side resolution and WS completion event.

### Stage 11 — Offline Completion Delivery
- `pendingNotifications` schema updated: `deliveredAt` (null = undelivered), type enum restricted to `['synthesis_completed', 'synthesis_discovered', 'synthesis_failed', 'unlock_tier']`. `pruneAfter` removed from notifications (pruning is future work; TODOs in place).
- `addPendingNotifications(user, completions)` helper added to `resolveQueue.js`.
- HTTP routes: check `isUserConnected()` after each `resolveQueue`; if connected → emit live; if not → call `addPendingNotifications`. Never both for the same completion.
- WS connect handler: after emitting fresh completions live, drains stored pending notifications (filter `!deliveredAt`), emits each, sets `deliveredAt = now`, saves — before emitting `queue_state`.
- `isUserConnected(username)` exported from `reactorRuntime.js`.
- Frontend: no changes needed — same WS event handlers serve both live and pending delivery paths.
- Tested: offline completion delivered exactly once on reconnect; `deliveredAt` populated; no replay on subsequent reconnect.

---

## Important Architectural Decisions (Locked)

- All syntheses use the queue lifecycle, including `reactionTime === 0`.
- Reactants and energy are consumed at queue start, never at completion.
- Products, `runTotals`, `unlockTier`, and notebook entries happen only at completion.
- Discovery reveal happens only at completion. Unknown syntheses remain fully hidden until then.
- WS is live feedback only; server state is authoritative.
- `pendingNotifications` is for offline completion delivery only — not a generic notification system, not achievements, not chat.
- Delivered notifications are retained with `deliveredAt` set. Pruning is future work (TODO comments in place).
- Cancellation is intentionally out of scope. Reactor commits are final.
- One synthesis slot for MVP.
- Completed queue entries are retained for 24h via `pruneAfter`, removed by `pruneCompletedEntries` on each request.

---

## Known Remaining Concerns

- **Stage 12** (atomic MongoDB guard) is required before Gen 4+ long timings. The MVP race-condition window is narrow for Gen 1–3 but not hardened against concurrent snapshots.
- **Stage 13** (debug/admin tooling) is required before Gen 4+ reactions can be practically tested.
- Multi-tab race: concurrent requests from the same user can cause double-completion. Stage 12 addresses this.
- Server restart during active queue: entry remains `processing` in DB and resolves correctly on next load — needs explicit regression test.
- Reseed-while-queued: snapshot is authoritative and immune to content edits, but this path has not been explicitly stress-tested.
- Delivered pending notifications are retained; a cleanup/pruning pass is future work.
- QueuePanel is MVP and single-slot oriented. Multi-slot UI is deferred.
- Hints are not final.

---

## What Is Actually Next

1. **Stage 12** — Atomic double-completion hardening: replace in-process status guard with a MongoDB atomic subdocument update (`findOneAndUpdate` with status filter). Required before Gen 4+ reaction times.
2. **Stage 13** — Debug/admin tooling: force-complete queue, inventory grant, tier set, time acceleration. Required before Gen 4+ reactions can be practically tested.
3. **Conditions System v1** — Only after Stage 12 is complete.
4. **Gen 4 content seeding** — Only after conditions system exists and debug tooling is operational.

Do not begin conditions work or Gen 4 seeding until Stage 12 is done.

---

# Genesis Lab — Checkpoint: Persistent Synthesis Queue — Stages 12–13 + Multi-Tab Sync Fix (2026-05-29)

This checkpoint marks the completion of the full persistent synthesis queue system through Stage 13. All stages (1–13) are implemented and tested at the current project scale. The queue system is production-ready for Gen 1–3. Stage 12 closes the double-completion race. Stage 13 provides the debug tooling needed before Gen 4+ testing begins.

---

## What Was Completed

### Stage 12 — Atomic Double-Completion Hardening

- `activeQueue[].status` enum extended to `['processing', 'resolving', 'completed', 'failed']`.
- `claimedAt: { type: Date, default: null }` field added to queue entries.
- `resolveQueue` now performs a MongoDB atomic claim per due entry: `findOneAndUpdate` with `$elemMatch` transitions status `processing → resolving` before any side effects run. Only the request that wins the claim runs `completeReaction`.
- Stale resolving recovery: entries stuck in `resolving` for more than 30 seconds (server crash, save failure) are atomically reset to `processing` on the next `resolveQueue` call. Safe because `completeReaction` only adds to inventory and runTotals — it never deducts.
- `pruneCompletedEntries` updated to preserve `resolving` entries (never prune mid-claim).
- Dev test script (`dev-testResolveQueue.js`) updated: fake entry must be persisted to the DB before calling `resolveQueue`, because the atomic claim reads from the DB, not from the in-memory user object. Script now saves the user after injection and re-loads a fresh user document before resolving.

### Multi-Tab WebSocket Sync Bug Fix

**Root cause:** `reactorSessions` mapped `username → session` with a single `session.ws` socket. When Tab B connected, `session.ws = ws` overwrote Tab A's reference. All subsequent emissions reached only Tab B. Tab B's close handler deleted the session entirely, leaving Tab A orphaned — no session, no events, reactor UI stuck in "Finalizing…" / occupied state indefinitely.

**Fix in `reactorRuntime.js`:**
- `session.sockets` is now a `Set<WebSocket>` (initialized in `createReactorSession`).
- Connection handler: `session.sockets.add(ws)` — Tab B no longer evicts Tab A.
- `emitToUser`: serializes the message once, iterates all sockets in the set, sends to each open one. One bad socket cannot break delivery to others.
- `isUserConnected`: returns true if any socket in the set is `OPEN`.
- `tickSession`: broadcasts reactor state to all open sockets when activity is non-zero.
- Close handler: removes the closing socket from the set. Energy flush and session deletion happen only when the last socket closes (set size reaches 0).

**Frontend fixes:**
- `reactorOccupied` (`LabSimulation.jsx`) now includes `|| e.status === 'resolving'` — reactor stays blocked during the brief atomic claim window.
- `processingEntry` (`QueuePanel.jsx`) also includes `|| e.status === 'resolving'` — countdown and progress bar display correctly during claim.

### Stage 13 — Dev/Admin Debug Tooling

**New file:** `server/routes/dev.js` — 3 endpoints.

**Gating:** Mounted in `server/index.js` behind a double guard: `NODE_ENV !== 'production'` AND `DEV_ADMIN_ENABLED=true`. If either condition fails, the router is never `require()`d and the routes do not exist at all. To enable: add `DEV_ADMIN_ENABLED=true` to `.env`.

**Endpoints:**

`GET /api/dev/users/:username/queue`
- Returns full `activeQueue` with: status, reactionKey, slot, startTime, expectedCompletion, completedAt, pruneAfter, revealOnCompletion, wasDiscovery, claimedAt, and a sanitized snapshot summary.
- Entries with `revealOnCompletion: true` suppress productKey/productName/productQuantity/productUnlocksUserTier and label reactionName as `"Unknown Synthesis"` — same rule as the WS sanitizer.

`POST /api/dev/users/:username/queue/:queueEntryId/fast-forward`
- Accepts MongoDB `_id` or `reactionKey` string as the entry identifier.
- Sets `expectedCompletion = now - 1s` and saves. Does NOT call `completeReaction` or touch inventory directly.
- Resolution happens on the next `GET /api/users/:username` (or any route calling `resolveAndPruneUserQueue`) — the real lifecycle handles completion, inventory, runTotals, unlockTier, reactionLog, and WS events.
- Rejects with 400 if entry status is `completed` or `failed`.

`DELETE /api/dev/users/:username/pending-notifications/delivered`
- Removes only notifications where `deliveredAt` is set. Never touches undelivered notifications.
- Returns `{ removed, remaining }`. No-ops (no save) if nothing was removed.

**curl examples:**
```bash
# Inspect queue
curl http://localhost:3000/api/dev/users/alchemist/queue | jq

# Fast-forward by reactionKey
curl -X POST http://localhost:3000/api/dev/users/alchemist/queue/gen3_steel/fast-forward | jq

# Fetch user to trigger resolution
curl http://localhost:3000/api/users/alchemist | jq '.activeQueue[] | {reactionKey, status, completedAt}'

# Clear delivered pending notifications
curl -X DELETE http://localhost:3000/api/dev/users/alchemist/pending-notifications/delivered | jq
```

---

## Verified Behavior (Full Queue System — Stages 1–13)

- **Queue creation:** `POST /api/reactions/queue/:reactionKey` validates, deducts, writes entry with full snapshot, emits `synthesis_queued`.
- **Queue occupancy:** Slot check blocks new syntheses when any `processing` or `resolving` entry exists.
- **Auto-finalization:** Client pings `fetchUserData()` when countdown reaches zero; server calls `resolveAndPruneUserQueue`, emits `synthesis_completed` or `synthesis_discovered`.
- **Offline completion:** Completion occurs on next HTTP fetch; `pendingNotifications` created if no WS session active at resolution time.
- **Reconnect delivery:** WS connect drains undelivered pending notifications, emits each via `emitToUser`, sets `deliveredAt = now`, saves. No replay on subsequent reconnects.
- **pendingNotifications deliveredAt:** Delivered notifications are retained with `deliveredAt` set. Cleanup via dev tooling (`DELETE /api/dev/.../pending-notifications/delivered`). Automated pruning is future work (TODO comments in place).
- **Multi-tab sync:** All open tabs receive queue lifecycle events. Closing one tab does not evict other tabs. Session is deleted only when the last socket closes.
- **Atomic double-completion:** Concurrent requests cannot double-complete the same entry. The MongoDB `findOneAndUpdate` claim is exclusive per entry; only the claimer runs `completeReaction`.
- **Debug tooling:** Queue inspect, fast-forward, notification cleanup operational when both gating env vars are set.

---

## Architectural Decisions (Added This Checkpoint)

- `resolving` is a transient claim status only. It is never shown to players or described in gameplay language.
- The 30-second stale-resolving timeout is intentionally generous to cover any save latency. It is not a player-visible timer.
- Dev tooling fast-forward never calls `completeReaction` directly. This is a hard rule — it ensures all completion logic (inventory, runTotals, unlockTier, reactionLog, WS events, pendingNotifications) runs through the real lifecycle.
- Energy flush and session deletion happen only on last-tab close. Energy accumulates in the shared session while any tab remains open.
- `deliveredAt` is the delivery audit trail. `pendingNotifications` entries are never deleted at delivery time — they are marked and retained.

---

## What Is Actually Next

1. **Conditions System v1 (Phase F)** — The queue system is stable. Implement `reaction.conditions` validation against `user.reactorCapabilities` at queue start time. Gen 1–3 conditions first (`high_temperature`, `catalyst`, `high_pressure`).
2. **Gen 4 content seeding (Phase B2)** — Blocked until conditions system is operational.
3. **Automated pruning of delivered pendingNotifications** — Low priority. TODOs are in place in the code.
4. **Multi-slot queue UI** — Deferred. Architecture supports multiple slots; UI is single-slot.
5. **Long-duration Gen 5/6 stress testing (Phase I)** — Not relevant until conditions and Gen 4 are in place.