# Genesis Lab — Prestige Implementation Strategy

**Status:** Phase P-A implementation-ready. Phase R pending Phase Q.  
**Date:** 2026-06-01  
**Design source:** docs/automation-system-design.md  
**Roadmap phases:** Phase P-A (Prestige Foundation) → Phase Q (Economy Overhaul) → Phase R (Automation Infrastructure)  
**Prerequisite:** Phase G debug tooling complete (inventory grant, tier set, time acceleration)

---

## What This Document Is

The prestige redesign is complete. This document translates it into a concrete implementation plan separated into two distinct phases:

- **Phase P-A — Prestige Foundation:** Schema, Big Bang persistence rules, blueprint purchase, and the prestige branch UI skeleton. No production balancing required. Can begin now.
- **Phase R — Automation Infrastructure:** Construction routes, the production tick engine, offline accumulation, and the generators panel. Depends on Phase Q economy decisions before rates and caps can be set.

The split exists because production rates, storage caps, and construction costs are balancing decisions that depend on the economy overhaul (Phase Q). The prestige architecture, Big Bang persistence, and blueprint ownership tracking do not. Mixing them together gates implementation on Phase Q unnecessarily.

Rationale and philosophy are not repeated here. When the *why* matters, this document cites the relevant design section.

---

## Phase P-A — Prestige Foundation

**Purpose:** Implement the prestige architecture and blueprint ownership system without implementing automation production.

**In scope:**
- `blueprints` schema field (with forward-compatible `level` field)
- `generators` schema field (structure only — not used until Phase R)
- `lastActiveAt` schema field
- Big Bang persistence rules: blueprints survive, generators reset, `activeQueue` bug fixed
- Blueprint purchase route
- `POST /api/prestige/upgrade/:username` deprecated
- Prestige branch UI skeleton: shows Branch 1 blueprint shop, legacy read-only section
- Branch ownership tracking: the `OWNED` state persists through Big Bang

**Explicitly out of scope for Phase P-A:**
- Generator production tick
- Production rates
- Storage caps
- Offline accumulation
- Construction routes
- Module upgrade routes
- Generators panel UI
- Any balancing of blueprint costs (TBD values in config, buttons disabled until set)

**Implementation-ready now.** Phase P-A has no dependency on Phase Q. Blueprint costs are TBD and shown as "—" in the UI, but the architecture, routes, and UI shell do not require them to be set.

---

## Phase R — Automation Infrastructure

**Purpose:** Implement the two-layer automation system (blueprint + construction) and the production engine.

**In scope:**
- Automation config: `server/config/automationConfig.js` — all production balancing variables
- Module construction route
- Production tick engine in `reactorRuntime.js`
- Offline production catch-up on reconnect
- Module upgrade route
- Module pause/resume
- Generators panel UI (per-module construct/running/paused states)
- `inventory_update` WS event

**Depends on Phase Q** for:
- Blueprint costs (shard amounts per module)
- Construction material quantities (material types are confirmed; quantities are not)
- Production rates per module per level
- Storage caps per substance
- Offline accumulation cap

Phase R can be structurally built with null config values using the `requireConfigured` guard. End-to-end testing requires non-null construction costs and production rates. Do not commit Phase R to production until Phase Q decisions are made.

---

## Scope

### Phase P-A scope

| Item | Notes |
|---|---|
| `blueprints` schema field | With forward-compatible `level` field — see Schema Changes |
| `generators` schema field | Structure only — production logic is Phase R |
| `lastActiveAt` schema field | Used for offline catch-up in Phase R |
| `server/config/prestigeConfig.js` | Blueprint cost registry — all values TBD/null at Phase P-A |
| `POST /api/users/:username/blueprints/:blueprintKey` | New route |
| `POST /api/bigbang` | Fix activeQueue bug, add generator reset, preserve blueprints |
| `POST /api/prestige/upgrade/:username` | Deprecated — returns 410 |
| `PrestigeBranchPanel.jsx` | Replaces existing Upgrades panel; blueprint shop + legacy section |

### Phase R scope

| Item | Notes |
|---|---|
| `server/config/automationConfig.js` | Full automation balancing config |
| `POST /api/users/:username/generators/:moduleKey/construct` | New route |
| `POST /api/users/:username/generators/:moduleKey/upgrade` | New route |
| `POST /api/users/:username/generators/:moduleKey/pause` | New route (or toggle) |
| `POST /api/users/:username/generators/:moduleKey/resume` | New route (or toggle) |
| Production tick in `reactorRuntime.js` | New interval |
| Offline catch-up in `GET /api/users/:username` | New block |
| `GeneratorsPanel.jsx` | Per-module construct/running/paused states |
| `inventory_update` WS event | New event type |

### Out of scope (both phases)

- Branch 2+ (Reaction Acceleration, Reactor Memory, Queue Expansion) — named in design, not implemented
- Shard formula changes — Phase Q
- Gen 5 gate mechanism — Phase Q
- Long-duration synthesis — Phase I

---

## Key Assumptions

| Decision | Value |
|---|---|
| Legacy prestige data | Existing `prestigeUpgrades` values persist and continue to apply. No new purchases. Not presented as an active branch. Retained for backwards compatibility only — see Legacy Prestige Data section. |
| Branch architecture | Two-layer: blueprint (permanent, shard-purchased) + construction (per-run, materials + energy) |
| Blueprint costs | TBD — config constants in `prestigeConfig.js`. Shown as "—" in UI until set. Buttons disabled. |
| Frontier/shard formula | TBD — `server/utils/calculateGenesisShards.js` is the call site. The formula is a balancing variable, not an implementation blocker. |
| Gen 1 scope only | Automation produces raw Gen 1 elements only: hydrogen, oxygen, carbon, nitrogen, iron, sulfur. No compounds. |
| Queue integrity | Automation never touches `user.activeQueue`. Production tick writes to inventory only. |
| Gen 4 construction gate | Module construction requires Gen 4 materials in inventory. Enforced at the construction route's inventory check step. |
| `activeQueue` Big Bang bug | Existing bug: `POST /api/bigbang` does not clear `user.activeQueue`. Fixed in Phase P-A Step 3. |

---

## Schema Changes

**File:** `server/models/User.js`

Add three fields:

```js
blueprints: [{
    blueprintKey:  { type: String, required: true },
    level:         { type: Number, default: 1, min: 1 },
    purchasedAt:   { type: Date, default: Date.now }
}],

generators: [{
    moduleKey:     { type: String, required: true },
    level:         { type: Number, default: 1, min: 1 },
    constructedAt: { type: Date, default: Date.now },
    pausedAt:      { type: Date, default: null },
    lastTickAt:    { type: Date, default: Date.now }
}],

lastActiveAt: { type: Date, default: Date.now }
```

### Why `blueprints.level` is included now

The specialization philosophy (§P2 in the design document) establishes that deep branch investment should create differentiated builds. A natural extension of that philosophy is blueprint progression — upgrading a blueprint to unlock enhanced module behavior or higher-tier production capacity. If `blueprints` is shipped as `[{ blueprintKey, purchasedAt }]` and a `level` field is added later, every existing blueprint document requires a migration pass.

Adding `level: 1` as a default costs nothing, writes nothing in Phase P-A routes beyond the default, and leaves the schema forward-compatible. No Phase P-A route reads or writes `blueprints.level` — it simply cannot be 0 or absent.

### `generators.lastTickAt`

Updated after every production tick. It is the timestamp from which the next tick calculates yield — prevents double-counting between realtime ticks and offline catch-up. Only relevant in Phase R; the field is created by the schema and populated on construction.

### `lastActiveAt`

Updated on every production tick (for connected users) and on reconnect. It is the authoritative offline gap timestamp. Only used actively in Phase R; schema is added in Phase P-A alongside the rest of the User extensions.

No changes to Substance or Reaction models. No migration needed — Mongoose applies defaults to existing documents on first save.

---

## Server Configuration

### Phase P-A config

**File:** `server/config/prestigeConfig.js` (new)

Minimal config for blueprint ownership and purchase validation. All costs are TBD and set to null.

```js
// server/config/prestigeConfig.js
// Blueprint cost registry. All values TBD — Phase Q economy calibration.
// Routes use this object both to validate that a blueprintKey is known
// and to read the cost. A null cost → purchase route returns 503.

const PRESTIGE_CONFIG = {
    modules: {
        atmospheric_separator: { name: 'Atmospheric Separator', produces: ['hydrogen', 'oxygen'], blueprintCost: null },
        carbon_scrubber:       { name: 'Carbon Scrubber',       produces: ['carbon'],             blueprintCost: null },
        nitrogen_condenser:    { name: 'Nitrogen Condenser',    produces: ['nitrogen'],           blueprintCost: null },
        iron_smelter:          { name: 'Iron Smelter',          produces: ['iron'],               blueprintCost: null },
        sulfur_extractor:      { name: 'Sulfur Extractor',      produces: ['sulfur'],             blueprintCost: null },
    }
};

module.exports = PRESTIGE_CONFIG;
```

The `modules` object serves as the blueprint registry: if a `blueprintKey` is not a key in `PRESTIGE_CONFIG.modules`, the purchase route rejects it. The `name` and `produces` fields are used by the UI to render the branch panel without any additional API calls.

### Phase R config

**File:** `server/config/automationConfig.js` (new — Phase R)

All automation production balancing variables. Created in Phase R. All values TBD pending Phase Q.

```js
// server/config/automationConfig.js
// Phase R: production engine configuration. All values TBD — Phase Q + Phase J balancing.

const AUTOMATION_CONFIG = {

    // ── Construction costs per module ─────────────────────────────────
    // Material types confirmed. Quantities TBD.
    constructionCosts: {
        atmospheric_separator: {
            energy:    null,
            materials: [
                { substanceKey: 'graphene',         quantity: null },
                { substanceKey: 'lithium_ion_cell',  quantity: null },
            ]
        },
        carbon_scrubber: {
            energy:    null,
            materials: [
                { substanceKey: 'graphene',      quantity: null },
                { substanceKey: 'doped_silicon', quantity: null },
            ]
        },
        nitrogen_condenser: {
            energy:    null,
            materials: [
                { substanceKey: 'aramid_fiber',  quantity: null },
                { substanceKey: 'doped_silicon', quantity: null },
            ]
        },
        iron_smelter: {
            energy:    null,
            materials: [
                { substanceKey: 'stainless_steel', quantity: null },
                { substanceKey: 'carbon_nanotube', quantity: null },
            ]
        },
        sulfur_extractor: {
            energy:    null,
            materials: [
                { substanceKey: 'stainless_steel', quantity: null },
                { substanceKey: 'carbon_nanotube', quantity: null },
            ]
        },
    },

    // ── Upgrade costs per module per level ────────────────────────────
    // Keyed by moduleKey → level → { energy, materials }. TBD: Phase J.
    upgradeCosts: {},

    // ── Production output per module per level per tick ───────────────
    // TBD: Phase J.
    productionRates: {
        atmospheric_separator: { hydrogen: null, oxygen: null },
        carbon_scrubber:       { carbon: null },
        nitrogen_condenser:    { nitrogen: null },
        iron_smelter:          { iron: null },
        sulfur_extractor:      { sulfur: null },
    },

    // ── Per-substance storage caps ────────────────────────────────────
    // Production pauses per substance when inventory reaches cap. TBD: Phase J.
    storageCaps: {
        hydrogen: null, oxygen: null, carbon: null,
        nitrogen: null, iron:   null, sulfur: null,
    },

    // ── Timing constants ──────────────────────────────────────────────
    PRODUCTION_TICK_INTERVAL_MS:   30 * 1000,  // 30s — adjust during Phase J
    OFFLINE_ACCUMULATION_CAP_MS:   null,        // TBD: Phase J
    MAX_UPGRADE_LEVEL:             5,           // candidate — subject to balancing revision
};

module.exports = AUTOMATION_CONFIG;
```

### Null guard utility (shared)

Used by both Phase P-A and Phase R routes to fail fast on unconfigured values:

```js
function requireConfigured(value, label) {
    if (value === null || value === undefined) {
        throw Object.assign(
            new Error(`config: '${label}' is not yet configured`),
            { statusCode: 503 }
        );
    }
    return value;
}
```

---

## Phase P-A Implementation Steps

Steps ordered by dependency. Each step is independently testable.

---

### P-A Step 1 — Schema

**File:** `server/models/User.js`

Add `blueprints`, `generators`, and `lastActiveAt` as specified in the Schema Changes section.

**Verify:** Restart server. Create a user, save, reload — all three new fields are present with correct defaults. `blueprints[*].level` defaults to 1.

---

### P-A Step 2 — Prestige config

**File:** `server/config/prestigeConfig.js` (new)

Create the config as specified. All `blueprintCost` values are null. These are the only values that Phase P-A reads from config; everything else in `automationConfig.js` is Phase R.

**Verify:** `require('./config/prestigeConfig')` loads without error. `requireConfigured(null, 'test')` throws with `statusCode: 503`.

---

### P-A Step 3 — Blueprint purchase + Big Bang changes

**Files:**
- `server/routes/users.js` — Big Bang route modifications + Branch 0 deprecation
- `server/routes/blueprints.js` (new) OR add directly to `users.js`

#### 3a — Blueprint purchase route

```
POST /api/users/:username/blueprints/:blueprintKey
```

1. Load user
2. Validate `blueprintKey` is a key in `PRESTIGE_CONFIG.modules`  — 400 if not a known module
3. `requireConfigured(PRESTIGE_CONFIG.modules[blueprintKey].blueprintCost, blueprintKey + '.blueprintCost')` — 503 while TBD
4. Check `user.genesisShards >= cost` — 400 if insufficient
5. Check `!user.blueprints.some(b => b.blueprintKey === blueprintKey)` — 400 if already owned
6. `user.genesisShards -= cost`
7. `user.blueprints.push({ blueprintKey })` — `level` defaults to 1
8. `await user.save()`
9. Return `{ blueprintKey, genesisShards: user.genesisShards, blueprints: user.blueprints }`

#### 3b — Big Bang route changes

The existing `POST /api/bigbang` in `server/routes/users.js` (line 48) requires three changes:

**Change 1 — Fix `activeQueue` bug:**
```js
user.activeQueue = [];   // was missing — queue entries leaked into new run
```

**Change 2 — Reset generators:**
```js
user.generators = [];    // constructed modules are per-run
```

**Change 3 — Preserve blueprints:**
`user.blueprints` must not appear in the reset block. Add an explicit comment:
```js
// user.blueprints intentionally not cleared — blueprints are permanent shard purchases
```

Complete reset block after changes:
```js
user.inventory           = [];
user.energy              = 0;
user.unlockTier          = 1;
user.bigBangCount       += 1;
user.runTotals           = [];
user.reactorCapabilities = [];
user.activeQueue         = [];  // fix: was missing
user.generators          = [];  // new: automation modules reset per-run
// user.blueprints intentionally not cleared
// user.prestigeUpgrades intentionally not cleared
// user.reactionLog intentionally not cleared
// user.genesisShards already incremented above
```

#### 3c — Deprecate legacy purchase route

`POST /api/prestige/upgrade/:username` (line 98, `server/routes/users.js`) is the existing multiplier purchase route. Return `410 Gone`:

```js
return res.status(410).json({
    error: 'Prestige multiplier upgrades are no longer available.'
});
```

Hard deprecation is preferred over silent removal — it surfaces immediately if any stale client code calls the route.

**Verify Step 3:**
- Purchase a blueprint with sufficient shards. Big Bang. Reload user. `blueprints` still has the entry with `level: 1`. `generators` is `[]`. `activeQueue` is `[]`.
- Attempt blueprint purchase with insufficient shards — 400.
- Attempt blueprint purchase already owned — 400.
- Call deprecated prestige upgrade route — 410.
- Verify `user.prestigeUpgrades` values are unchanged after Big Bang (multipliers still apply).

---

### P-A Step 4 — Prestige branch UI skeleton

**Files:**
- `client/components/PrestigeBranchPanel.jsx` (new)
- `client/components/PrestigeBranchPanel.css` (new)
- `client/src/pages/LabSimulation.jsx` — replace existing Upgrades panel mount with `PrestigeBranchPanel`

The existing Upgrades panel is retired. `PrestigeBranchPanel` replaces it at the same mount point.

**Panel structure:**

```
PrestigeBranchPanel
├── Shard balance (user.genesisShards)
│
├── Section: "Automation Infrastructure"
│   └── Per module (5 modules from PRESTIGE_CONFIG.modules):
│       ├── Not owned:
│       │     Module name, what it produces, shard cost ("—" if null)
│       │     "Purchase Blueprint" button — disabled if: insufficient shards OR cost is null
│       └── Owned:
│             Module name, "OWNED" chip — no purchase button
│
└── Section: "Reactor Efficiency" (legacy — collapsed by default)
      Read-only: energy ×N, matter ×N, chemistry ×N
      Label: "Reactor Efficiency (legacy — no further upgrades available)"
      No purchase buttons. No cost display.
```

Module names and outputs come from `PRESTIGE_CONFIG.modules` — no additional API call needed. The shard cost is included in the config and shown as "—" when null.

This step does NOT add construction buttons or any generator state — that is Phase R (`GeneratorsPanel`).

**Verify Step 4:**
- With no shards, all purchase buttons are disabled.
- Grant shards via dev route. Purchase one blueprint. "OWNED" chip appears, shard balance decreases.
- Big Bang. "OWNED" chip persists on the new run.
- Legacy section shows correct multiplier values as read-only, no purchase buttons.

---

## Phase R Implementation Steps

**Dependency:** Phase R steps require Phase Q decisions before they can be end-to-end tested. The config file and route shells can be built earlier; they will return 503 for any route that reads a null config value.

---

### R Step 5 — Automation config

**File:** `server/config/automationConfig.js` (new)

Create as specified in Server Configuration. All values null. Populate with `// DEV` candidate values for development to enable local testing. Do not ship Phase R until Phase Q decisions replace the DEV values.

---

### R Step 6 — Construction route

**Files:** `server/routes/generators.js` (new) or added to `users.js`

```
POST /api/users/:username/generators/:moduleKey/construct
```

1. Load user, populate `inventory.substance`
2. Validate `moduleKey` is in `PRESTIGE_CONFIG.modules` — 400 if unknown
3. Check blueprint ownership: `user.blueprints.some(b => b.blueprintKey === moduleKey)` — 400 if not owned
4. Check not already constructed: `!user.generators.some(g => g.moduleKey === moduleKey)` — 400 if already active
5. Load `cost = AUTOMATION_CONFIG.constructionCosts[moduleKey]`
6. `requireConfigured(cost.energy, moduleKey + '.energy')` — 503 while TBD
7. Validate each material: resolve `substanceKey` to inventory entry, check `quantity >= required`
8. Check `user.energy >= cost.energy` — 400 if insufficient
9. Deduct energy and materials (filter zero-quantity inventory entries after deduction — same pattern as `reactions.js` line 241)
10. `user.generators.push({ moduleKey, level: 1, lastTickAt: new Date() })`
11. `await user.save()`
12. Return `{ moduleKey, generators: user.generators }`

---

### R Step 7 — Production tick engine + offline catch-up

**Files:**
- `server/realtime/reactorRuntime.js`
- `server/utils/applyGeneratorProduction.js` (new shared utility)
- `server/routes/users.js` (offline catch-up block in GET handler)

#### 7a — Shared production utility

Extract to `server/utils/applyGeneratorProduction.js`. Both the realtime tick and the offline catch-up use the same math — one implementation, two call sites.

```js
// applyGeneratorProduction(user, now)
// Mutates user.inventory and user.generators in-memory.
// Returns { changed, inventoryDelta: { substanceKey: qty } }.
// Caller is responsible for user.save().

function applyGeneratorProduction(user, now) {
    const inventoryDelta = {};
    let changed = false;

    for (const gen of user.generators) {
        if (gen.pausedAt) continue;
        const rates = AUTOMATION_CONFIG.productionRates[gen.moduleKey];
        if (!rates) continue;

        const elapsedMs = now - gen.lastTickAt;
        const levelMultiplier = gen.level;  // V1: linear scale; replace with config lookup in Phase J

        for (const [substanceKey, ratePerTick] of Object.entries(rates)) {
            if (!ratePerTick) continue;
            const cap = AUTOMATION_CONFIG.storageCaps[substanceKey];
            const ticksElapsed = elapsedMs / AUTOMATION_CONFIG.PRODUCTION_TICK_INTERVAL_MS;
            const rawYield = ratePerTick * levelMultiplier * ticksElapsed;

            const existing = user.inventory.find(
                i => (i.substance.substanceKey || i.substance) === substanceKey
            );
            const currentQty = existing ? existing.quantity : 0;
            const spaceRemaining = (cap !== null) ? Math.max(0, cap - currentQty) : Infinity;
            const actualYield = Math.min(rawYield, spaceRemaining);

            if (actualYield > 0) {
                if (existing) {
                    existing.quantity += actualYield;
                } else {
                    const substanceDoc = await Substance.findOne({ substanceKey });
                    if (substanceDoc) user.inventory.push({ substance: substanceDoc._id, quantity: actualYield });
                }
                inventoryDelta[substanceKey] = (inventoryDelta[substanceKey] || 0) + actualYield;
                changed = true;
            }
        }
        gen.lastTickAt = now;
    }
    return { changed, inventoryDelta };
}
```

`applyGeneratorProduction` never calls `user.save()`. The caller saves. This keeps it testable in isolation.

#### 7b — Realtime tick in `reactorRuntime.js`

Tick runs only for users with active WebSocket sessions. Offline periods are covered by 7c.

```js
setInterval(async () => {
    for (const username of getActiveUsernames()) {
        const user = await User.findOne({ username }).populate('inventory.substance');
        if (!user || user.generators.length === 0) continue;

        const now = new Date();
        const { changed, inventoryDelta } = applyGeneratorProduction(user, now);
        if (changed) {
            user.lastActiveAt = now;
            await user.save();
            emitToUser(username, 'inventory_update', {
                inventory:     user.inventory,
                generatorTick: inventoryDelta
            });
        }
    }
}, AUTOMATION_CONFIG.PRODUCTION_TICK_INTERVAL_MS);
```

#### 7c — Offline catch-up in `GET /api/users/:username`

In `server/routes/users.js`, in the existing `router.get` handler, after loading the user:

```js
if (user.generators.length > 0 && AUTOMATION_CONFIG.OFFLINE_ACCUMULATION_CAP_MS) {
    const now = new Date();
    const cappedOfflineMs = Math.min(
        now - user.lastActiveAt,
        AUTOMATION_CONFIG.OFFLINE_ACCUMULATION_CAP_MS
    );
    if (cappedOfflineMs > 10_000) {
        const syntheticNow = new Date(user.lastActiveAt.getTime() + cappedOfflineMs);
        const { changed, inventoryDelta } = applyGeneratorProduction(user, syntheticNow);
        if (changed) {
            user.lastActiveAt = now;
            userModified = true;
            offlineProduction = inventoryDelta;  // included in response
        }
    }
}
```

Include `offlineProduction: offlineProduction || null` in the GET response. Client renders a brief "while you were away" notice when this field is non-null.

**Verify Step 7:**
- Construct a module. Wait two tick intervals. Verify inventory increased. Verify `user.activeQueue` untouched.
- Set `lastActiveAt` to 1 hour ago via DB write. Reconnect. Verify offline production up to the configured cap was applied.
- Fill inventory to storage cap for a substance. Verify production stops for that substance. Other substances from multi-output modules still produce.

---

### R Step 8 — Module upgrade route

**File:** `server/routes/generators.js`

```
POST /api/users/:username/generators/:moduleKey/upgrade
```

1. Load user, populate inventory
2. Validate `moduleKey` — 400 if unknown
3. Check blueprint ownership — 400 if not owned
4. `gen = user.generators.find(g => g.moduleKey === moduleKey)` — 400 if not constructed
5. Check `gen.level < AUTOMATION_CONFIG.MAX_UPGRADE_LEVEL` — 400 if already at max
6. `cost = AUTOMATION_CONFIG.upgradeCosts[moduleKey]?.[gen.level + 1]`
7. `requireConfigured(cost, moduleKey + '.upgradeCosts.' + (gen.level + 1))` — 503 while TBD
8. Validate energy and materials, deduct, `gen.level += 1`
9. `await user.save()`
10. Return updated generator state

**Verify:** Upgrade Level 1 → Level 2. Verify production rate increases. Attempt beyond MAX_UPGRADE_LEVEL — 400. Unset costs — 503.

---

### R Step 9 — Module pause/resume + Generators panel UI

**Files:**
- `server/routes/generators.js` (pause/resume routes)
- `client/components/GeneratorsPanel.jsx` (new)
- `client/components/GeneratorsPanel.css` (new)
- `client/src/pages/LabSimulation.jsx` — mount `GeneratorsPanel` when `user.blueprints.length > 0`

**Pause/resume routes:**
```
POST /api/users/:username/generators/:moduleKey/pause
POST /api/users/:username/generators/:moduleKey/resume
```
Or collapse to a single toggle. Pause sets `gen.pausedAt = new Date()`. Resume clears `gen.pausedAt = null` and resets `gen.lastTickAt = new Date()` (prevents accumulated yield from the paused period appearing as a debt).

**GeneratorsPanel visibility:** Never rendered when `user.blueprints` is empty. Invisible on a first run (no blueprints exist before first Big Bang).

**Per-module states:**

| State | Condition | Display |
|---|---|---|
| Blueprint owned, not constructed | In `blueprints`, not in `generators` | Name, "Construct" button + cost breakdown. Disabled if costs null or materials insufficient. |
| Running | In `generators`, `pausedAt === null` | Name, level pip, production rate (e.g., "12 H/hr"), "Upgrade" button + cost, "Pause" button |
| Paused | In `generators`, `pausedAt !== null` | Name, "Paused" label, "Resume" button |
| Storage capped | Running, substance at cap | Amber indicator on the capped substance row. Other outputs unaffected. |

No live production counter. Rate is a static label. Inventory change is the feedback signal.

**WS integration:** Panel refreshes on `inventory_update` events (see New WS Event). No polling.

**Verify Step 9:**
- Blueprint owned → "Construct" state with costs. Construct → "Running" state with rate.
- After two tick intervals, inventory increased.
- Pause → "Paused" state, production stops. Resume → "Running" state, production resumes.
- Fill to storage cap → "Capped" indicator on that substance.
- Big Bang → panel shows "Construct" again (generators reset, blueprint survived).

---

## Route Summary

### Phase P-A routes (new)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/:username/blueprints/:blueprintKey` | Purchase blueprint with Genesis Shards |

### Phase R routes (new)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/:username/generators/:moduleKey/construct` | Construct module (blueprint + Gen 4 materials required) |
| `POST` | `/api/users/:username/generators/:moduleKey/upgrade` | Upgrade module level |
| `POST` | `/api/users/:username/generators/:moduleKey/pause` | Pause production |
| `POST` | `/api/users/:username/generators/:moduleKey/resume` | Resume production |

### Modified routes (Phase P-A)

| Method | Path | Change |
|---|---|---|
| `POST` | `/api/bigbang` | Add `activeQueue = []`, `generators = []`. Comment: blueprints not cleared. |
| `POST` | `/api/prestige/upgrade/:username` | Return 410 Gone. |

### Modified routes (Phase R)

| Method | Path | Change |
|---|---|---|
| `GET` | `/api/users/:username` | Add offline catch-up block. Add `blueprints`, `generators`, `offlineProduction` to response. |

---

## New WS Event (Phase R)

`inventory_update` — emitted by the production tick after each tick that produces any inventory.

```js
{
    type:          'inventory_update',
    inventory:     [...],          // full updated inventory (same shape as GET response)
    generatorTick: {               // what was produced this tick
        hydrogen: 4,
        oxygen:   4,
    }
}
```

Client handler in `LabSimulation.jsx`:
```js
case 'inventory_update':
    setInventory(msg.inventory);
    // optionally: ambient notice if msg.generatorTick is non-empty
    break;
```

---

## Hard Constraints

These are design invariants from `docs/automation-system-design.md §2`. Any implementation that violates them is incorrect.

1. **Automation never touches `user.activeQueue`.** The synthesis queue has one entry point: the player. Production tick writes to `user.inventory` only. No generator can enqueue a reaction.

2. **Automation never produces Gen 2+ compounds.** Only raw Gen 1 elements (hydrogen, oxygen, carbon, nitrogen, iron, sulfur) in V1. `AUTOMATION_CONFIG.productionRates` enforces this by listing only these keys.

3. **Modules cannot be constructed before the required Gen 4 materials are in inventory.** The construction route's inventory check enforces this. No override exists.

4. **Blueprints survive Big Bang unconditionally.** `user.blueprints` is never cleared, reset, or modified in the Big Bang route. The only write to `user.blueprints` is the purchase route.

5. **Generators reset on Big Bang unconditionally.** `user.generators = []` in every Big Bang execution path, without exception.

6. **Automation never triggers discovery.** Production tick writes substance ObjectIds directly to `user.inventory`. It does not call `completeReaction`, does not update `user.runTotals`, emits no `synthesis_discovered` event, and does not evaluate capability unlocks.

---

## Legacy Prestige Data

The `user.prestigeUpgrades.energy / matter / chemistry` fields and their effect on gameplay are unchanged and remain functional. The multiplier values continue to apply exactly as they do today:

- `energyMultiplier = 1 + 0.2 × prestigeUpgrades.energy`
- `matterMultiplier = 1 - 0.05 × prestigeUpgrades.matter` (floored at 1.0 at level 20)
- `chemistryMultiplier = 1 - 0.05 × prestigeUpgrades.chemistry` (floored at 1.0 at level 20)

These calculations in `server/utils/gameEconomy.js` are not modified.

What changes in Phase P-A:

- `POST /api/prestige/upgrade/:username` returns 410 — no new multiplier purchases
- The existing Upgrades panel is removed from the UI (replaced by `PrestigeBranchPanel`)
- The legacy multiplier levels are displayed read-only in the collapsed legacy section of `PrestigeBranchPanel`
- No player's existing `prestigeUpgrades` values are modified, rolled back, or expired
- The legacy section is NOT presented as a prestige branch. It does not appear in the branch framework. It is disclosed for transparency, not as an investment option.

`user.prestigeUpgrades` is not part of the branch architecture. It is retained data from a prior system. It has no future progression path.

---

## Implementation Readiness

### Phase P-A — implementation-ready now

No external decisions required. All of the following can be built and tested without Phase Q:

| Item | Readiness |
|---|---|
| `blueprints` + `generators` + `lastActiveAt` schema | Ready |
| Big Bang persistence rules (blueprint survival, generator reset, activeQueue fix) | Ready |
| Blueprint purchase route | Ready — costs null, route returns 503 until set |
| Branch 0 deprecation | Ready |
| `PrestigeBranchPanel` UI skeleton | Ready — shows "—" for null costs |

### Phase R — blocked on Phase Q decisions

Phase R can be structurally built now (routes, config file, production utility). It cannot be shipped or meaningfully tested until Phase Q provides:

| Variable | Blocks | Phase |
|---|---|---|
| Blueprint costs per module | Blueprint purchase is testable (503 until set) | Q |
| Construction material quantities | Construction route end-to-end test | Q |
| Production rates per module | Production tick produces anything | J (after Q) |
| Storage caps | Production ceiling works | J (after Q) |
| Offline accumulation cap | Offline catch-up fires | J (after Q) |
| Upgrade costs | Upgrade route end-to-end test | J (after Q) |

### Shard formula

`server/utils/calculateGenesisShards.js` is the formula call site. The current formula is:
```
shards = unlockTier² - 1 + Σ(shardValue + log₂(produced+1))
```
This is a Phase Q balancing variable. It does not block any Phase P-A or Phase R route. The Big Bang route calls it regardless of whether it has been recalibrated.

---

## System Validation

### Phase P-A validation

Use Phase G debug tooling (inventory grant, tier set, time acceleration) throughout.

1. Fresh account. `PrestigeBranchPanel` shows all purchase buttons disabled (zero shards, null costs).
2. Grant shards via dev route. Blueprint cost still null — purchase route returns 503.
3. Set blueprint cost to a DEV value. Purchase one blueprint. Verify `user.blueprints` has entry with `level: 1`. Shard balance decreased. "OWNED" chip appears.
4. Attempt to purchase the same blueprint again — 400.
5. Trigger Big Bang. Verify `blueprints` unchanged. `generators = []`. `activeQueue = []`. `prestigeUpgrades` unchanged.
6. On the new run: "OWNED" chip persists in `PrestigeBranchPanel`. No construction buttons visible (that is Phase R).
7. Call `POST /api/prestige/upgrade/:username` — 410.
8. Legacy section shows correct read-only multiplier values.

### Phase R validation (requires Phase Q + non-null DEV config values)

Continue from Phase P-A state with a blueprint already owned.

1. Advance to Gen 4 using time acceleration + inventory grants. Verify construction route returns 400 while required Gen 4 materials are absent.
2. Grant required Gen 4 materials. Construct the module. `user.generators` has entry at level 1.
3. Wait two tick intervals. Verify inventory increased for the produced substance. Verify `user.activeQueue` unchanged.
4. Fill inventory to storage cap for one substance. Production stops for that substance. Other outputs from multi-output modules continue. "Capped" indicator appears.
5. Upgrade to level 2. Production rate increases per config.
6. Set `lastActiveAt` to 1 hour ago via DB write. Reconnect. Offline production up to cap applied. `offlineProduction` present in GET response.
7. Trigger Big Bang. `generators = []`. `blueprints` unchanged. `activeQueue = []`. Shard balance increased.
8. New run: `GeneratorsPanel` shows "Construct" (module reset). `PrestigeBranchPanel` shows "OWNED" (blueprint survived).
9. Pause the module. Production stops. Resume. Production resumes.

---

*Design rationale: docs/automation-system-design.md*  
*Sequencing context: docs/implementation-roadmap.md (Phase P-A, Phase R)*  
*Economic context: docs/economic-progression-analysis.md, docs/prestige-loop-analysis.md*
