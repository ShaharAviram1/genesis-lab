# R1 Step 2 — Reaction Acceleration (Optimizer Chain)

**Phase:** R1 Step 2 (per `docs/r1-time-queue-infrastructure-plan.md` §5.2 + §11)
**Status:** Design only. No code changes.
**Date:** 2026-06-03
**Depends on:** R1 Step 1 shipped (Reactor Capacity).
**Blocks:** R1 Step 3 (offline hardening), R1 Step 4 (queue buffer).

---

## 1. Six design questions, answered

### Q1. How many levels?

**5 levels per blueprint, 3 blueprints, 15 levels total.**

One blueprint per generation tier (Gen 2, Gen 3, Gen 4). Gen 1 is not optimized — its 0–3 s reactions are already non-friction. Gen 5/6 will get their own future blueprints in a later branch; do not extend this chain to cover them.

### Q2. How should bonuses stack?

**Multiplicative compounding per level, single optimizer per generation, multiplicative composition across future branches.**

- Within a blueprint: `multiplier = 0.9 ^ level`.
  - Level 1: 0.90× → -10%
  - Level 2: 0.81× → -19%
  - Level 3: 0.729× → -27.1%
  - Level 4: 0.6561× → -34.4%
  - Level 5: 0.59049× → **-40.95%** (the headline "-41%")
- Across generations: each generation has exactly one optimizer; no cross-gen application. Gen 3's optimizer does not affect Gen 2 reactions.
- Across future branches: any future multiplier source (e.g., a "Quantum Acceleration" prestige tree) composes as `effectiveTime = baseTime × Π(applicable multipliers)`. The helper signature is designed for this.

### Q3. What reaction times are affected?

Only `reactionTime` of reactions whose `generationTier` matches the optimizer's `generationTier`. Computed at queue-start. Resolved into `expectedCompletion` and locked into the queue entry. Gen 1 is excluded by virtue of no Gen 1 optimizer existing.

Formula:

```
effectiveTime  = reactionTime × getReactionTimeMultiplier(user, reaction.generationTier)
expectedCompletion = startTime + effectiveTime × 1000   // milliseconds
```

### Q4. How does it interact with existing queued reactions?

**No retroactive speedup.** Snapshot semantics from queue plan §5 already lock `expectedCompletion` at queue write. Buying a new optimizer level after a reaction has been queued does not shorten its remaining time. The new multiplier applies only to future queue starts. This is consistent with the existing reactant/energy snapshot behavior and avoids two failure modes:

- Mid-flight deadline movement would race the auto-finalize ping logic.
- Offline reactions would complete earlier than the player expects ("I queued a 90s reaction and came back to it already done because I bought an upgrade in another tab"), violating the queue plan's commit-final principle.

### Q5. How should the multiplier be stored on the user?

**No new field on `User`. Derive at queue-start from `user.blueprints[]`.**

The existing `user.blueprints[{ blueprintKey, level }]` is already the authoritative store. A pure-function helper reads it on demand:

```js
function getReactionTimeMultiplier(user, generationTier) {
    let multiplier = 1;
    for (const bp of user.blueprints || []) {
        const cfg = PRESTIGE_CONFIG.modules[bp.blueprintKey];
        if (!cfg) continue;
        if (cfg.category !== 'reaction_acceleration') continue;
        if (cfg.generationTier !== generationTier) continue;
        const perLevel = cfg.effect?.reactionTimeMultiplierPerLevel ?? 1;
        multiplier *= Math.pow(perLevel, bp.level || 0);
    }
    return multiplier;
}
```

Properties:
- O(blueprints) — bounded small constant.
- Pure: no cache to invalidate, no migration on shape change.
- Runs once per queue start. Negligible cost.
- Trivially extensible: another category (e.g. cross-gen multipliers) becomes one more branch in the loop.

Rejected alternative: precomputed `user.reactorMultipliers: { gen2, gen3, gen4 }`. Adds a schema field, adds a cache-invalidation surface (must update on every blueprint purchase, on Big Bang, on migrations), provides no measurable speedup.

### Q6. How should future branches coexist with it?

**Multiplier composition is the contract.** Any future branch that affects reaction time must:
1. Tag its blueprints with a `category` recognizable by `getReactionTimeMultiplier`.
2. Contribute a multiplicative factor (not additive, not floor-based).
3. Honor the snapshot rule: never mutate `expectedCompletion` of in-flight entries.

The helper above already accepts arbitrary additional categories via the `for` loop. To add a future cross-generation multiplier (e.g., `quantum_accelerator` from a hypothetical Branch III), give it `category: 'reaction_acceleration_universal'` and an unconditional contribution; the loop multiplies it in.

Hard cap to protect Gen 5/6: each blueprint capped at `maxLevel: 5` (≈ -41%). Future Gen 5/6 optimizer blueprints will be *new blueprints*, not extensions of `fusion_chamber_optimizer`. This keeps Gen 5's 24–72h reactions from stacking 7 levels of compound reduction.

---

## 2. Blueprint definitions

Add to `server/config/prestigeConfig.js`:

```js
foundry_optimizer: {
    name: 'Foundry Optimizer',
    category: 'reaction_acceleration',
    generationTier: 2,
    description: 'Reduces Gen 2 reaction time by 10% per level (max 5 levels).',
    maxLevel: 5,
    effect: { reactionTimeMultiplierPerLevel: 0.9 },
    blueprintCost: [5, 10, 20, 40, 80]      // index = (next level to buy) - 1
},
materials_lab_optimizer: {
    name: 'Materials Lab Optimizer',
    category: 'reaction_acceleration',
    generationTier: 3,
    description: 'Reduces Gen 3 reaction time by 10% per level (max 5 levels).',
    maxLevel: 5,
    effect: { reactionTimeMultiplierPerLevel: 0.9 },
    blueprintCost: [10, 20, 40, 80, 160]
},
fusion_chamber_optimizer: {
    name: 'Fusion Chamber Optimizer',
    category: 'reaction_acceleration',
    generationTier: 4,
    description: 'Reduces Gen 4 reaction time by 10% per level (max 5 levels).',
    maxLevel: 5,
    effect: { reactionTimeMultiplierPerLevel: 0.9 },
    blueprintCost: [15, 30, 60, 120, 240]
}
```

Total full-chain spend: 155 + 310 + 465 = **930 shards** across the three optimizers (10–12 deep Gen 4 runs at post-Q-F payouts).

---

## 3. Config additions

`prestigeConfig.js` gains:

1. **The three optimizer entries** above.
2. **A new exported helper** `getReactionTimeMultiplier(user, generationTier)` (definition in Q5).

Existing exports (`PRESTIGE_CONFIG`, `getMaxSlots`) unchanged. The module already re-exports helpers as properties on `module.exports`; this fits the same pattern.

No other config file changes.

---

## 4. Backend impact

### 4.1 `server/routes/reactions.js`

In `startQueueSynthesis`, after the slot check and before the queue entry is built (~line 240), apply the multiplier:

```js
const { getMaxSlots, getReactionTimeMultiplier } = require('./../config/prestigeConfig');
// ...
const timeMultiplier = getReactionTimeMultiplier(user, reactionObj.generationTier);
const effectiveTime = reactionObj.reactionTime * timeMultiplier;
const expectedCompletion = new Date(now.getTime() + effectiveTime * 1000);
```

Replace the current `new Date(now.getTime() + reactionObj.reactionTime * 1000)` with `expectedCompletion`. Snapshot continues to capture `expectedCompletion` implicitly via the queue entry's stored field — no new snapshot field needed because the effective time is encoded as `expectedCompletion - startTime`.

Add the multiplier value to the existing slot-check log for diagnostics:

```
[slot-check] user=… owned=[…] maxSlots=2 occupied=1 timeMultiplier=0.81 → ACCEPT slot=1
```

### 4.2 `server/routes/users.js` — purchase route extension

Two semantic branches needed in `POST /api/users/:username/blueprints/:blueprintKey`:

```
1. moduleConfig has maxLevel (leveled blueprint):
   a. existing = user.blueprints.find(b => b.blueprintKey === blueprintKey)
   b. currentLevel = existing?.level ?? 0
   c. if currentLevel >= maxLevel: error "Already at maximum level"
   d. cost = Array.isArray(blueprintCost)
            ? blueprintCost[currentLevel]       // cost of the (currentLevel+1)-th level
            : blueprintCost
   e. validate genesisShards >= cost
   f. if existing: existing.level += 1
      else:        user.blueprints.push({ blueprintKey, level: 1 })

2. moduleConfig has no maxLevel (binary blueprint — current Step 1 case):
   keep existing flow: error if already owned, else push { blueprintKey, level: 1 }
```

The `requires` prerequisite check from Step 1 remains and applies to both branches.

### 4.3 `server/utils/completeReaction.js` and `server/utils/resolveQueue.js`

**No changes.** Both already operate exclusively on snapshotted fields (`expectedCompletion`, `snapshot.productKey`, etc.). The multiplier is applied at queue start and locked into `expectedCompletion`. Completion paths are agnostic to how that time was derived.

### 4.4 `server/realtime/reactorRuntime.js`

**No changes.** The `synthesis_queued` payload already carries `expectedCompletion`. The client renders countdown from that. No new field needed.

### 4.5 `server/dev-auditEconomy.js`

Optional enhancement (not required for ship): a new scenario showing post-acceleration chain times for a player owning specific optimizer levels. Useful as a regression check but does not gate Step 2 shipping.

---

## 5. Migration impact

### 5.1 Schema

**Zero schema changes.** `user.blueprints` already has `level: { type: Number, default: 1, min: 1 }` per `User.js:175`. Levels for existing R1 Step 1 binary blueprints implicitly equal 1, which is correct.

### 5.2 Existing user data

**No migration required.** Players with no optimizers have their blueprints array unchanged; `getReactionTimeMultiplier` returns 1 (the loop finds no matching `reaction_acceleration` entries). All existing reactions queue with their original `reactionTime`.

### 5.3 Existing queued reactions across deploy

Snapshot model protects in-flight reactions. A queue entry written before the deploy has `expectedCompletion` already set; completion resolves from that field, not from a re-computed value. The deploy is therefore zero-disruption for active synthesis.

### 5.4 Polymorphic `blueprintCost`

After this change, `blueprintCost` is `Number` (binary blueprints from Step 1) or `Number[]` (leveled blueprints from Step 2). The purchase route handles both:

```js
const cost = Array.isArray(moduleConfig.blueprintCost)
    ? moduleConfig.blueprintCost[currentLevel]
    : moduleConfig.blueprintCost;
```

No retrofit needed for the 5 R2 atom-producer placeholders or the 2 Step 1 binaries — they continue with `Number`-form costs. Only the 3 new optimizer entries use array form.

### 5.5 Big Bang persistence

`user.blueprints[]` already survives Big Bang per `users.js:75`. Levels persist with it. No change needed to the Big Bang reset path. Cumulative effect: a player who bought Gen 4 optimizer L2 keeps it after Big Bang — exactly the desired prestige behavior.

### 5.6 UI

`client/components/PrestigeBranchPanel.jsx` will need a new "Reaction Acceleration" section between "Reactor Capacity" and "Atom Automation (R2)". Each card shows:

- Blueprint name
- Current level / max level (e.g., "Lv 2 / 5")
- Effect description ("Gen 3 reactions -19% time")
- Next-level cost (or "MAX" chip if at max)
- Purchase button

This is the only required client-side change. `LabSimulation.jsx`, `QueuePanel.jsx`, and the queue-state machinery need no changes — they already render whatever `expectedCompletion` value the server emits.

---

## 6. Risk and edge case notes

| Risk | Disposition |
|------|-------------|
| `Math.pow(0.9, 5) = 0.59049` precision | Acceptable. Stored implicitly in `expectedCompletion` (a `Date`). UI ceil's to nearest second; no user-visible impact. |
| Effective time ≤ 0 | Defensive `Math.max(0, effectiveTime)`. Not currently triggerable (Gen 2+ all have `reactionTime ≥ 8s`, and 8 × 0.59 = 4.7s > 0). |
| Player purchases optimizer mid-queue | Snapshot protects in-flight entries; new optimizer applies to next queue start. Documented as expected behavior. |
| Purchase route race (two tabs purchase same level simultaneously) | Existing user save flow is last-write-wins. A second concurrent purchase at the same level would result in one shard deduct and one level increment — same as Step 1. If duplicate purchases land, the second errors with "Not enough shards" or "Already at maximum level." Acceptable. |
| Future deviation from "single optimizer per gen" assumption | The helper sums across all matching `reaction_acceleration` + `generationTier` entries via multiplicative product. Multiple blueprints targeting the same gen would compose correctly without code change. |
| Gen 5/6 chains potentially trivialized | Hard caps at `maxLevel: 5` per blueprint. New Gen 5/6 optimizers will be separate blueprints in a future branch. |
| Big Bang reset zeroes shards but keeps levels | This is correct behavior — the levels are the prestige reward. No issue. |

---

## 7. Ship checklist

In order:

1. Add the 3 optimizer entries to `prestigeConfig.js`. Add the `getReactionTimeMultiplier` helper. Export it.
2. Extend the purchase route in `users.js` to handle leveled blueprints (array `blueprintCost`, `maxLevel` check, increment-or-push).
3. Apply the multiplier in `reactions.js` `startQueueSynthesis`. Add the multiplier value to the slot-check log.
4. Add the "Reaction Acceleration" section to `PrestigeBranchPanel.jsx`, including level meter and next-level cost.
5. Manual test path:
   - Queue a Gen 3 reaction, confirm baseline `expectedCompletion`.
   - Purchase `materials_lab_optimizer` L1 (10 shards). Confirm `user.blueprints` has `{ blueprintKey: 'materials_lab_optimizer', level: 1 }`.
   - Queue a fresh Gen 3 reaction. Confirm `expectedCompletion - startTime = baseline × 0.9`.
   - Purchase L2 (20 shards). Repeat — multiplier should now be 0.81.
   - Confirm Gen 2 and Gen 4 reactions are unaffected by `materials_lab_optimizer`.
   - Big Bang. Re-queue. Levels persist; multipliers continue to apply.

Estimated implementation effort per R1 plan §11: **2–3 days** (touches purchase-route logic for the first time with leveled semantics; multiplier application is a 3-line change).

---

*End of R1 Step 2 design. No code changes in this document.*
