# Genesis Lab — Phase F: Conditions System v1 Technical Design

**Date:** 2026-05-29
**Status:** Design only — no code written
**Prerequisite:** Stages 1–13 complete (queue system, atomic hardening, debug tooling)
**Blocked by this:** Gen 4 content seeding (Phase B2)

---

## 1. Goals and Non-Goals

### Goals

- Make `reaction.conditions` a real enforcement gate at queue start time — not a display label.
- Make `user.reactorCapabilities` a real progression state — not a placeholder field.
- Define a server-side capability registry that is data-driven, extensible by config entry, and requires no new code per condition.
- Unlock capabilities automatically through the existing completion flow when the right substance is produced or the right tier is reached.
- Surface conditions clearly in the known reaction detail panel so the player understands why they are blocked.
- Keep the system small enough that Gen 4 seeding becomes practical immediately after.

### Non-Goals (v1)

- No purchasable reactor upgrades or upgrade shop.
- No automation integration.
- No Gen 5–6 conditions (`singularity_pressure`, `vacuum_decay`, `causality_shear`, etc.) — registry can hold them as future entries, but they are not wired to any progression path yet.
- No per-condition unlock animations or dedicated ceremony — capability unlock is communicated via the synthesis completion event, same channel as tier advance.
- No reactor capability trading, revocation, or temporary conditions.
- No conditions on experiments: the experiment route finds a matching reaction and routes into `startQueueSynthesis`, which will enforce conditions. The experiment panel itself does not show conditions on unknown reactions (see Section 6).
- No multi-reactor-slot conditions interaction (one slot, MVP).
- No separate admin endpoint for granting capabilities — can be added to `routes/dev.js` as a thin extension (see Open Questions).
- No redesign of the queue lifecycle or schema (beyond what is already in place).

---

## 2. Capability Registry Design

### Structure

A single server-side config file: `server/config/conditionRegistry.js`. Not a Mongoose model. Not a database collection. Loaded at startup, used by queue validation and the unlock helper. Adding a new condition requires one registry entry and zero new code.

Each entry shape:

```
{
  key:              String   — matches the string in reaction.conditions[] and user.reactorCapabilities[]
  displayName:      String   — human-readable name for UI ("High Temperature")
  shortDescription: String   — one sentence; what this means for the reactor
  unlock: {
    type:           'substance' | 'unlockTier'
    substanceKey:   String   — only for type 'substance'; the substanceKey that triggers the unlock
    tier:           Number   — only for type 'unlockTier'; the user.unlockTier value at which this unlocks
  }
  generationHint:   Number   — first generation that requires this condition (informational only)
}
```

### v1 Condition Set

Implement only the conditions needed for Gen 1–3 content (if any are actually populated in the seed) and all Gen 4 conditions. Gen 5–6 entries can be added to the registry config as stubs without unlock sources — they will be inert until Phase I.

**Proposed v1 registry (unlock sources to be confirmed before coding — see Open Questions):**

| Key | Display Name | Unlock type | Proposed unlock trigger |
|---|---|---|---|
| `high_temperature` | High Temperature | substance | TBD — likely a Gen 2/3 substance |
| `catalyst` | Catalyst | substance | TBD — likely a Gen 2 substance |
| `high_pressure` | High Pressure | substance | TBD — likely a Gen 2/3 substance |
| `plasma_state` | Plasma State | unlockTier | Tier 9+ (post Gen 3 milestone) |
| `extreme_cold` | Extreme Cold | unlockTier | Tier 9+ |
| `extreme_pressure` | Extreme Pressure | unlockTier | Tier 9+ |
| `vacuum` | Vacuum | unlockTier | Tier 9+ |
| `radiation_bombardment` | Radiation Bombardment | unlockTier | Tier 10+ |
| `extreme_temperature` | Extreme Temperature | unlockTier | Tier 10+ |

The specific mappings are an open question confirmed before coding begins (see Section 9). The mechanism is settled; the config values are not.

### Why not a database collection?

Conditions are game design constants, not user data. They do not vary per user or change at runtime. Storing them in the DB adds a migration surface with no benefit. A JS config file is diffable, version-controlled, and loaded at startup without a query.

---

## 3. Capability Unlock Source Philosophy

### Two unlock types for v1

**Type 1: Substance production**

A capability unlocks the first time a player successfully produces a specific substance. The unlock check runs inside `completeReaction`, immediately after the product is added to inventory and `runTotals` is updated. The check is: does the registry contain any entry with `unlock.type === 'substance'` and `unlock.substanceKey === entry.snapshot.productKey`, where the key is not already in `user.reactorCapabilities`?

This ties capability unlocks to discovery moments — the same events that advance `unlockTier`. The player synthesizes a milestone substance and the reactor gains a new capability. It feels earned through the same flow that already delivers the discovery reveal and tier advancement.

**Type 2: UnlockTier**

Some capabilities — particularly Gen 4 ones — are unlocked by reaching a progression tier, not by producing a single specific substance. The check runs in the same place: inside `completeReaction`, after `unlockTier` is updated. The check is: does the registry contain any entry with `unlock.type === 'unlockTier'` and `unlock.tier <= user.unlockTier` (new tier), where the key is not already in `user.reactorCapabilities`?

Tier-based unlocks cover conditions where the capability is a natural consequence of reaching the generation, not a single substance milestone. Gen 4 reactor capabilities unlock when the player completes the Gen 3 → Gen 4 transition (tier 9).

### What is NOT a v1 unlock source

- Purchasable upgrades (future Phase G / prestige system).
- Explicit admin grants (can be added to `routes/dev.js` as a one-liner — see Open Questions).
- Reaching a specific reaction count.
- Any time-based or passive unlock.

### Deduplication

Before adding any capability, check `user.reactorCapabilities.includes(key)`. No duplicates ever enter the array. If `completeReaction` is re-run on a recovered entry (Stage 12 stale-resolving recovery), capability re-evaluation is idempotent — the check prevents double-adding.

---

## 4. Integration with the Completion Flow

### Where the unlock runs

Inside `completeReaction(user, entry)`, after the existing logic completes in this order:

1. Product added to inventory.
2. `runTotals` updated.
3. `wasDiscovery` determined.
4. `unlockTier` advanced (if gate substance).
5. `reactionLog` entry written.
6. **NEW: capability unlock evaluation.**

The unlock evaluator is a small helper function `evaluateCapabilityUnlocks(user, productKey)` that:

- Accepts the current `user` (with updated `unlockTier` already applied) and the product's `substanceKey`.
- Reads the condition registry.
- Collects all conditions where `unlock.type === 'substance' && unlock.substanceKey === productKey` and the capability is not yet in `user.reactorCapabilities`.
- Collects all conditions where `unlock.type === 'unlockTier' && unlock.tier <= user.unlockTier` and the capability is not yet in `user.reactorCapabilities`.
- Pushes new capability keys into `user.reactorCapabilities`.
- Returns the array of newly unlocked capability keys (empty array if none).

### Return value change

`completeReaction` currently returns `{ wasDiscovery, prevUnlockTier, newUnlockTier }`. Add `newCapabilities: [String]` — the keys unlocked this completion. Empty array is the common case and costs nothing on the receiving end.

### Propagation through resolveQueue

`resolveQueue` collects `{ entry, ...result }` for each completed entry. The `result` now includes `newCapabilities`. This flows through `emitQueueCompletions` and `addPendingNotifications` — both functions include `newCapabilities` in the WS payload so the frontend can react.

No new WS event type. `synthesis_completed` / `synthesis_discovered` payloads gain a `newCapabilities` field. If empty, the frontend ignores it. If populated, the frontend can show a compact inline notice alongside the completion toast: "Reactor capability unlocked: High Temperature."

---

## 5. Queue Validation Design

### Where it runs

In `startQueueSynthesis`, after loading the reaction but **before** the slot check, energy check, reactant check, and any deduction. Conditions are checked first because they are the hardest blocker — no point validating energy and reactants for a reaction the reactor cannot run.

**Revised validation order in `startQueueSynthesis`:**

1. Load user, flush pending energy.
2. Load reaction.
3. **Validate conditions** — new.
4. Validate `unlockTier`.
5. Validate `isActive`.
6. Validate slot availability.
7. Validate energy.
8. Validate reactants.
9. Deduct and queue.

### Rejection behavior

If any conditions are not met, return 400 immediately. No energy consumed. No reactants consumed. No queue entry created.

**Response shape:**
```json
{
  "error": "Reactor lacks required capabilities",
  "missingConditions": [
    { "key": "high_temperature", "displayName": "High Temperature" },
    { "key": "high_pressure",    "displayName": "High Pressure" }
  ]
}
```

The `missingConditions` array is populated from the registry so the display name is always available without a second lookup. The frontend uses this to render the specific missing conditions in the detail panel and disable the queue button with a legible reason.

### Zero-condition reactions

Reactions with an empty `conditions: []` array pass the check immediately with no change in behavior. This is the common case for all current Gen 1–3 reactions that have no conditions populated in the seed.

### Validation helper

A standalone pure function `validateConditions(reaction, user)` reads `reaction.conditions`, checks each against `user.reactorCapabilities`, and returns `{ passed: Boolean, missing: [{ key, displayName }] }`. Used by `startQueueSynthesis`. No DB access, no side effects. Testable in isolation.

---

## 6. Frontend UX

### Known reaction detail panel (`SelectedReactionPanel`)

If `reaction.conditions` is non-empty, show a **"Reactor Requirements"** section below the reactants list.

Each condition renders as one line:
- **Green indicator + displayName** — capability present in `user.reactorCapabilities`.
- **Red indicator + displayName** — capability missing.

If all conditions are met, the queue button behaves normally.

If any are missing, the queue button is disabled with an inline label: *"Reactor lacks: High Temperature, High Pressure."*

The `shortDescription` from the registry can appear on hover or as a subtitle line for player context.

### Unknown reactions (experiment panel)

**Do not show conditions on unknown reactions.** The conditions a reaction requires are part of its identity — revealing them on an unknown reaction card would tell the player what they need before they've discovered the recipe. Unknown reaction cards continue to show the existing masked view: reactant count, hint text, no conditions.

After discovery (when `synthesis_discovered` is received), the reaction becomes known and the detail panel shows conditions normally on the next render.

### Reactor capabilities panel

A compact, read-only display in the lab UI. Not an upgrade tree. Not a full panel.

Display: `Reactor Capabilities: High Temperature · Catalyst · High Pressure`

A short chip/tag list. No descriptions in the compact view. Clicking or hovering a capability chip shows the `shortDescription`.

This panel is informational only. It answers "what can my reactor do right now?" without being a purchase interface.

**Implementation timing:** The capabilities panel and the detail panel conditions display are both frontend work — they ship in the same implementation step.

### QueuePanel

No changes needed. The QueuePanel shows in-progress entries by status and countdown. Conditions are a queue-start concern, not a queue-progress concern. An entry already in the queue has passed the conditions check.

---

## 7. Big Bang Behavior

### Decision: reset on Big Bang

`user.reactorCapabilities` is cleared to `[]` on Big Bang, alongside the existing inventory and energy reset.

**Reasoning:**

Capabilities represent the current reactor's evolved state. The Big Bang is a full reactor reset — the reactor collapses and is reborn. Retaining Gen 3 reactor capabilities after a Big Bang would mean a freshly reborn reactor immediately has High Temperature capability without re-earning it. That undercuts both the reset identity and the re-progression of the Gen 1–3 capability ladder.

The capability unlock flow is tied to `completeReaction`. On re-run after a Big Bang, synthesizing the same gate substances re-grants the same capabilities naturally. The player re-earns them by playing through the loop again — which is exactly the idle game prestige re-run experience.

**Future prestige integration:** A later prestige upgrade could preserve specific capabilities across Big Bang (e.g., "Reactor Memory: retain High Temperature across resets"). That upgrade is meaningful precisely because capabilities normally reset. Build the reset behavior now; prestige override is a clean opt-in later.

### Implementation note

The existing Big Bang reset logic needs one addition: `user.reactorCapabilities = []`. No other changes.

---

## 8. Compact Implementation Plan

Five steps, sequenced. Each is independently testable before the next begins.

### Step 1 — Registry and validation helper

Create `server/config/conditionRegistry.js` with the v1 condition set (Gen 1–3 + Gen 4 conditions). Create `server/utils/validateConditions.js` — pure function, accepts `(reaction, user)`, returns `{ passed, missing }`.

Optional but strongly recommended: add `POST /api/dev/users/:username/capabilities` to `routes/dev.js` (body: `{ add: [...], remove: [...] }`) so capabilities can be granted/revoked for testing without touching the DB manually.

**Test:** Unit-test `validateConditions` directly. Reaction with no conditions → passes. Reaction with one unmet condition → fails with correct missing entry. Reaction with all conditions met → passes.

### Step 2 — Wire validation into `startQueueSynthesis`

Import `validateConditions`. Add the check as the first validation step. On failure, return 400 with `{ error, missingConditions }`.

**Test:** Queue a reaction with an unmet condition → 400 returned, user inventory unchanged, no queue entry created. Add the capability to the user via dev tooling → queue succeeds.

### Step 3 — Capability unlock in `completeReaction`

Write `evaluateCapabilityUnlocks(user, productKey)`. Call it at the end of `completeReaction` after `unlockTier` update. Push new capabilities into `user.reactorCapabilities`. Add `newCapabilities: [String]` to the return value. Update `emitQueueCompletions` and `addPendingNotifications` to include `newCapabilities` in the WS payload.

**Test:** Synthesize the gate substance for a capability → `user.reactorCapabilities` contains the new key after save. Synthesize it again → no duplicate. Synthesize an unrelated substance → no capability change. Reach the gate tier → tier-based capabilities unlock.

### Step 4 — Big Bang reset

Add `user.reactorCapabilities = []` to the Big Bang reset logic.

**Test:** Add a capability, trigger Big Bang → capability gone. Re-synthesize gate substance → capability re-granted.

### Step 5 — Frontend

In `SelectedReactionPanel`, read `reaction.conditions` and `user.reactorCapabilities` (already in state via `fetchUserData`). Render "Reactor Requirements" section. Disable queue button with legible reason if any missing. Add compact capabilities display to lab UI. Handle `newCapabilities` in the WS event handler (small inline notice alongside completion toast, or silently add to state — minimal is fine for v1).

**Test:** Known reaction with unmet condition → detail panel shows red indicator, queue button disabled. Synthesize gate substance → capability appears, indicator turns green, queue button re-enables. Unknown reaction → no conditions shown.

---

## 9. Open Questions Before Coding

These must be resolved before Step 1 begins. They are config decisions, not architecture decisions.

**Q1: Which Gen 1–3 reactions in the current seed actually have non-empty `conditions` arrays?**
Read `server/seeds/seedReactions.js` and check. If no Gen 1–3 reactions have conditions populated, enforcement primarily gates Gen 4 — and the capability unlock design just needs to ensure capabilities are granted before Gen 4 is seeded. If some Gen 1–3 reactions do have conditions, their unlock sources must appear earlier in the progression than those reactions.

**Q2: What specific substance unlocks each Gen 1–3 condition?**
The mapping (e.g., "producing X unlocks `high_temperature`") determines the player's unlock moment and must feel narratively correct. Propose mappings after reading the seed to see what conditions Gen 1–3 reactions actually require. This is a design decision, not an engineering one.

**Q3: What unlock tier triggers each Gen 4 condition?**
The Gen 3→Gen 4 gate advances the player to tier 9 (Steel + Lithium-Ion Cell). All Gen 4 conditions could unlock at tier 9, or some could be tier 10+. Decide before writing the registry.

**Q4: Does the current reaction API payload include `conditions`?**
Check what `GET /api/reactions/available` and `GET /api/reactions/:reactionKey` currently return. If `conditions: []` is not in the response, add it. The frontend cannot render the requirements section without it.

**Q5: Does the current user API payload include `reactorCapabilities`?**
Check what `GET /api/users/:username` currently returns. The frontend needs the user's current capabilities to render the conditions panel and disable the queue button. If not returned, add it to the response.

**Q6: Should the dev tooling get a capability grant/revoke endpoint?**
Adding `POST /api/dev/users/:username/capabilities` to `routes/dev.js` makes conditions testing significantly easier than manually editing the DB. It is a two-line extension to the existing dev router with no new architecture. Strongly recommended to include in Step 1.

**Q7: Does the frontend currently use `reaction.conditions` for anything?**
Check `SelectedReactionPanel.jsx` and any other components that render reaction data. If `conditions` is already being read and rendered (even as plain text), Step 5 frontend work is smaller. If it is ignored entirely, Step 5 is a fresh implementation.

---

## 10. Open Questions Answered (2026-05-29)

All seven open questions resolved by reading the current codebase. No code has been written. Findings are authoritative — verified from source files, not inferred.

---

### A1 — Which Gen 1–3 reactions have non-empty conditions arrays?

**None.**

Every Gen 1–3 reaction in `server/seeds/seedReactions.js` omits the `conditions` field entirely. The seed script defaults to `r.conditions || []` at serialization time, so all 31 reactions are seeded with `conditions: []`.

**Implication:** Conditions enforcement has zero effect on Gen 1–3 gameplay today and after v1 is implemented. The conditions system is purely a gate for Gen 4+ content. Capability unlock events do occur during Gen 1–3 progression (via substance milestones and tier advances), but no Gen 1–3 reaction will ever reject a queue attempt due to missing capabilities.

---

### A2 — Do reaction API payloads include conditions?

**Yes — automatically, for discovered reactions.**

`GET /api/reactions/available` and `GET /api/reactions/:reactionKey` both call `reaction.toObject()` on discovered reactions and return the full Mongoose document object. Since `conditions` is a real field on the Reaction model (defined as `{ type: [String], default: [] }`), it is included in every discovered-reaction response with no extra work.

Unknown reactions use `buildMaskedReaction()`, which returns a minimal hand-crafted object that does not include `conditions`. This is correct — conditions on an unknown reaction would reveal information about the recipe before discovery.

**No API changes required for conditions to reach the frontend for discovered reactions.**

---

### A3 — Does the user API payload include reactorCapabilities?

**No. It must be added.**

`GET /api/users/:username` currently returns:
```
username, inventory, energy, unlockTier, bigBangCount,
genesisShards, prestigeUpgrades, reactionLog
```

`reactorCapabilities` is absent. The frontend cannot render the Reactor Requirements section or enable/disable the queue button without this field.

**Action required in Step 5 (backend side):** Add `reactorCapabilities: user.reactorCapabilities` to the `GET /api/users/:username` response object. One line.

**Additional finding — Big Bang does not reset reactorCapabilities:**

`POST /bigbang` in `users.js` resets `inventory`, `energy`, `unlockTier`, `bigBangCount`, and `runTotals` but does **not** touch `reactorCapabilities`. Per the design decision in Section 7, capabilities must reset on Big Bang. This is a missing reset to fix in Step 4.

---

### A4 — Which frontend components read or display reaction.conditions?

**None. Zero frontend references to `conditions` or `reactorCapabilities`.**

A full grep of the client directory confirms no frontend file reads, destructures, or renders either field. `SelectedReactionPanel.jsx` renders: the reactants list (with have/need quantities), a status badge (`Reactor Occupied` / `Ready` / `Missing Materials`), and the queue/perform button. There is no conditions section.

**Step 5 is a fresh implementation end-to-end.** No refactor of existing rendering logic; the new Reactor Requirements section is purely additive.

---

### A5 — Proposed exact v1 condition registry

#### Design principle applied

The goal is clear progression and meaningful milestones — not artificial uniqueness. Some capabilities unlock together when they reflect a genuine shared reactor state. Five conditions map naturally to specific Gen 1–3 synthesis milestones whose real-world production process directly embodies the condition (`unlock.type: 'substance'`). The remaining four have no strong single-substance match and unlock at a progression tier, staggered across the Gen 3 arc. `plasma_state` and `extreme_cold` both unlock at Tier 9 because that tier represents the reactor's full Gen 4-readiness — this pairing is intentional, not a gap in the design.

#### Substance-based unlocks

| Condition | Display Name | Unlocks on producing | reactionKey | Tier | Rationale |
|---|---|---|---|---|---|
| `high_pressure` | High Pressure | Ammonia | `gen1_ammonia` | 2 | The Haber-Bosch process forces nitrogen and hydrogen together under extreme pressure. The seed description reads "forced together under pressure." First meaningful pressure milestone. |
| `catalyst` | Catalyst | Nitric Acid | `gen2_nitric_acid` | 4 | The Ostwald process is literally catalytic oxidation. The seed description calls it "catalytic oxidation of ammonia." Direct conceptual match. |
| `high_temperature` | High Temperature | Steel | `gen3_steel` | 6 | Iron smelting and carbon alloying require sustained extreme heat. Steel is the first Gen 3 material and the natural first high-heat milestone. |
| `vacuum` | Vacuum | Graphene | `gen3_graphene` | 8 | Chemical vapor deposition (CVD), the real graphene production process, requires a vacuum chamber. The seed description references "chemical vapor deposition." |
| `radiation_bombardment` | Radiation Bombardment | Doped Silicon | `gen3_doped_silicon` | 9 | Ion implantation doping bombards the silicon lattice with gold ions. The seed description says "Gold atoms threaded into a silicon lattice at reactor temperature." Direct match. |

#### Tier-based unlocks

| Condition | Display Name | Unlocks at Tier | Rationale |
|---|---|---|---|
| `extreme_pressure` | Extreme Pressure | 7 | The tier 7 cluster (Glass Fusion, Chrome Refining) fuses multiple mineral compounds at pressures far beyond Gen 2. No single substance captures this; reaching tier 7 signals the reactor's pressure frontier advancing beyond `high_pressure`. |
| `extreme_temperature` | Extreme Temperature | 8 | The tier 8 cluster (Stainless Steel, Graphene, Aramid Fiber) pushes the reactor past "high temperature" into the plasma-adjacent regime required for Gen 4. Unlocks one tier before the plasma-tier conditions. |
| `plasma_state` | Plasma State | 9 | The reactor has completed Gen 3 and is ready for Gen 4 plasma physics. Unlocks alongside `extreme_cold` at the Gen 3 capstone tier. |
| `extreme_cold` | Extreme Cold | 9 | No Gen 1–3 substance has a convincing thematic link to cryogenics. Extreme cold is fundamentally a Gen 4 capability (cryogenic matrix, metallic hydrogen) with no direct Gen 1–3 analog. Pairing it with `plasma_state` at Tier 9 correctly treats both as the reactor's full Gen 4-readiness unlock. |

#### Full unlock timeline

| Tier | Event | Capability gained |
|---|---|---|
| 2 | Ammonia synthesized | `high_pressure` |
| 4 | Nitric Acid synthesized | `catalyst` |
| 6 | Steel synthesized | `high_temperature` |
| 7 | Tier 7 reached | `extreme_pressure` |
| 8 | Graphene synthesized | `vacuum` |
| 8 | Tier 8 reached | `extreme_temperature` |
| 9 | Tier 9 reached | `plasma_state`, `extreme_cold` |
| 9 | Doped Silicon synthesized | `radiation_bombardment` |

By tier 9 (the Gen 3→Gen 4 gate), all nine Gen 4 conditions are unlocked. `plasma_state` and `extreme_cold` unlock together when Tier 9 is reached — this is intentional. `radiation_bombardment` unlocks separately within Tier 9 when Doped Silicon is synthesized, since that reaction is gated at `unlockTier: 9` and requires the player to actively produce it.

#### Short descriptions for registry

| Key | shortDescription |
|---|---|
| `high_pressure` | Enables reactions requiring forced compression of reactants. |
| `catalyst` | Enables reactions that require a catalytic medium to proceed. |
| `high_temperature` | Enables sustained high-heat synthesis beyond standard thermal range. |
| `extreme_pressure` | Enables reactions requiring pressures beyond conventional compression. |
| `vacuum` | Enables reactions that require a vacuum or near-vacuum environment. |
| `extreme_temperature` | Enables reactions at the boundary between thermal and plasma-state conditions. |
| `radiation_bombardment` | Enables reactions requiring directed particle or ion bombardment. |
| `extreme_cold` | Enables cryogenic synthesis and low-temperature phase reactions. |
| `plasma_state` | Enables plasma-phase reactions. Required for all Gen 4 synthesis. |

---

### Implementation delta from original plan

Three concrete changes surfaced by the repo scan:

1. **`reactorCapabilities` must be added to `GET /api/users/:username` response** — one line in `users.js`. Previously listed as "check if needed"; now confirmed required.
2. **Big Bang must clear `reactorCapabilities`** — `POST /bigbang` in `users.js` currently omits this reset. Step 4 must add `user.reactorCapabilities = []` alongside the existing resets.
3. **Step 5 frontend is a clean-slate implementation** — no existing conditions rendering to extend or refactor. The new Reactor Requirements section is purely additive to `SelectedReactionPanel`.
