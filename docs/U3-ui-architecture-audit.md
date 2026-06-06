# Genesis Lab — Phase U3: UI Architecture & UX Redesign Audit

**Date:** 2026-06-06  
**Status:** Analysis complete — no implementation started  
**Scope:** Full UI architecture, information hierarchy, reactor participation, layout options, phased roadmap

---

## Current Layout Map

```
┌──────────────────────────────────────────────────────────────────┐
│ Genesis Lab | Tier 12 — Complex Systems | Big Bangs: 2 | Shards  │
│ Objective: Make Chromodynamic Fiber ▸ Gen 5 gate         [user]  │
├──────────────────┬───────────────────────┬───────────────────────┤
│ LEFT (250px)     │ CENTER (flex)         │ RIGHT (300px)         │
│                  │                       │                       │
│ [Atom Panel]     │                       │ [Energy Panel]        │
│  H / O / N / C   │  [3D Reactor]         │ [Queue Panel]         │
│  create buttons  │  GenesisScene         │  Slot 1–4 cards       │
│                  │                       │  Buffer section       │
│ [Matter Lab]     │                       │ [Reactor Caps]        │
│  Atoms section   │                       │  (collapsed toggle)   │
│  Compounds sect  │                       │ [Reaction Panel]      │
│  ── divider ──   │                       │  ~40 cards scrollable │
│  [Substance      │                       │ [SelectedReaction]    │
│   Inspector]     │                       │ [Prestige/Upgrades]   │
│  hover detail    │                       │  (collapsed toggle)   │
│                  │                       │ [BigBang Zone]        │
└──────────────────┴───────────────────────┴───────────────────────┘
[Notebook Drawer — fixed bottom, hidden by default]
```

---

## Section 1 — Current UI Audit

### What works well

- Three-column layout is the correct metaphor: matter left, machine center, reactions right
- Fixed viewport with no page scroll is right for an idle game — session state stays spatially stable
- Discovery cards integrated into the reaction list avoids a separate "Research" screen split
- Notebook as a fixed-bottom drawer is appropriate for access frequency
- Toast system is clean, non-blocking, well-tiered by severity
- Queue progress bar + countdown + ETA gives correct information for short and long-duration synthesis

---

### Problems — sorted by severity

#### RIGHT COLUMN OVERLOADED — Critical

Right column currently stacks: Energy, Queue (4 slots + buffer), Reactor Capabilities (collapsed), Reactions (~40 cards), SelectedReaction, Prestige/Upgrades (collapsed), BigBang. At Gen 6, the reaction panel — the most-used component — receives approximately 150–200px of actual viewport height after everything else above it.

By Gen 5, the player cannot see more than 3–4 reactions at a time without scrolling.

**Root cause:** No information hierarchy — all panels compete equally for vertical space in a fixed-height column.

---

#### REACTION LIST HAS NO FILTER — Critical

67 substances means potentially 40+ visible reaction entries at Gen 6 (known + discovery states). No generation filter, no search, no section grouping, no visual separation between known and discovering reactions.

**Root cause:** Panel designed for 10–15 reactions, not 40+.

---

#### PRESTIGE AND BIGBANG BURIED — High

Prestige Upgrades and BigBang are at the bottom of a scroll-heavy right column behind collapse toggles. A player approaching their first Big Bang must discover the button by scrolling past queue, capabilities, reactions, and a selected reaction panel. First-time prestige is a critical emotional moment.

**Root cause:** Systems added incrementally at the bottom of the column without architectural reconsideration.

---

#### INVENTORY ORGANIZATION LOCKED AT GEN 1/2 SCHEMA — High

InventoryPanel splits substances into "Atoms" and "Compounds." This distinction is meaningful at Gen 1–2, meaningless by Gen 5. No generation filter, no search. 67 substances in two flat groups sorted by acquisition order.

**Root cause:** Organizational schema never revised after Gen 2.

---

#### OBJECTIVE HAS INSUFFICIENT VISUAL WEIGHT — High

The current objective is one small text line in the header alongside Tier, Big Bangs, and Shards. It receives proportionally less visual emphasis than Genesis Shard count, despite being the player's primary directive.

**Root cause:** Header designed for stats, not directives.

---

#### QUEUE VERBOSITY — Medium

Each queue slot renders: header row, synthesis name, progress bar, countdown, ETA. For 4 slots that is ~350px of panel height before the buffer section. The template doesn't adapt to duration — a 48-hour synthesis shows the same countdown UI as a 4-minute synthesis.

**Root cause:** Single display template not tuned for duration range.

---

#### INVENTORY + SUBSTANCE INSPECTOR SPLIT — Medium

InventoryPanel and ExperimentPanel ("Substances") are two separate components beneath a divider in the same card. They are two panels for the same concept: "my matter." Hover-only inspection loses content the instant the cursor moves.

**Root cause:** Inspector added incrementally rather than integrated.

---

#### SELECTED REACTION PANEL INLINE — Medium

Clicking a reaction opens SelectedReactionPanel inline below the reaction list. This displaces the list upward and causes layout churn on a column that already has insufficient height for the reaction list.

**Root cause:** Detail panel rendered in-flow rather than as overlay.

---

#### DISCOVERY CARDS NOT SORTED BY URGENCY — Medium

Partial/near-complete/anomaly cards render in arrival order. No prioritization — near-complete reactions (most actionable) may be below anomaly cards (least actionable).

**Root cause:** No sort applied to discovery section.

---

#### ATOM PANEL USES PERSISTENT REAL ESTATE FOR A RARELY-USED FUNCTION — Medium

AtomPanel sits at the top of the left column. At Gen 5–6, atom creation is an occasional utility. It uses a dedicated panel for a function that could be an inline button in the inventory view.

**Root cause:** Gen 1 feature never integrated into the matter system.

---

#### ENERGY AS A DEDICATED PANEL — Low

Energy is a stable, slowly-changing number. Giving it a dedicated panel component above the queue is a disproportionate allocation of persistent screen space.

**Root cause:** Early design choice, not revisited.

---

## Section 2 — Player Attention Analysis

```
Every second:
  - Energy level and generation rate
  - Active synthesis countdown
  - Queue slot status (is something running?)

Every minute:
  - Queue state (what's processing, what's next to queue)
  - Available reactions (what can I queue next)
  - Inventory (do I have enough materials)

Every session:
  - Current objective
  - Discovery state (what new reactions appeared/progressed)
  - Prestige availability (am I close to a Big Bang)

Occasionally:
  - Reactor capabilities (what's unlocked)
  - Automation/generator state
  - Substance details
  - Notebook/history

Almost never:
  - Atom creation (Gen 1 utility)
  - Individual reactor capability names (learned once, retained)
```

| System | Frequency | Current placement | Should be |
|---|---|---|---|
| Energy | Every second | Dedicated panel (right, top) | Header stat bar |
| Queue | Every second | Dedicated panel (right, top) | Compact persistent strip |
| Reactor | Every second | Center (correct) | Center (correct) |
| Reactions | Every minute | Right panel (correct) | Right panel, filterable |
| Inventory | Every minute | Left panel (correct) | Left panel, unified |
| Objectives | Every session | Header (too small) | Prominent sub-header strip |
| Discovery | Every session | Mixed into reactions | Integrated + section badge |
| Prestige | Occasionally | Buried right column | Dedicated tab |
| Automation | Occasionally | Buried in Prestige | Same tab as Prestige |
| Substance Inspector | Occasionally | Hover-only ExperimentPanel | Click-to-inspect in inventory |
| Reactor Capabilities | Occasionally | Collapsed toggle right column | Reactor frame chips |
| Notebook | Occasionally | Drawer (correct) | Drawer + notification badge |
| BigBang | Rarely | Buried bottom right | Prestige tab |
| Atoms | Rarely | Dedicated top-left panel | Merged into Inventory (G1 filter) |

---

## Section 3 — Information Architecture

**Reactions + Discovery — already correctly unified.** Discovery cards inside the reaction list is the right pattern. Problem is scale (filtering) and sorting, not co-location. Do not separate them.

**Inventory + Substance Inspector + Atoms — merge into one "Matter" panel.** These three things are all answers to the same question: "what matter do I have and what does it do?"

**Prestige + Automation + BigBang — must leave the main column.** These are meta-layer systems with occasional-access cadence. Keeping them inline with second-by-second systems is architecturally incoherent.

**Energy + Queue — compress, not panels.** Energy belongs in the header stat bar. Queue should be a compact strip, not a panel hierarchy.

**Reactor Capabilities — belongs on the reactor frame**, not in an accordion. See Section 11.

**Notebook — stays as a drawer.** Pattern is correct. Needs a notification badge.

---

## Section 4 — Full Screen Layout Options

### Layout A: Left Navigation Rail

```
┌────┬─────────────────────────────────────────────────────────────┐
│    │ ⚡ 847/s  Slot 1: Ammonia ██████░ 2m14s  Slot 2: idle       │
│ ⚗  ├─────────────────────────────────────────────────────────────│
│    │                                                              │
│ 🔬 │  ┌───────────────────┬───────────────────────────────────┐  │
│    │  │                   │ [Reactions]                       │  │
│ 📦 │  │  [3D Reactor]     │  Gen filter: All G1 G2 G3 G4 G5  │  │
│    │  │                   │  ─ Known (14) ──────────────────  │  │
│ ✦  │  │                   │  [reaction cards...]              │  │
│    │  │                   │  ─ Discovering (8) ─────────────  │  │
│ ⚙  │  └───────────────────┘  [discovery cards...]             │  │
│    ├─────────────────────────────────────────────────────────────│
│    │ Objective: Make Chromodynamic Fiber ▸ T22                   │
└────┴─────────────────────────────────────────────────────────────┘
```

**Strengths:** Perfect infinite scalability, full-screen real estate for each system, clean separation of meta-systems.  
**Weaknesses:** Rail is "tool/app" not "game." Switching to Prestige hides reactor — player misses completions. Rail takes 48–56px horizontal.  
**Gen 1–6 scalability:** Structurally excellent. Experientially poor for early players.

---

### Layout B: Top-Nav Tabs + Evolved Three-Column ← Recommended

```
┌──────────────────────────────────────────────────────────────────┐
│  Genesis Lab    [LAB ●] [PROGRESSION]         ⚡ 847 · T12 · 2◈ │
├──────────────────────────────────────────────────────────────────┤
│ Objective — Make Chromodynamic Fiber ▸ Gen 5 gate · T22         │
├──────────────────┬────────────────────────┬──────────────────────┤
│ LEFT (250px)     │ CENTER                 │ RIGHT (300px)        │
│                  │                        │                      │
│ [Matter]         │                        │ ◉ Ammonia  ██░ 2m   │
│  [All G1 G2 G3]  │                        │ ◉ Steel    █░░ 14h  │
│  [Search...    ] │   [3D Reactor]         │ ○ Slot 3  — idle —  │
│                  │   + frame HUD          │ ▫ Buffer  +2 queued  │
│  H       ×240   │                        │──────────────────────│
│  O       ×180   │                        │ [Reactions]          │
│  H₂O     ×44   │                        │  Gen: All G2 G3 G4   │
│  NH₃     ×12   │                        │  ─ Known (14) ──────  │
│  Steel   ×3    │                        │  [cards...]           │
│  ...            │                        │  ─ Discovering (8) ─  │
│  ── click ──     │                        │  [cards sorted]      │
│  [Inspector]     │                        │                      │
│  NH₃ / details   │                        │                      │
└──────────────────┴────────────────────────┴──────────────────────┘
                         [Notebook ▾]
```

PROGRESSION tab:
```
┌──────────────────────────────────────────────────────────────────┐
│  Genesis Lab    [LAB] [PROGRESSION ●]         ⚡ 847 · T12 · 2◈ │
├──────────────────────────────────────────────────────────────────┤
│ [Prestige Branches]              │ [Generators / Automation]     │
│  Energy ●●●○○                    │  Solar Array ×3  Lv.2         │
│  Matter ●●○○○                    │  Quantum Tap ×1  Lv.1         │
│  Chemistry ●○○○○                 │  [construct / upgrade]        │
│  [Blueprints tree...]            │                               │
│──────────────────────────────────┴───────────────────────────────│
│  BigBang — Genesis Shards: 3 this run · 5 total after reset      │
│  Run completion: ████████████░░ 87%   [Initiate Big Bang]        │
└──────────────────────────────────────────────────────────────────┘
```

**Strengths:** Lowest migration risk. Three-column core preserved. Energy moves to header (~60px freed). Prestige removed from right column (~200px freed). Queue compressed (~150px freed). Reactions get 300–350px uncontested. Tab switch doesn't break WS or toasts.  
**Weaknesses:** Tab bar adds ~38px. Prestige is off-screen by default (correct for BigBang, less ideal for discovery of prestige options).  
**Gen 1–6 scalability:** Good. Generation filter handles content growth.

---

### Layout C: HUD Strip + Maximum Content

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚡847/s · T12 · 2◈  │  ●Ammonia ████░2m  ●Steel ██░14h  ○idle  │
├──────────────────┬─────────────────────────┬─────────────────────┤
│  [MATTER]        │    [3D Reactor]         │  [REACTIONS]        │
│  H    240  G1    │                         │  [All G2 G3 G4 G5]  │
│  O    180  G1    │                         │  [known cards]      │
│  H₂O  44   G2    │                         │  ── discovering ──  │
│  ...             │                         │  [discovery cards]  │
│  [Gen filter]    │                         │                     │
│  [Search]        │                         │                     │
│  ── inspector ── │                         │                     │
└──────────────────┴─────────────────────────┴─────────────────────┘
  [▲ PRESTIGE]   [▲ NOTEBOOK]
```

**Strengths:** Maximum vertical space for both Matter and Reactions. No panel chrome. Densest content layout.  
**Weaknesses:** HUD strip hostile to new players. Prestige as bottom-sheet has zero discoverability. No obvious place for Objectives.  
**Gen 1–6 scalability:** Best content scalability. Worst onboarding scalability.

---

## Section 5 — Discovery System Integration

**What should be immediately visible (always):**
- Discovery cards in the reaction list — already there ✓
- `NEW` badge on newly understood reactions — implemented ✓
- Section count separator: `─ Discovering (8) ─` in the reaction list

**What should be hidden by default:**
- Hover detail block — already hidden until hover ✓
- Exact signal count for anomaly cards (deliberate opacity)

**What should appear on hover:**
- Action hint in detail block — implemented ✓

**What should appear on click:**
- Newly understood reactions: clicking should open SelectedReactionPanel immediately — transition to queuable should be frictionless
- Partial/near-complete/anomaly: clicking does nothing (correct) but should give visual feedback (`cursor: not-allowed` or a subtle shake)

**Missing: discovery section sorting**

Inside the Discovering section, sort by proximity to understood:
```
─ Discovering (8) ──────────────────
  [near_complete cards]   ← most actionable
  [partial cards]
  [anomaly cards]         ← least actionable
```

**Missing: discovery badge on section header**

`Reactions  [8 discovering ●]` as a persistent ambient signal.

---

## Section 6 — Inventory & Substance Scaling

**Proposed unified Matter panel:**

```
[Matter]
[All] [G1] [G2] [G3] [G4] [G5] [G6]  ← generation filter tabs
[Search substances...               ]  ← text filter

H    ×240  |  O    ×180  |  N    ×90
H₂O  ×44   |  NH₃  ×12   |  H₂O₂ ×0  (dimmed)
Steel ×3   |  Graphene ×1  ...

── click NH₃ to inspect ──────────────
  Ammonia
  Gen 2 · Basic Chemistry
  "A sharp-smelling compound..."
  [close ×]
```

**Key decisions:**
- Generation is the primary organizational axis, not element type
- Zero-quantity substances dimmed, not hidden (codex function)
- Click-to-inspect replaces hover-only
- Search is non-negotiable at Gen 5+
- Atom creation merges into G1 filter view with inline `+ Create` button
- AtomPanel component retires

**For Gen 7+:** Add a G7 tab. No architectural change required.

---

## Section 7 — Queue & Long-Duration Synthesis

**Compact slot row design:**

```
Reactor Queue
◉ Slot 1   Ammonia Synthesis      ███████░░░  2m 14s
◉ Slot 2   Topological Insulator  ██░░░░░░░░  14h 22m  ☾
○ Slot 3   — idle —
▫ Buffer   Superfluid Condensate (+1 more)
```

**Design decisions:**
- Single-line per slot — ~40px each; 4 slots = 160px vs. current ~350px
- Long-duration `☾` flag for any synthesis over 2h — communicates "set and forget"
- ETA on hover only for long-duration slots
- Buffer as count summary, not individual cards
- Progress bar omitted for long-duration (0.058%/hr is noise)
- Completion handled entirely by toasts — trust the existing system

---

## Section 8 — Prestige & Automation

**Recommendation: Full dedicated PROGRESSION tab.**

Not a modal. Not a separate route. A tab within the same page shell.

Why not modal: Prestige decisions take time to evaluate. A modal that blocks the game is wrong.  
Why not separate tabs for Prestige and Automation: They share Genesis Shards as currency, share the meta-layer framing, and players think about them together.  
Why not keep in main column: Already broken there. Accordion at bottom of scroll-heavy column is a failure state.

BigBang lives at the bottom of the Progression screen — prominent but requires deliberate scroll. This is intentional friction for a high-stakes action.

---

## Section 9 — First-Time Player Complaints

| Rank | Complaint | Severity | How addressed |
|---|---|---|---|
| 1 | "What do I do?" | Critical | Objective strip — full width, sub-header |
| 2 | "I clicked the anomaly card and nothing happened" | High | Shake/cursor feedback on non-interactive cards |
| 3 | "The reaction list is tiny" | High | Right column freed of Energy, Prestige, BigBang |
| 4 | "What is energy for?" | High | Out of U3 scope — pacing/tutorial issue |
| 5 | "I queued something, where is it?" | High | Compact queue strip always visible |
| 6 | "I can't find the synthesis I just ran" | Medium | Notebook badge showing new entries |
| 7 | "Why are there two substance lists?" | Medium | Unified Matter panel |
| 8 | "Nothing to discover at Gen 1" | Medium | Objective strip clarifies progression path |
| 9 | "What are Genesis Shards?" | Low | Prestige tab contextualizes them naturally |
| 10 | "The reactor is pretty but I don't know what it means" | Low | Reactor frame HUD (see Section 11) |

---

## Section 10 — Phased Implementation Plan

| Phase | Work | Risk |
|---|---|---|
| U3-A | Move Energy to header stat bar + add objective strip below header | Very low |
| U3-B | Top-nav tab shell: [LAB] [PROGRESSION] — stub, no content changes | Low |
| U3-C | Migrate Prestige + BigBang to PROGRESSION tab; remove from right column | Medium |
| U3-D | Queue compression to compact single-line slot rows | Low |
| U3-E | Reaction panel: generation filter + section separators + discovery sort | Low |
| U3-F | Matter panel unification: merge Inventory + Inspector + AtomPanel | Medium |
| U3-G | SelectedReaction panel position: overlay instead of inline | Medium |
| U3-H | Objective + Notebook polish: objective pulse on tier unlock, notebook badge | Very low |
| U3-I | Reactor frame HUD: generation frontier bar + capability chips | Low–Medium |

Each phase is independently testable. Each has a clear rollback path. U3-A through U3-D can be done sequentially without blocking each other.

---

## Section 11 — Reactor Participation Analysis

### Current State

The reactor is already a **partial information surface** — but exclusively event-driven, not state-driven.

**Currently communicates (events):**
- Synthesis processing → `isProcessing` glow
- Synthesis completed → orange burst
- Discovery occurred → purple burst, `discoveryMode` flag
- Synthesis failed → red flash
- Activity level → ambient pulse intensity
- BigBang phases → full cinematic sequence
- Core click → `core_click` WS message

**Currently communicates nothing about (state):**
- What reaction is running
- Current objective or progress toward it
- Generation frontier (which generations have been explored)
- Active capabilities
- Tier progression proximity

**The architectural gap:** The reactor is event-rich but state-blind. The largest single surface in the UI has no persistent information value.

---

### Dimension 1 — Objective Visibility

**Option A: Do nothing.** Objective in header only. Reactor blind to objectives.

**Option B: Objective progress arc on the reactor frame.**  
A thin HTML/CSS ring at the outer edge of the `.center-scene` container that fills as the player advances toward the current objective milestone. Color shifts: neutral → orange → green at completion. Lives entirely outside the Three.js canvas.  
*Strength: spatially anchors the objective to the machine without contaminating 3D canvas.*  
*Weakness: arc meaning must be learned; defining "progress" across objective types requires care.*

**Option C: Objective target chip at the reactor frame bottom.**  
A strip at the bottom edge of the reactor container showing the current objective condensed to one line.  
*Strength: always readable, spatially connected to the machine.*  
*Weakness: duplicates the objective strip from U3-A.*

**Option D: Reactor glow responds to objective proximity.**  
Feed an `objectiveProgress` float into GenesisScene. Core glow intensifies and warms as the player nears their objective. Distinct burst on completion.  
*Strength: deeply integrated, atmospheric.*  
*Weakness: requires Three.js work; likely too subtle without the learning curve.*

---

### Dimension 2 — Discovery Visibility

**Option A: Keep event-only (current).** Toasts and discovery cards carry all persistent state.

**Option B: Generation frontier bar (recommended).**  
A compact horizontal strip at the bottom of the reactor frame showing G1–G6 with visual states:
- Dim — not yet reached
- Pulsing — currently active generation
- Lit — generation fully explored

Persistent, always readable, scales to Gen 7+ naturally, requires no Three.js changes.  
*Strength: communicates discovery progress at the generation level without exposing individual reaction details.*  
*Weakness: generation-level granularity only.*

**Option C: Discovery count indicator on reactor frame.**  
Small chip: `◈ 3 near complete`. Updates as discovery states change.  
*Strength: specific and actionable.*  
*Weakness: feels like dashboard UI rather than atmospheric game design.*

**Option D: Reactor glow hue shifts with discovery density.**  
Ambient glow color influenced by number of reactions in active discovery states.  
*Strength: immersive, no text.*  
*Weakness: nearly impossible to interpret; conflicts with existing event colors.*

---

### Dimension 3 — Progression Visibility

**Option A: Do nothing.** Tier in header only. Reactor looks identical at T1 and T24.

**Option B: Tier progress arc on reactor frame.**  
Secondary arc inside or alongside the reactor frame showing progress toward next tier gate.  
*Strength: purposeful information in the reactor frame.*  
*Weakness: if objective arc (Dimension 1 Option B) also exists, two arcs risk visual confusion.*

**Option C: Reactor visual complexity grows with generation.**  
Pass `generationTier` or `unlockTier` into GenesisScene. More rings, more particles, denser warp lines at higher generations. The scene encodes progression level.  
*Strength: most immersive; the reactor IS the progression visualization.*  
*Weakness: significant Three.js work; early game looks underpowered; requires careful calibration.*

**Option D: Tier milestone burst (event, not state).**  
On tier unlock, the reactor fires a distinct celebratory event — different from synthesis or discovery. Gold shockwave expanding outward.  
*Strength: fits existing event-driven pattern; small addition.*  
*Weakness: event only, not persistent — doesn't address the "same at T1 and T24" issue.*

---

### Dimension 4 — Capability Visibility

**Option A: Keep in right panel accordion.** Accessible but not prominent.

**Option B: Capability icon chips on reactor frame (recommended).**  
Small chips at the bottom edge or corner of the reactor frame, one per active capability. `⊘ vacuum` `⬛ pressure` `☢ radiation`. Appear progressively as capabilities unlock, starting empty.  
*Strength: spatial connection between capability and machine; solves the accordion burial problem.*  
*Weakness: icon vocabulary must be learned.*

**Option C: Capability chips in header or objective strip.**  
Remove from right column. Display alongside tier/energy/shards in header.  
*Strength: frees right column.*  
*Weakness: header already carries tier, energy, shards, objective — chips risk overflow.*

**Option D: Reactor visual elements represent active conditions.**  
Active conditions reflected in Three.js scene: vacuum → chamber visual, high_pressure → pressure ring, radiation → radiation haze.  
*Strength: most atmospheric.*  
*Weakness: Gen 5–6 conditions are abstract (quantum_coherence, zero_point_field) — representing visually is a design challenge; significant Three.js work.*

---

### Should the reactor remain purely visual?

**No. But the expansion should happen at the frame layer, not inside the canvas.**

The 3D canvas is where the atmosphere lives. It must remain event-driven and atmospheric. Adding text, numbers, or UI-style elements inside the canvas degrades what makes it distinctive.

The HTML/CSS frame around the canvas — `.center-scene` — is currently unused design real estate. That frame is the correct surface for persistent state information.

**Proposed architecture: reactor frame as ambient HUD**

```
┌── reactor frame ─────────────────────────────────────────────────┐
│  [objective progress arc — thin outer ring, HTML/CSS]            │
│  ┌── 3D canvas ──────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │          [pure Three.js — event-driven, unchanged]        │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│  [● G1  ● G2  ● G3  ◉ G4  ○ G5  ○ G6]  ← generation frontier   │
│  [⊘ vacuum  ⬛ pressure  ☢ radiation]   ← capability chips       │
└──────────────────────────────────────────────────────────────────┘
```

**Inside the canvas — event-driven, unchanged:**
- Synthesis burst (orange / purple / red)
- BigBang animation sequence
- Activity level ambient glow
- Processing glow
- Core click

**Frame layer — state-driven, new:**
- Objective progress arc (top or outer edge)
- Generation frontier strip (bottom edge, G1–G6 states)
- Capability chips (bottom-left corner, grows as capabilities unlock)

**What the reactor should NOT do:**
- Display text inside the 3D canvas
- Duplicate information from the reaction list or inventory
- Show individual reaction names or counts
- Replace discovery cards in the reaction panel

The reactor communicates *system state* at a high level: "I am a Gen 5 machine with vacuum capability, working toward a T22 objective." The panels communicate *item state* at a low level: individual reactions, substances, progress bars. These should not cross.

---

## Recommended Implementation for U3-I (Reactor Frame HUD)

This phase is self-contained. It requires no changes to `GenesisScene.jsx`.

Changes required:
1. Add HTML overlay elements inside `.center-scene` (outside the `<Canvas>`)
2. Pass `generationTier`, `reactorCapabilities`, and objective progress data as props to the reactor container
3. CSS for frontier bar chips and capability chips inside the frame
4. CSS for optional objective arc ring

Rollback: remove the overlay elements entirely — zero impact on Three.js layer.

---

## Major Risks

1. **U3-F (Matter panel)** — merging three components with different data shapes and interaction models. Atom creation side-effects (API calls, state updates in LabSimulation) must carry over cleanly.
2. **U3-C (Prestige migration)** — PrestigeBranchPanel has complex state (generators, blueprints, purchase handlers) that must continue to work when WS is active but the player is on PROGRESSION tab.
3. **U3-G (SelectedReaction overlay)** — current inline render deeply embedded in right-column layout. Overlay approach requires careful z-index and focus management.
4. **BigBang animation regression** — the BigBang overlay and screen shake use `data-bigbang` attribute on `.game-shell`. Tab switching must not interfere with this attribute or the animation sequence.
5. **Reactor frame HUD sizing** — the frame overlay must not interfere with the Three.js canvas pointer events. Overlay elements must be outside the canvas bounds or use `pointer-events: none`.

---

## Recommended Next Task

**U3-A: Header stat bar + objective strip**

Move Energy into the header stat bar alongside Tier and Shards. Add a full-width objective strip immediately below the header. Remove `EnergyPanel` from the right column.

This is the lowest-risk, highest-visibility-return change in the plan. It:
- Frees ~60px in the right column immediately
- Makes the objective significantly more prominent
- Requires no architectural change — two small component edits and CSS
- Validates the approach before the heavier U3-B (tabs) work begins
