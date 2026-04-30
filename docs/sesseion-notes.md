# Genesis Lab: Session Transcript Snapshot (Feb 5, 2026)

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