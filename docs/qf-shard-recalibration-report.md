# Q-F — Shard Recalibration Report

**Phase:** Q-F (Shard formula recalibration)
**Status:** Analysis only. No code changes in this document.
**Date:** 2026-06-01
**Depends on:** Q-D complete (Q-E deferred to post-Phase R)
**Inputs:** `seedSubstances.js`, `calculateGenesisShards.js`, `dev-auditEconomy.js` output

---

## 1. Open issue carried in from Q-E analysis

`gen2_copper.energyCost` is currently `20` in `seedReactions.js`. The original value was `14`. This change was applied during Q-E implementation before the user halted. `dev-auditEconomy.js` still reports `14`. Q-F does not touch `energyCost`. This mismatch should be resolved (either reverted or absorbed into a future Q-E pass) before any energy work proceeds, but it does **not** affect the shard analysis below — shards do not depend on `energyCost`.

---

## 2. The formula under test

```
genesisShards = (unlockTier ** 2 - 1)
              + Σ (shardValue + log2(produced + 1))    // for every substance with shardValue > 0
```

- `unlockTier` = the player's `user.unlockTier` at Big Bang time. Substances grant tier advancement via `unlocksUserTier`.
- The substance term iterates over `user.runTotals`; substances with `shardValue = 0` contribute nothing.
- `produced` = total produced during the run (the snapshot in `runTotals.produced`).

### Tier-granting substances (where unlockTier advances)

| Substance              | grants tier |
|------------------------|-------------|
| water                  | 1           |
| salt                   | 2           |
| iron_oxide             | 3           |
| copper                 | 4           |
| bronze                 | 5           |
| nickel                 | 6           |
| steel                  | 7           |
| chrome                 | 8           |
| graphene               | 9           |
| lithium_ion_cell       | 10          |
| hydrogen_plasma        | 11          |
| nuclear_fuel_pellet    | 12          |

Reaching RPC or QSub requires reaching tier 12 first (their reaction unlock gate). NFP is therefore the necessary tier-12 stepping stone for any deep Gen 4 run.

### Current shardValues

| Gen | Substance | shardValue |
|-----|-----------|------------|
| 1 | water | 1 |
| 1 | salt | 1 |
| 2 | gold | 3 |
| 2 | bronze | 2 |
| 2 | sulfuric_acid | 2 |
| 3 | glass | 3 |
| 3 | steel | 4 |
| 3 | stainless_steel | 4 |
| 3 | graphene | 5 |
| 3 | carbon_nanotube | 5 |
| 3 | aramid_fiber | 4 |
| 3 | doped_silicon | 4 |
| 3 | lithium_ion_cell | 6 |
| 4 | hydrogen_plasma | 8 |
| 4 | ballistic_composite | 8 |
| 4 | ceramic_superconductor | 10 |
| 4 | metallic_hydrogen | 12 |
| 4 | cryogenic_matrix | 11 |
| 4 | nuclear_fuel_pellet | 14 |
| 4 | reactive_plasma_core | 16 |
| 4 | quantum_substrate | 15 |

Chrome (Gen 3, IV ≈ 71) has `shardValue = 0` and is flagged by the audit as an anomaly.

### Depth term contribution alone

`unlockTier² - 1`:

| tier | contribution |
|------|--------------|
| 2 | 3 |
| 5 | 24 |
| 7 | 48 |
| 10 | 99 |
| 11 | 120 |
| 12 | 143 |

**This term alone exceeds the Gen 3 (15–30) and Gen 4 (40–80) targets before any substance contribution.** That is the headline finding.

---

## 3. Measured payouts — three representative runs

### Run A — Early run (Gen 1 progression, shallow Gen 2)

Player profile: reaches water → salt → iron_oxide → copper → bronze. unlockTier = 5.

Realistic production volumes:
- water: 5 produced (cheap, used in multiple recipes)
- salt: 2 produced
- bronze: 1 produced

Substance contributions:
- water: `1 + log₂(6)` ≈ 3.58
- salt: `1 + log₂(3)` ≈ 2.59
- bronze: `2 + log₂(2)` = 3.00

Depth: `5² − 1` = 24

**Total: 33 shards** (rounded)

A truly minimal Gen 1-only stop (water×1, salt×1, unlockTier = 2):
- Depth = 3, substances = 2 + 2 = 4 → **7 shards** (matches audit baseline)

### Run B — Mid-game run (reaches Gen 3 capstones)

Two realistic sub-profiles:

**B1: Focused Lithium Ion Cell run.** unlockTier = 10. Production (post-Q-D quantities):
- water: 4 (gold needs 2 water each; 2 gold required for doped_silicon → 4 water)
- salt: 4 (lithium needs 2 salt each; 2 lithium required for LiCell → 4 salt)
- gold: 2
- doped_silicon: 1
- graphene: 2
- lithium_ion_cell: 1

Substance sum: `3.32 + 3.32 + 4.59 + 5.00 + 6.59 + 7.00` = 29.82
Depth: `10² − 1` = 99
**Total: ~129 shards**

**B2: Complete Gen 3 explorer.** Reaches all 13 shardValue substances at production = 1 each, unlockTier = 10.
Substance sum: 57
Depth: 99
**Total: ~156 shards** (matches audit estimate)

### Run C — Deep Gen 4 run (reaches RPC and QSub)

Production traced from `1 × RPC + 1 × QSub + 1 × NFP` requirement (post-Q-D quantities):

| Substance | produced | contribution |
|-----------|----------|--------------|
| water | 24 (for gold×12) | 1 + log₂(25) ≈ 5.64 |
| salt | 0 | — |
| gold | 12 (for dSi×6) | 3 + log₂(13) ≈ 6.70 |
| sulfuric_acid | 4 (for chrome×4) | 2 + log₂(5) ≈ 4.32 |
| glass | 3 | 3 + log₂(4) = 5.00 |
| steel | 4 (for SSt×2) | 4 + log₂(5) ≈ 6.32 |
| ARF | 2 (for BC×2) | 4 + log₂(3) ≈ 5.59 |
| dSi | 6 (for CeSC×3) | 4 + log₂(7) ≈ 6.81 |
| graphene | 18 (for CNT×6) | 5 + log₂(19) ≈ 9.25 |
| CNT | 6 (for BC×2 + CryM×1) | 5 + log₂(7) ≈ 7.81 |
| SSt | 2 (for NFP) | 4 + log₂(3) ≈ 5.59 |
| HP | 3 (for RPC + MH×2) | 8 + log₂(4) = 10.00 |
| BC | 2 | 8 + log₂(3) ≈ 9.59 |
| CeSC | 3 (for QSub×2 + CryM×1) | 10 + log₂(4) = 12.00 |
| MH | 2 (for QSub + NFP) | 12 + log₂(3) ≈ 13.58 |
| CryM | 1 | 11 + log₂(2) = 12.00 |
| NFP | 1 | 14 + log₂(2) = 15.00 |
| RPC | 1 | 16 + log₂(2) = 17.00 |
| QSub | 1 | 15 + log₂(2) = 16.00 |

Substance sum: ≈ 168
Depth: `12² − 1` = 143
**Total: ~311 shards** (audit reports 302 with all-produced-1 assumption — my run-traced volumes push it slightly higher)

### Major shard contributors

| Run | Depth term | Top substance contributors |
|-----|------------|----------------------------|
| A   | 24 (73%)   | water, salt, bronze (each 3–4) |
| B1  | 99 (77%)   | LiCell (7), graphene (6.6), dSi (5) |
| B2  | 99 (63%)   | LiCell (7), graphene (6), CNT (6), gold (5) |
| C   | 143 (46%)  | RPC (17), QSub (16), NFP (15), MH (13.6), CeSC (12), CryM (12) |

---

## 4. Comparison vs. targets

| Generation | Target | Measured | Verdict |
|------------|--------|----------|---------|
| Gen 1 (minimal) | 2–5 | 7 | Slightly high |
| Gen 1 + shallow Gen 2 (Run A) | (would be early) | ~33 | Too high |
| Gen 3 capstones (Run B, focused) | 15–30 | ~129 | ~5× too high |
| Gen 3 capstones (Run B, complete) | 15–30 | ~156 | ~6× too high |
| Gen 4 deep (Run C) | 40–80 | ~311 | ~4–8× too high |

**Conclusion:** Every category is above target. The `unlockTier² − 1` term alone (99 at T=10, 143 at T=12) exceeds the Gen 3 and Gen 4 ceilings before any substance contribution is added. **Shard-value adjustments alone cannot bring payouts into the target window.** A formula coefficient change is required.

---

## 5. Recalibration proposal

The user's stated preference order is (1) shardValue adjustments, (2) formula coefficient adjustments, avoiding major formula redesign. The depth term forces a coefficient change; the rest of the change stays in shardValues. **Both levers are needed; they are not independently sufficient.**

### Change 1 — Soften the depth term

**Current:** `unlockTier ** 2 - 1`
**Proposed:** `Math.max(0, Math.floor(unlockTier * 1.3) - 1)`

Depth contribution under the proposal:

| tier | current | proposed |
|------|---------|----------|
| 2 | 3 | 1 |
| 5 | 24 | 5 |
| 7 | 48 | 8 |
| 10 | 99 | 12 |
| 11 | 120 | 13 |
| 12 | 143 | 14 |

Properties:
- Removes the runaway quadratic that pushes Gen 3+ over target.
- Still monotonically rewards depth (T=12 contributes more than T=10).
- Tier 1 still gives 0, preserving the "Big Bang too early = nothing" intuition.
- Minimal code change: a single expression in `calculateGenesisShards.js`.

Alternative considered and rejected: `floor(unlockTier ** 2 / 6) - 1`. Mathematically achievable but reintroduces the quadratic curve, which makes the Gen 4 → Gen 5 cliff harder to balance later. Linear scaling is simpler to extend.

### Change 2 — Trim shardValues

The current substance values are tuned for a "produce 1 of each" idealized run. Post-Q-D, players produce many more units per chain (graphene×18 in a deep run), and the `log₂(produced+1)` bonus magnifies that. Cut shardValues roughly in half to compensate.

**Proposed values:**

| Substance | current | proposed |
|-----------|---------|----------|
| water | 1 | 0 |
| salt | 1 | 0 |
| gold | 3 | 1 |
| bronze | 2 | 1 |
| sulfuric_acid | 2 | 1 |
| chrome | 0 | 1 *(new — fixes audit anomaly)* |
| glass | 3 | 1 |
| steel | 4 | 2 |
| stainless_steel | 4 | 2 |
| aramid_fiber | 4 | 2 |
| doped_silicon | 4 | 2 |
| graphene | 5 | 2 |
| carbon_nanotube | 5 | 2 |
| lithium_ion_cell | 6 | 3 |
| hydrogen_plasma | 8 | 3 |
| ballistic_composite | 8 | 3 |
| ceramic_superconductor | 10 | 4 |
| metallic_hydrogen | 12 | 4 |
| cryogenic_matrix | 11 | 4 |
| nuclear_fuel_pellet | 14 | 5 |
| reactive_plasma_core | 16 | 6 |
| quantum_substrate | 15 | 5 |

Rationale:
- water/salt → 0 removes "always-on" Gen 1 noise. The depth term already credits reaching Gen 1.
- Gen 4 capstones reduced ~60% (RPC 16→6, QSub 15→5). The `log₂(produced+1)` term still provides the "deep run was rewarded" signal because production volumes in deep runs are large.
- Chrome gets shardValue 1, eliminating the long-standing audit anomaly (Gen 3 IV=71 with no shard payout).
- Relative ordering preserved (RPC > QSub > NFP > MH > CryM > CeSC > BC ≈ HP).

### Expected payouts after both changes

**Run A — Early (water+salt+bronze, T=5):**
- Depth: 5
- Substance: 0 + 0 + (1 + log₂(2)) = 2
- **Total: 7 shards** ← target was 2-5; slightly above. Acceptable for "early + shallow Gen 2" (an honest Gen 1-only run would be 1-2 shards, comfortably under target).

**Run A — Minimal Gen 1 (water×1, salt×1, T=2):**
- Depth: 1
- Substance: 0
- **Total: 1 shard** ← target 2-5; below. Suggests cutting water/salt to 0 is slightly too aggressive for first-run feel. Adjust water back to `shardValue = 1` if a minimum-Gen-1 floor of 2-3 shards is required.

**Run B1 — Focused LiCell (T=10):**
- Depth: 12
- Substance contributions:
  - gold: 1 + log₂(3) ≈ 2.59
  - dSi: 2 + log₂(2) = 3.00
  - graphene: 2 + log₂(3) ≈ 3.59
  - LiCell: 3 + log₂(2) = 4.00
  - water (0) and salt (0): no contribution
- Substance sum: ≈ 13.2
- **Total: ~25 shards** ← target 15-30 ✓

**Run B2 — Complete Gen 3 explorer (T=10, all 13 shard substances at produced=1):**
- Depth: 12
- Substance contributions (each `shardValue + log₂(2) = shardValue + 1`):
  - gold (2), bronze (2), sulfuric (2), chrome (2), glass (2), steel (3), ARF (3), dSi (3), graphene (3), CNT (3), SSt (3), LiCell (4)
- Substance sum: 32
- **Total: ~44 shards** ← target 15-30; above for the "completionist" path. This may be acceptable — exploring all Gen 3 substances is genuinely more effort than the focused path.

**Run C — Deep Gen 4 (RPC + QSub + NFP, T=12):**
- Depth: 14
- Substance contributions (recomputed with new shardValues and Run C produced volumes):
  - Gen 2/3 contribs ≈ 4.70 + 3.32 + 3.00 + 3.32 + 2.59 + 3.81 + 5.25 + 3.81 + 2.59 + 2.00 + 2.00 ≈ 33
  - (water 0 produced as shardValue=0; sulfuric 1+log₂(5)≈3.32; gold 1+log₂(13)≈4.70; chrome 1+log₂(5)≈3.32 assuming 4 produced; bronze 0; rest as listed)
  - Gen 4 contribs: HP (3 + log₂(4) = 5), BC (3 + log₂(3) ≈ 4.59), CeSC (4 + log₂(4) = 6), MH (4 + log₂(3) ≈ 5.59), CryM (4 + log₂(2) = 5), NFP (5 + log₂(2) = 6), RPC (6 + log₂(2) = 7), QSub (5 + log₂(2) = 6)
  - Gen 4 sum: ≈ 45
- Substance sum: ≈ 78
- **Total: ~92 shards** ← target 40-80; ~15% above. Close enough to call within tolerance, or tune one or two Gen 4 values down by 1 to land squarely inside.

### Result against targets

| Run | Target | Proposed | Verdict |
|-----|--------|----------|---------|
| Minimal Gen 1 | 2–5 | 1 | Below — consider keeping water at shardValue 1 |
| Early + shallow Gen 2 | (early) | 7 | Acceptable for "moved into Gen 2" |
| Focused Gen 3 | 15–30 | 25 | Within ✓ |
| Complete Gen 3 | 15–30 | 44 | Above — explorers earn more, may be intentional |
| Deep Gen 4 | 40–80 | 92 | Slightly above; trim 1–2 capstone values to land inside |

### Recommended tuning adjustments before implementation

1. **Restore `water` to shardValue 1** to preserve the "first Big Bang feels rewarded" experience at minimal-Gen-1 stops. Yields minimal run = 2 shards (in target window).
2. **Optionally cut RPC 6→5 and QSub 5→4** to land Run C inside the 40-80 window. Or accept that a true "everything in Gen 4" run earns slightly more — it represents a 2-3 hour investment.
3. **Add `shardValue: 1` to chrome** to close the audit anomaly. Cost: ~1-2 additional shards for any run that touches Gen 3.

---

## 6. Risk and side-effect notes

- **Existing user data:** `calculateGenesisShards` populates `runTotals.substance` at Big Bang time and reads `shardValue` from the live document. Any seed change to `shardValue` applies to all pending Big Bangs immediately. This is acceptable behavior for a rebalance.
- **Already-banked shards** (`user.genesisShards`) are unaffected — only future Big Bangs see new numbers.
- **`unlockTier²` change is single-line** in `calculateGenesisShards.js`. No schema, no migration, no route changes.
- **Blueprint placeholder cost** is currently 1 shard each. Under the proposal, a focused Gen 3 run buys ~25 blueprints in one Big Bang — far too cheap. **This confirms that final blueprint cost-setting (Phase R) is the natural next gate after Q-F lands.** It is not Q-F's job to set them, but Q-F's output defines the budget Phase R must price against.

---

## 7. Summary table — final proposed change set

| File | Change | Effect |
|------|--------|--------|
| `server/utils/calculateGenesisShards.js` | `unlockTier ** 2 - 1` → `Math.max(0, Math.floor(unlockTier * 1.3) - 1)` | Tames depth term from quadratic to gentle linear |
| `server/seeds/seedSubstances.js` | Reduce 18 `shardValue` entries per table in §5; add `shardValue: 1` to chrome; optionally retain `water = 1` | Aligns substance contribution with new depth scale |

**Implementation is one formula edit plus ~20 seed value tweaks. No schema change, no migration script, no route changes.**

---

## 8. Recommendation

The proposed changes bring Run B1 (focused Gen 3, the canonical "I reached LiCell" path) cleanly inside the 15-30 target. Run C lands slightly above 80 — within tuning tolerance and arguably correct, since a complete RPC + QSub + NFP run is a deliberate multi-hour investment that deserves the upper end of "substantial reward."

Hold for explicit approval before applying any seed or formula edit. If the small overshoot on Run B2 (complete Gen 3) and Run C (deep Gen 4) is unacceptable, the depth multiplier can drop further (1.2 instead of 1.3) and Gen 4 shardValues can each shed one more point. Both levers are still in normal tuning range — no further structural change is needed.

---

*End of Q-F recalibration report. No code changes in this document.*
