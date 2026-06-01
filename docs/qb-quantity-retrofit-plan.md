# Genesis Lab — Q-B Quantity Retrofit Plan

**Phase:** Q-B through Q-D planning (quantity scarcity, all generations)
**Status:** Planning only. No seed changes yet.
**Date:** 2026-06-01
**Source data:** `server/dev-auditEconomy.js` Q-A baseline output
**Implements:** `docs/economy-implementation-strategy.md` phases Q-B, Q-C, Q-D

---

## Part 1 — Current Bottleneck Identification

### Gen 2: Reactions with No Quantity Scarcity

Thirteen Gen 2 reactions exist. Three already have quantity > 1 (bronze: copper×2, silicon: carbon×2, soda_ash: sodium×2). Ten have every reactant at quantity 1:

| Reaction | Reactants (all qty=1) | Downstream significance |
|---|---|---|
| gen2_copper | iron_oxide, sulfur | → bronze (copper×2) |
| gen2_tin | iron_oxide, carbon | → bronze (tin×1) |
| gen2_nickel | iron_oxide, ammonia | → stainless_steel (nickel×1) |
| gen2_gold | iron, water | → doped_silicon (gold×1) |
| gen2_sulfuric_acid | sulfur, water, oxygen_gas | → chrome (sulfuric_acid×1) |
| gen2_nitric_acid | ammonia, oxygen_gas | **dead end — no Gen 3+ users** |
| gen2_calcium | salt, water | → quicklime → glass |
| gen2_quicklime | calcium, oxygen_gas | → glass (quicklime×1) |
| gen2_quartz | silicon, oxygen_gas | → glass (quartz×2) |
| gen2_lithium | salt, hydrogen_gas | → lithium_ion_cell (lithium×2) |

**Dead end identified:** `nitric_acid` is not used as a reactant in any Gen 3 or Gen 4 reaction. It is not a quantity retrofit target. Flag for future content review.

### Gen 3: Reactions with No Quantity Scarcity

Nine Gen 3 reactions exist. All already have some quantity > 1, but two have only 1-quantity reactants for their expensive intermediates:

| Reaction | Quantities | Gap |
|---|---|---|
| gen3_steel | iron×3, carbon×1 | Already high quantity. ✓ |
| gen3_graphene | carbon×3, methane×1 | carbon is base element (free). methane at qty=1 is a gap. |
| gen3_chrome | iron_oxide×2, sulfuric_acid×1 | iron_oxide already doubled. ✓ |
| gen3_stainless_steel | steel×2, chrome×1, nickel×1 | chrome and nickel at qty=1 are gaps. |
| gen3_carbon_nanotube | graphene×2, carbon×1 | graphene at qty=2 OK, but CNT is used in two Gen 4 reactions — graphene demand could go higher. |
| gen3_aramid_fiber | ammonia×2, carbon×2, nitrogen×1 | Already doubled on expensive inputs. ✓ |
| gen3_doped_silicon | silicon×2, gold×1 | gold at qty=1 is a gap — gold is the slow bottleneck (25s, T6 unlock). |
| gen3_glass | quartz×2, soda_ash×1, quicklime×1 | quartz already doubled. ✓ |
| gen3_lithium_ion_cell | lithium×2, graphene×1, doped_silicon×1 | graphene at qty=1 is a gap — graphene is slow (90s). |

### Gen 4: Zero Quantity Scarcity

Every Gen 4 reaction has every reactant at quantity 1. The audit flagged all 8 reactions. This is the largest gap in the current economy.

---

## Part 2 — Natural Scarcity Points

These are the substances where a quantity increase creates the most downstream pressure due to their position in the synthesis graph.

### iron_oxide (Gen 1 synthesized)

Used as a reactant in **5 Gen 2 reactions**: copper, tin, nickel, chrome (via sulfuric_acid path indirectly), silicon. It is the hub of the Gen 1→2 transition. Increasing iron_oxide demand per copper and tin directly multiplies into bronze (copper×2 per bronze → iron_oxide demand doubles again).

**Current iron_oxide demand for 1 bronze:**
copper×2: each needs iron_oxide×1 = 2 iron_oxide
tin×1: needs iron_oxide×1 = 1 iron_oxide
Total: 3 iron_oxide → 6 iron clicks + 3 oxygen_gas clicks

**After copper/tin iron_oxide×2:**
copper×2: each needs iron_oxide×2 = 4 iron_oxide
tin×1: needs iron_oxide×2 = 2 iron_oxide
Total: 6 iron_oxide → 12 iron clicks + 6 oxygen_gas clicks

### carbon_nanotube (Gen 3)

Used as a reactant in **2 Gen 4 reactions**: ballistic_composite and cryogenic_matrix. A player building the Reactive Plasma Core must produce carbon_nanotube for both tracks simultaneously. Raising graphene demand in CNT (from ×2 to ×3) cascades into both downstream users. If CNT itself is required in ×2 quantities in cryogenic_matrix, the compounding effect is large.

Current CNT chain time: **304 seconds (5m 4s)**
Proposed CNT chain time: **402 seconds (6m 42s)** — adding 98s per CNT, which propagates to BC and CryM.

### hydrogen_plasma (Gen 4)

Used as a reactant in **2 Gen 4 reactions**: metallic_hydrogen and reactive_plasma_core. A player building both tracks must produce at least 2 hydrogen_plasmas. Raising MH to HP×2 forces 3 total plasmas for a player completing both MH and RPC tracks. HP is 180s each.

### metallic_hydrogen (Gen 4)

Used as a reactant in **2 Gen 4 reactions**: nuclear_fuel_pellet and quantum_substrate. Both Tier 11 products require MH. MH chain time is 900 seconds (15 minutes) — the longest single-substance chain in Gen 4 (excluding multi-substance capstones). Doubling MH quantity for either downstream reaction adds a full 15-minute chain.

### ceramic_superconductor (Gen 4)

Used as a reactant in **2 Gen 4 reactions**: cryogenic_matrix and quantum_substrate. CeSC chain time is 687 seconds (11m 27s). Players completing both Tier 11–12 tracks must produce 2 CeSCs. Currently this happens implicitly (they must queue CeSC twice anyway); making one reaction explicitly require ×2 captures this as formal scarcity.

---

## Part 3 — Capstone Atom Costs (Current)

From audit — minimum atom clicks for the full synthesis chain, single queue slot:

| Substance | Gen | Serial Time | Atom Clicks | Clicks/Min |
|---|---|---|---|---|
| Bronze | Gen 2 | 45s | 15 | 20/min |
| Graphene | Gen 3 | 1m 32s | 6 | 3.9/min |
| Doped Silicon | Gen 3 | 2m 41s | 16 | 6.0/min |
| Stainless Steel | Gen 3 | 4m 32s | 30 | 6.6/min |
| **Lithium Ion Cell** | **Gen 3** | **8m 13s** | **30** | **3.7/min** |
| Ballistic Composite | Gen 4 | 11m 10s | 24 | 2.1/min |
| Ceramic Superconductor | Gen 4 | 11m 27s | 44 | 3.8/min |
| Metallic Hydrogen | Gen 4 | 15m 0s | **1** | 0.07/min |
| Cryogenic Matrix | Gen 4 | 25m 31s | 57 | 2.2/min |
| Nuclear Fuel Pellet | Gen 4 | 31m 32s | 31 | 1.0/min |
| Quantum Substrate | Gen 4 | 41m 27s | 45 | 1.1/min |
| **Reactive Plasma Core** | **Gen 4** | **54m 41s** | **82** | **1.5/min** |

**Notable observations:**

1. **Metallic Hydrogen: 1 atom click, 15 minutes.** This is the Steel anomaly of Gen 4. MH synthesizes from hydrogen×1 (base element, free) plus a 720s reaction time. The player clicks once and waits 12 minutes. No economic resistance at all — time only.

2. **LiCell: 30 clicks, 8 minutes.** This is less than Bronze (also 30 clicks) but takes 10× longer. The time wall exists but it comes entirely from reaction durations, not from atom accumulation. A player could click all needed atoms in 15–30 seconds, then wait.

3. **RPC: 82 clicks across 7 element types.** This sounds significant but at 1–2 clicks/second, it is 41–82 seconds of atom clicking spread across the full 54-minute chain. The atom work is not the bottleneck.

4. **Cryogenic Matrix: 57 clicks, 25 minutes.** The highest click-to-time ratio among Gen 4 substances. This is because CryM feeds through glass→quartz→silicon and CeSC→glass→quartz paths, both of which pull from iron_oxide (which requires 2 iron + 1 oxygen_gas).

---

## Part 4 — Capstone Chain Costs (Current)

Chain time formula: `reaction_time + Σ(chain_time(reactant_i) × qty_i)`, single queue slot.

All values verified against Q-A audit output.

### Gen 3 capstone (LiCell) chain decomposition

```
lithium_ion_cell (8m 13s = 493s total)
├── lithium ×2        (30s each × 2 = 60s)
│   ├── salt ×1       (0s — instant)
│   └── hydrogen_gas ×1 (0s — instant)
├── graphene ×1       (92s)
│   ├── carbon ×3     (0s — base)
│   └── methane ×1    (2s)
└── doped_silicon ×1  (161s)
    ├── silicon ×2    (23s each × 2 = 46s)
    │   ├── carbon ×2 (0s)
    │   └── iron_oxide ×1 (3s)
    └── gold ×1       (25s)
        ├── iron ×1   (0s — base)
        └── water ×1  (0s — instant)
Reaction time: 180s
Total: 180 + 60 + 92 + 161 = 493s
```

**The LiCell chain spends 180s on the reaction itself, 161s waiting for doped_silicon, 92s for graphene, 60s for lithium. Doped_silicon is the dominant component.**

### Gen 4 capstone (RPC) chain decomposition

```
reactive_plasma_core (54m 41s = 3281s total)
├── hydrogen_plasma ×1     (180s)
│   └── hydrogen ×1        (0s — base)
├── cryogenic_matrix ×1    (1531s)
│   ├── ceramic_superconductor ×1 (687s)
│   │   ├── glass ×1       (166s)
│   │   │   ├── quartz ×2  (38s each × 2 = 76s)
│   │   │   ├── soda_ash ×1 (10s)
│   │   │   └── quicklime ×1 (20s)
│   │   └── doped_silicon ×1 (161s)
│   └── carbon_nanotube ×1  (304s)
│       └── graphene ×2     (92s × 2 = 184s)
└── ballistic_composite ×1  (670s)
    ├── aramid_fiber ×1     (96s)
    │   └── ammonia ×2      (3s × 2 = 6s)
    └── carbon_nanotube ×1  (304s)
Reaction time: 900s
Total: 900 + 180 + 1531 + 670 = 3281s
```

**CryM (1531s) is the dominant component — 47% of RPC's total chain time. The cold track (CeSC→CryM) is the core bottleneck. BC (670s) and HP (180s) are secondary.**

---

## Part 5 — Gen 2 Proposals (Q-B)

Gen 2 quantity changes create **atom friction** primarily. Most Gen 2 reactions complete in 8–30 seconds, so adding quantity adds small amounts of chain time but meaningful amounts of atom clicking and queue management.

The principle for Gen 2: target substances that cascade into Gen 3 through existing multi-quantity uses.

### Proposed Changes

| Reaction | Reactant | Current Qty | Proposed Qty | Rationale |
|---|---|---|---|---|
| gen2_copper | iron_oxide | 1 | **2** | Cascades into bronze (copper×2): bronze goes from 3→6 iron_oxide demand |
| gen2_tin | iron_oxide | 1 | **2** | Symmetric; bronze total iron_oxide demand becomes 6 (was 3) |
| gen2_nickel | ammonia | 1 | **2** | Nickel→stainless_steel; 2 ammonia productions (3s each) per nickel; modest chain time, significant atom friction |
| gen2_gold | water | 1 | **2** | Gold→doped_silicon; water is instant (0 chain time) but adds atom friction (2 H2+O sets) |
| gen2_lithium | salt | 1 | **2** | Lithium×2 in LiCell; 4 total salt productions per LiCell (each: Na+Cl) = +4 atom clicks |

**Not changed in Gen 2:**
- `gen2_sulfuric_acid` — already has 3 reactants; pressuring further feels punishing at this stage
- `gen2_nitric_acid` — dead end (no downstream users in Gen 3–4)
- `gen2_calcium`, `gen2_quicklime` — calcium path leads to glass, but glass is already pressure-tested via quartz×2
- `gen2_quartz` — already appears ×2 in glass
- `gen2_silicon` — already at carbon×2; silicon is a hub (quartz + doped_silicon) — raising here cascades too broadly

### Gen 2 Chain Time Impact

All Gen 2 changes use substances with zero or near-zero chain time (water is instant, salt is instant, ammonia is 3s). The chain time impact is minimal but non-zero:

| Reaction | Current Chain | Proposed Chain | Δ |
|---|---|---|---|
| copper | 11s | 14s | +3s |
| tin | 11s | 14s | +3s |
| bronze | 45s | 54s | +9s |
| nickel | 26s | 32s | +6s |
| gold | 25s | 25s | ±0s |
| lithium | 30s | 30s | ±0s |

### Gen 2 Atom Click Impact

| Substance | Current Clicks | Proposed Clicks | Δ |
|---|---|---|---|
| bronze (1 unit) | 15 | 27 | +12 (+80%) |
| gold (1 unit) | 4 | 7 | +3 (+75%) |
| lithium (1 unit) | 4 | 6 | +2 (+50%) |
| nickel (1 unit) | 8 | 12 | +4 (+50%) |

**The Gen 2 changes are primarily felt in atom accumulation, not wait time.** A player who previously clicked 15 atoms for bronze now clicks 27. This is noticeable without being punishing, and it creates natural "let me stockpile some iron_oxide" behavior.

---

## Part 6 — Gen 3 Proposals (Q-C)

Gen 3 quantity changes create both **time friction** and **atom friction**. Gen 3 reactions run 45–180 seconds each; adding quantity to existing bottlenecks compounds wait time significantly.

### Proposed Changes

| Reaction | Reactant | Current Qty | Proposed Qty | Rationale |
|---|---|---|---|---|
| gen3_graphene | methane | 1 | **2** | graphene is used in CNT×2, LiCell×1 — methane×2 adds atom friction (2 methane syntheses = 2×(C+H2)) and +2s chain |
| gen3_carbon_nanotube | graphene | 2 | **3** | CNT is used in BC and CryM — graphene×3 adds +98s to CNT chain, cascading into both Gen 4 tracks |
| gen3_doped_silicon | gold | 1 | **2** | gold is 25s and T6 unlock — gold×2 adds +25s to doped_silicon chain, +50s to CeSC, +25s to LiCell |
| gen3_lithium_ion_cell | graphene | 1 | **2** | LiCell is the Gen 3 capstone; graphene×2 forces 2×90s graphene productions — adds ~94s to LiCell chain |
| gen3_stainless_steel | chrome | 1 | **2** | chrome is 45s with its own chain; ×2 adds +66s to SSt chain, propagating into NFP |

**Not changed in Gen 3:**
- `gen3_steel` — iron×3 already provides meaningful atom pressure (3 base-element clicks)
- `gen3_chrome` — iron_oxide is already ×2; sulfuric_acid was considered but acid already has 3 reactants
- `gen3_aramid_fiber` — ammonia×2 and carbon×2 already applied; raising further risks over-taxing the aramid track which feeds BC
- `gen3_glass` — quartz×2 already applied; glass is a bottleneck for CeSC which is already long-chain

### Gen 3 Chain Time Impact

| Reaction | Current Chain | Proposed Chain | Δ |
|---|---|---|---|
| graphene | 92s | 94s | +2s |
| carbon_nanotube | 304s | 402s | **+98s** |
| doped_silicon | 161s | 186s | +25s |
| lithium_ion_cell | 493s | 614s | **+121s** |
| stainless_steel | 272s | 338s | +66s |

**Key propagation:** CNT is used by both BC and CryM. Adding 98s to CNT's chain time propagates +98s to each.

---

## Part 7 — Gen 4 Proposals (Q-D, Revised)

**Design principle (revised):** Gen 4 quantity changes must create manufacturing pressure — requiring complex intermediates in higher quantities — rather than simply extending wait times. The original Q-D relied heavily on doubling `hydrogen_plasma` and `metallic_hydrogen`, which add reaction time with no queue management and no decisions. This revision removes those and replaces them with quantity increases on complex multi-step intermediates, creating resource competition and parallel-track pressure.

**Key shift from original Q-D:**
- Removed: `gen4_metallic_hydrogen` HP×2 (+180s pure wait — 1 click)
- Removed: `gen4_nuclear_fuel_pellet` MH×2 (+1080s pure wait — 1 click)
- Removed: `gen4_reactive_plasma_core` HP×2 (+180s pure wait — 1 click)
- Added: `gen4_ceramic_superconductor` doped_silicon×2 (manufacturing complexity cascades)
- Added: `gen4_nuclear_fuel_pellet` stainless_steel×2 (real manufacturing work: steel + chrome + nickel)
- Added: `gen4_reactive_plasma_core` ballistic_composite×2 (forces 2 full BC tracks per RPC)
- Added: `gen4_quantum_substrate` ceramic_superconductor×2 (forces 2 full CeSC chains per QSub)

### Proposed Changes

| Reaction | Reactant | Current Qty | Proposed Qty | Rationale |
|---|---|---|---|---|
| gen4_ceramic_superconductor | doped_silicon | 1 | **2** | Each CeSC now needs 2 doped_silicon chains (silicon×2 + gold×2 each); pressure cascades into CryM and QSub which both consume CeSC |
| gen4_cryogenic_matrix | carbon_nanotube | 1 | **2** | CNT is shared with BC; forces queue competition — player produces CNT for two simultaneous tracks |
| gen4_ballistic_composite | carbon_nanotube | 1 | **2** | Symmetric with CryM; combined: 1 RPC requires 6 total CNTs (2 for CryM + 4 for BC×2) |
| gen4_nuclear_fuel_pellet | stainless_steel | 1 | **2** | Replaces MH×2; SSt (338s chain) requires steel×2 + chrome×2 + nickel — manufacturing complexity not pure wait |
| gen4_reactive_plasma_core | ballistic_composite | 1 | **2** | Forces 2 complete BC tracks per RPC; each BC needs CNT×2 + aramid; creates substantial parallel queue demand |
| gen4_quantum_substrate | ceramic_superconductor | 1 | **2** | CeSC now 898s chain; ×2 forces 2 complete productions (each: glass + 2×doped_silicon) — real multi-step manufacturing |

**Unchanged (compared to original Q-D proposal):**
- `gen4_metallic_hydrogen`: HP stays at ×1 — doubling adds 180s pure wait with no manufacturing decisions
- `gen4_nuclear_fuel_pellet`: MH stays at ×1 — MH×2 (+1080s) was the largest pure-wait time inflation in the original; replaced with SSt×2
- `gen4_reactive_plasma_core`: HP stays at ×1 — subsumed by BC×2, which carries real manufacturing weight

### CNT Bottleneck Analysis

The revised Q-D makes `carbon_nanotube` the central constraint of the RPC track:

| What needs CNT | Quantity | Source |
|---|---|---|
| gen4_cryogenic_matrix | 2 CNTs | CryM:CNT×2 |
| gen4_ballistic_composite ×2 | 4 CNTs | BC:CNT×2, RPC:BC×2 |
| **Total for 1 RPC** | **6 CNTs** | |

Each CNT (after Q-C) requires graphene×3 → **18 graphenes** for 1 RPC.
Each graphene (after Q-C) requires methane×2 → **36 methanes** for 1 RPC.

This creates a cascade of manufacturing decisions: methane queues, graphene queues, CNT queues — all running in parallel, all competing for the same queue slots. The player must plan production order carefully. This is qualitatively different from doubling a wait time.

### QSub vs RPC: Distinct Resource Profiles

A player pursuing both Tier 12 capstones will face different bottlenecks on each track:

| Track | Primary constraint | CNT demand | CeSC demand |
|---|---|---|---|
| RPC | CNT/graphene production (6 CNTs) | **6** | 1 (via CryM) |
| QSub | CeSC production (2 complete chains) | 0 | **2** |

QSub is glass+doped_silicon heavy. RPC is CNT+graphene heavy. The two profiles do not overlap cleanly, making simultaneous pursuit of both genuinely complex without being redundant grind.

### Gen 4 Chain Time Impact

Three-column comparison: current seeds → after Q-C → after Q-D.
All Q-D calculations use Q-C chain times as inputs: graphene=94s, CNT=402s, doped_silicon=186s, SSt=338s, glass=166s, aramid=96s, HP=180s.

| Reaction | After Q-C baseline | After Q-D (new) | Δ from Q-C | % |
|---|---|---|---|---|
| ceramic_superconductor | 712s (11m 52s) | **898s (14m 58s)** | +186s | +26% |
| metallic_hydrogen | 900s (15m 0s) | **900s (15m 0s)** | 0 | — |
| ballistic_composite | 768s (12m 48s) | **1170s (19m 30s)** | +402s | +52% |
| cryogenic_matrix | 1654s (27m 34s) | **2242s (37m 22s)** | +588s | +36% |
| nuclear_fuel_pellet | 1958s (32m 38s) | **2296s (38m 16s)** | +338s | +17% |
| quantum_substrate | 2512s (41m 52s) | **3596s (59m 56s)** | +1084s | +43% |
| reactive_plasma_core | 3502s (58m 22s) | **5662s (1h 34m 22s)** | +2160s | +62% |

*Note: "After Q-C baseline" values for Gen 4 substances already reflect the Q-C changes propagating through Gen 3 inputs (CNT, doped_silicon, SSt all increase in Q-C). These intermediate values were not shown in the original plan.*

**CeSC calculation (Q-D):**
```
ceramic_superconductor = 360 + chain(glass)×1 + chain(doped_silicon)×2
                       = 360 + 166 + 186×2
                       = 360 + 166 + 372 = 898s
```

**CryM calculation (Q-D):**
```
cryogenic_matrix = 540 + chain(CeSC_new)×1 + chain(CNT)×2
                 = 540 + 898 + 402×2
                 = 540 + 898 + 804 = 2242s
```

**NFP calculation (Q-D):**
```
nuclear_fuel_pellet = 720 + chain(MH)×1 + chain(SSt)×2
                    = 720 + 900 + 338×2
                    = 720 + 900 + 676 = 2296s
```

**QSub calculation (Q-D):**
```
quantum_substrate = 900 + chain(MH)×1 + chain(CeSC_new)×2
                  = 900 + 900 + 898×2
                  = 900 + 900 + 1796 = 3596s
```

**RPC calculation (Q-B + Q-C + Q-D fully applied):**
```
reactive_plasma_core = 900 + chain(HP)×1 + chain(CryM_new)×1 + chain(BC_new)×2
                     = 900 + 180 + 2242 + 1170×2
                     = 900 + 180 + 2242 + 2340 = 5662s
```

---

## Part 8 — Projected Impact Summary

### Chain Time: Before vs. After (all Q-B/C/D changes applied)

Three-column view showing current state, Q-B+Q-C intermediate, and final state after Q-D.
Gen 4 "After Q-B+Q-C" values are non-trivially larger than "Current" because Q-C changes to CNT, doped_silicon, and SSt propagate upward through Gen 4 chains.

| Substance | Gen | Current (seeds) | After Q-B+Q-C | After Q-B+Q-C+Q-D | Δ total | % |
|---|---|---|---|---|---|---|
| Bronze | 2 | 45s | 54s | 54s | +9s | +20% |
| Graphene | 3 | 1m 32s | 1m 34s | 1m 34s | +2s | +2% |
| Carbon Nanotube | 3 | 5m 4s | 6m 42s | 6m 42s | +1m 38s | +32% |
| Doped Silicon | 3 | 2m 41s | 3m 6s | 3m 6s | +25s | +16% |
| Stainless Steel | 3 | 4m 32s | 5m 38s | 5m 38s | +1m 6s | +24% |
| **Lithium Ion Cell** | **3** | **8m 13s** | **10m 14s** | **10m 14s** | **+2m 1s** | **+24%** |
| Ceramic Superconductor | 4 | 11m 27s | 11m 52s | **14m 58s** | +3m 31s | +31% |
| Metallic Hydrogen | 4 | 15m 0s | 15m 0s | **15m 0s** | 0 | — |
| Ballistic Composite | 4 | 11m 10s | 12m 48s | **19m 30s** | +8m 20s | +75% |
| Cryogenic Matrix | 4 | 25m 31s | 27m 34s | **37m 22s** | +11m 51s | +46% |
| Nuclear Fuel Pellet | 4 | 31m 32s | 32m 38s | **38m 16s** | +6m 44s | +21% |
| **Quantum Substrate** | **4** | **41m 27s** | **41m 52s** | **59m 56s** | **+18m 29s** | **+45%** |
| **Reactive Plasma Core** | **4** | **54m 41s** | **58m 22s** | **1h 34m 22s** | **+39m 41s** | **+73%** |

### Atom Clicks: Key Capstones Before vs. After

Estimated totals — exact values confirmed by audit script post-implementation:

| Substance | Current Clicks | Estimated After | Δ |
|---|---|---|---|
| Bronze | 15 | 27 | +12 |
| Lithium Ion Cell | 30 | ~50 | +20 |
| Carbon Nanotube | 13 | ~28 | +15 |
| Ballistic Composite | 24 | ~57 | +33 |
| Ceramic Superconductor | 44 | ~65 | +21 |
| Cryogenic Matrix | 57 | ~155 | +98 |
| Nuclear Fuel Pellet | 31 | ~80 | +49 |
| Quantum Substrate | 45 | ~135 | +90 |
| Reactive Plasma Core | 82 | ~250 | +168 |

*CryM, QSub, and RPC atom click estimates are substantially higher than the original Q-D because the CeSC doped_silicon×2 change cascades upward, and BC×2 in RPC doubles the structural track's atom demand.*

### Real-World Time Estimate

Minimum serial time is a lower bound. Real players experience:
- Atom collection time (~1–3 seconds per atom click)
- Queue monitoring and re-queuing overhead
- Multiple synthesis tracks running simultaneously
- Discovery time (first runs)
- Pauses

Rough real-world multiplier: **2.5–4×** the minimum serial time.

| Substance | Min Serial (after) | Est. Real-World |
|---|---|---|
| Lithium Ion Cell | 10m 14s | 25–40 minutes |
| Nuclear Fuel Pellet | 38m 16s | 1.6–2.5 hours |
| Quantum Substrate | 59m 56s | 2.5–4.0 hours |
| Reactive Plasma Core | 1h 34m 22s | 3.75–6.25 hours |

**Tier 11 (CryM ~37m, NFP ~38m) is achievable in a single focused session.** A player reaching Gen 4 for the first time can unlock Tier 12 in one session. **Tier 12 (QSub ~60m, RPC ~94m) requires multi-session investment.** The Tier 11→12 boundary is the intended hard wall.

---

## Part 9 — Risk Flags

### R1: LiCell chain time gain is modest (+2 minutes)

LiCell goes from 8m to 10m minimum serial. This is only a 24% increase. In real terms the player goes from ~20 min to ~25 min for a LiCell production cycle. This may not feel like a meaningfully harder Gen 3 capstone.

**If this proves insufficient after Q-C playtest:** Consider adding doped_silicon×2 to LiCell (currently ×1), or raising LiCell lithium×2 to ×3. Both options would add ~186s or ~30s respectively to the chain.

**Decision required after Q-C:** Playtest LiCell before Q-D begins.

### R2: RPC capstone at 94 minutes serial — perceived as impenetrable

Reactive Plasma Core goes from 54m 41s (current) to 1h 34m 22s. This is the largest chain in the entire game. Real-world, a first-time RPC production is a 4–6 hour project. A player who unlocks Tier 12 for the first time will see a 94-minute minimum chain and may not understand what they're building toward.

**This is intended:** The implementation strategy explicitly calls for Gen 4 capstones to require multi-session investment. RPC is the terminal synthesis of Gen 4. However, the UI should make the prerequisite chain visible so players understand the scope before they start.

**Mitigation option if playtest reveals paralysis:** Drop RPC: ballistic_composite×2 back to ×1, which reduces RPC from 1h 34m to 58m 22s. This is the single largest lever.

### R3: BC chain time at 19m 30s vs CeSC at 14m 58s — structural track harder than cold track entry

Ballistic Composite (Tier 9) takes 19m 30s minimum. Ceramic Superconductor (Tier 10) takes 14m 58s. BC unlocks earlier but takes longer to produce.

**This asymmetry is intentional:** BC directly feeds RPC (now as ×2), so it must be expensive. CeSC is expensive in manufacturing complexity (glass + 2×doped_silicon) but not chain time alone. Monitor whether players avoid the structural track and prefer the cold track; if avoidance is strong, the BC/CeSC balance may need adjustment.

### R4: CNT becomes a severe manufacturing constraint — 6 CNTs per RPC

With BC:CNT×2 and CryM:CNT×2, and RPC:BC×2:

| Source | CNTs needed |
|---|---|
| CryM×1 (in RPC) | 2 |
| BC×2 (in RPC) | 4 |
| **Total per RPC** | **6** |

Each CNT requires graphene×3 → 18 graphenes. Each graphene requires methane×2 + carbon×3.

This is the most atom-intensive manufacturing chain in Gen 4. The risk is that it devolves into "click carbon forever" rather than feeling like a strategic challenge. Verify during Q-D playtest that the CNT queue feels like a bottleneck to manage, not an obstacle to farm through mindlessly.

**QSub has zero CNT demand**, which means the two capstone tracks feel distinctly different. If CNT pressure on RPC is too high, reducing CryM:CNT×2 to ×1 is the softest adjustment (removes 2 CNTs from RPC total, down to 4).

### R5: Metallic Hydrogen remains 1-click despite 15-minute chain time

MH chain time is unchanged at 15m (HP×1 was intentionally not doubled). The atom click cost is still **1 click** — the player clicks hydrogen once and waits 15 minutes. The "Metallic Hydrogen anomaly" is not addressed by quantity changes.

This is acceptable for now. Q-E energy cost changes may address the MH feel by making HP production meaningfully expensive in energy. Flag for Q-E review.

### R6: Shard payout will decrease with quantity increases

When players produce fewer end-products per run, the `log₂(produced+1)` terms in the shard formula shrink. However, the `unlockTier²` term dominates (63% of Gen 3 payouts at T=10) and is unaffected by production volume. The shard payout reduction from quantity changes is therefore dampened.

**Q-F (shard recalibration) must still address the `unlockTier²` dominance**, which causes Gen 3 runs to yield ~156 shards vs. the 15–30 shard target from the strategy doc. Quantity changes alone will not bring this into target range.

---

## Part 10 — Out of Scope

These decisions are explicitly deferred to later phases and must not be made during Q-B/C/D:

| Item | Deferred to |
|---|---|
| Energy cost changes (energyCost in seeds) | Q-E |
| Reaction time changes (reactionTime in seeds) | Q-E or explicit decision |
| Shard formula or shardValue changes | Q-F |
| New scarcity mechanisms (new currency, Gen 5 gate) | Phase R / Gen 5 design |
| Hydrogen Plasma low-IV anomaly | Accepted structural artifact |
| Nitric acid dead end (no downstream users) | Future content review |
| Chrome missing shard value | Q-F or separate content pass |

---

## Part 11 — Complete Proposed Change List

### Ready for Q-B implementation

Ordered by impact (lowest risk first):

```
// Gen 2 — atom friction, cascades into Gen 3 inputs
gen2_copper:       iron_oxide  qty: 1 → 2
gen2_tin:          iron_oxide  qty: 1 → 2
gen2_nickel:       ammonia     qty: 1 → 2
gen2_gold:         water       qty: 1 → 2
gen2_lithium:      salt        qty: 1 → 2
```

### Ready for Q-C (after Q-B validation)

```
// Gen 3 — time + atom friction
gen3_graphene:        methane   qty: 1 → 2
gen3_carbon_nanotube: graphene  qty: 2 → 3
gen3_doped_silicon:   gold      qty: 1 → 2
gen3_lithium_ion_cell: graphene qty: 1 → 2
gen3_stainless_steel: chrome    qty: 1 → 2
```

### Ready for Q-D (after Q-C validation)

```
// Gen 4 — manufacturing pressure via advanced intermediate quantities
// Principle: require more of complex multi-step intermediates, not wait-heavy simple inputs

gen4_ceramic_superconductor: doped_silicon     qty: 1 → 2  // cascades into CryM + QSub
gen4_cryogenic_matrix:       carbon_nanotube  qty: 1 → 2  // shared resource with BC
gen4_ballistic_composite:    carbon_nanotube  qty: 1 → 2  // combined: 6 CNTs per RPC
gen4_nuclear_fuel_pellet:    stainless_steel  qty: 1 → 2  // replaces MH×2; real manufacturing work
gen4_reactive_plasma_core:   ballistic_composite qty: 1 → 2  // forces 2 complete BC tracks
gen4_quantum_substrate:      ceramic_superconductor qty: 1 → 2  // forces 2 complete CeSC chains
```

### Held — pending Q-C and Q-D playtest results

```
// Escalation: if LiCell chain time proves insufficient after Q-C
gen3_lithium_ion_cell: doped_silicon qty: 1 → 2  (+186s — only if Q-C result underwhelms)

// De-escalation: if RPC at 94m proves paralyzing for first-time Tier 12 players
gen4_reactive_plasma_core: ballistic_composite qty: 2 → 1  (removes +500s and 2 CNT chains — softest RPC lever)

// De-escalation: if CNT pressure on RPC feels like mindless farming not strategy
gen4_cryogenic_matrix: carbon_nanotube qty: 2 → 1  (removes 2 CNTs from RPC total, down to 4)
```

---

## Part 12 — Audit Script Update Note

After each phase (Q-B, Q-C, Q-D) is applied to seeds, update the corresponding reaction entries in `server/dev-auditEconomy.js` to match the new quantities. The script will then reflect the correct post-change chain times and atom click counts as the new baseline.

The script must be re-run and its output verified before beginning the next phase. Specifically:
- After Q-B: verify Gen 2 chain times match the +9s (bronze) and atom click estimates above.
- After Q-C: verify LiCell chain time ≈ 614s and CNT chain time ≈ 402s.
- After Q-D: verify RPC chain time ≈ 5662s (1h 34m), QSub ≈ 3596s (60m), NFP ≈ 2296s (38m), CeSC ≈ 898s (15m).

---

*End of planning document. No seeds have been changed.*
