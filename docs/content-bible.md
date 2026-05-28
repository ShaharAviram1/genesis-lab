# Genesis Lab — Content Bible
**Version:** 1.0  
**Status:** Design Foundation — Pre-Content  
**Scope:** Substance schema, Reaction schema, Generational structure, Progression philosophy

This document defines the master template, naming conventions, formatting rules, and design intent for all Genesis Lab game content. It is the authoritative reference before any content generation begins. Do not deviate from these conventions when authoring substance or reaction entries.

---

## Table of Contents

1. [Substance Master Table Template](#1-substance-master-table-template)
2. [Reaction Master Table Template](#2-reaction-master-table-template)
3. [Generational Structure](#3-generational-structure)
4. [Progression Philosophy](#4-progression-philosophy)
5. [Cross-Reference Conventions](#5-cross-reference-conventions)

---

# 1. Substance Master Table Template

## 1.1 Field Definitions

| Field | Type | Required | Description | Gameplay / Economy Role |
|---|---|---|---|---|
| `substanceKey` | `string` | ✅ | Unique machine-readable slug. Stable identifier used in reactions, prerequisites, and seeds. Never changes after authoring. | Primary reference key across all content tables. All `discoveryPrerequisites` and `composition` entries use this key, not display names. |
| `generation` | `int (1–6)` | ✅ | Which content generation this substance belongs to. See §3 for generation definitions. | Controls which BigBang cycle the substance becomes accessible in. Gen 2+ substances are inaccessible until the appropriate BigBang has occurred. |
| `unlockTier` | `int (0–N)` | ✅ | Tier gate within the generation. Matches the `unlockTier` field on the User schema. Substance is invisible to the player until `user.unlockTier >= substance.unlockTier`. | Primary pacing gate. Tier 0 = immediately available at generation start. Each tier represents a meaningful progression step, not just a number increase. |
| `type` | `enum` | ✅ | Substance classification. One of: `element`, `compound`, `alloy`, `ion`, `biomolecule`, `polymer`, `exotic`. | Determines which reaction types can produce it and what UI category it appears in. Elements are created via the Atom Panel; compounds are produced via reactions only. |
| `symbol` | `string` | ✅ | Short display symbol shown in UI (e.g., `H`, `H₂O`, `ATP`). Max 6 characters. | Used in inventory slots and reaction cards for compact display. Use standard IUPAC chemical symbols for elements; use common abbreviations for complex molecules. |
| `name` | `string` | ✅ | Full display name shown to the player (e.g., `Hydrogen`, `Water`, `Adenosine Triphosphate`). | Used in all UI labels, reaction names, experiment hints, and log entries. Capitalize first letter only (sentence case). |
| `formula` | `string` | Compounds only | Chemical formula in standard notation (e.g., `H₂O`, `C₆H₁₂O₆`, `Fe₂O₃`). Null for elements. | Display only. Used in reaction cards and the lab notebook. Use subscript Unicode characters (₂ ₃ etc.) for consistent rendering. |
| `stateAtSTP` | `enum` | ✅ | Physical state at standard temperature and pressure. One of: `solid`, `liquid`, `gas`, `plasma`, `exotic`. | Affects visual representation in the 3D scene (mote appearance, color intensity, particle behavior). Exotic states are reserved for Gen 6. |
| `composition` | `array` | Compounds only | Array of `{ substanceKey, quantity }`. Describes what the compound is built from. | Lore/display only — the reaction system drives production, not this field. Used to generate "contains X of Y" tooltip info and to validate reaction design consistency. |
| `category` | `string` | ✅ | Sub-classification within type. See §1.2 for valid values per type. | Groups substances in the inventory UI and informs reaction hint logic. Experiment hints can reference category when giving "close but not quite" guidance. |
| `atomicNumber` | `int` | Elements only | Standard atomic number (1–118). | Used for element identity and ordering in the Atom Panel. Compounds have `null`. |
| `baseEnergy` | `int` | ✅ | Base energy value this substance contributes to the player's reactor when held in inventory, or the energy cost to create it as an atom. Denominated in reactor energy units (EU). | Core economy driver. Elements created via the Atom Panel consume `baseEnergy × quantity` from the energy pool. Higher-tier substances have higher baseEnergy — both costing more to make and contributing more to energy density. |
| `stabilityFactor` | `float (0.0–1.0)` | ✅ | How chemically stable the substance is. `1.0` = maximally stable (inert), `0.0` = maximally reactive (instantly degrades or reacts). | Affects experiment success rates — highly unstable substances increase the chance of a failed or unexpected reaction. Also used to determine decay behavior for future perishable substance mechanics. |
| `reactivity` | `float (0.0–1.0)` | ✅ | How many valid reactions this substance participates in, normalized. `1.0` = participates in many reactions (very reactive). `0.0` = inert (participates in zero reactions). | Drives experiment hint weighting. Highly reactive substances generate more hint text because there are more valid reactions to hint toward. Noble gases have `reactivity: 0.0` by design. |
| `electronegativity` | `float` | Elements only | Pauling electronegativity value. Null for compounds and exotic substances. | Used for internal consistency validation and future reaction generation tooling. Not directly displayed to the player. |
| `valenceElectrons` | `int` | Elements only | Number of valence electrons. | Used internally for bond capacity validation. `maxBonds` is derived from this but can be overridden. |
| `maxBonds` | `int` | Elements only | Maximum bonds this element can form. Derived from valence electrons but can be manually set. | Used to validate reaction design — a reaction that requires an element to form more bonds than `maxBonds` is invalid. |
| `radioactive` | `bool` | ✅ | Whether this substance is radioactive. Default `false`. | Reserved for future decay mechanics (radioactive substances lose quantity over time). Currently a lore flag only. |
| `shardValue` | `int (0–N)` | ✅ | Genesis Shards awarded per BigBang for having produced this substance at least once during the run. Higher-tier substances have higher shard values. | Key prestige economy lever. Common early elements have `shardValue: 0`. Milestone compounds and rare substances drive shard income. Every BigBang's shard total is the sum of `shardValue` for all substances in `user.runTotals`. |
| `unlocksUserTier` | `int (0–N)` | ✅ | If > 0, producing this substance for the first time advances `user.unlockTier` to this value. `0` means the substance does not gate any tier. Only one substance should unlock each tier. | The primary tier advancement mechanism. Milestone substances — the "boss items" of each tier — are designated here. Must be set with care: only the end-product of a major synthesis chain should carry this flag. |
| `discoveryPrerequisites` | `string[]` | ✅ | Array of `substanceKey` values that must have been produced before this substance becomes accessible (even if `unlockTier` is satisfied). Default `[]`. | Fine-grained gating beyond tier numbers. Used to enforce chemistry logic — you can't know about methane before you've made carbon and hydrogen compounds. |
| `isBaseElement` | `bool` | ✅ | Whether this element is directly creatable via the Atom Panel. Default `false`. Only valid for type `element`. | Separates "sourceable" elements from elements that must be produced via reactions (e.g., synthetic or radioactive elements). |
| `color` | `string (hex)` | ✅ | Primary color used in the 3D scene and inventory UI. Format: `#RRGGBB`. | Drives mote color in GenesisScene and inventory slot background tint. Should reflect real-world element/compound color associations where possible. |
| `icon` | `string` | Optional | Path or identifier for a custom UI icon. If null, the symbol is rendered as text in a styled badge. | Reserved for special milestone substances that deserve a unique icon. Most substances use the auto-generated symbol badge. |
| `isActive` | `bool` | ✅ | Whether this substance is live in the game. Default `false` during development — set to `true` when fully authored and tested. | Development safety gate. Inactive substances are invisible to all game systems. Use this to stage content before a release. |
| `designPurpose` | `string` | ✅ | Internal designer note explaining why this substance exists in the game. Not shown to players. | Required for all substances. Explains the intended gameplay role, which reaction chain it anchors, and any design constraints. Example: `"Bridge compound between Gen 1 water chemistry and Gen 2 acid chemistry. Key reactant in H2SO4 pathway."` |

---

## 1.2 Valid Category Values by Type

| `type` | Valid `category` values |
|---|---|
| `element` | `nonmetal`, `metal`, `noble_gas`, `halogen`, `metalloid`, `alkali_metal`, `alkaline_earth`, `transition_metal`, `lanthanide`, `actinide` |
| `compound` | `oxide`, `acid`, `base`, `salt`, `hydride`, `carbonate`, `sulfate`, `nitrate`, `organic`, `inorganic` |
| `alloy` | `ferrous`, `non_ferrous`, `refractory`, `superalloy` |
| `ion` | `cation`, `anion`, `polyatomic` |
| `biomolecule` | `amino_acid`, `sugar`, `lipid`, `nucleotide`, `nucleic_acid`, `protein`, `enzyme`, `coenzyme` |
| `polymer` | `natural`, `synthetic`, `biopolymer` |
| `exotic` | `dark_matter`, `antimatter`, `strange_matter`, `quantum_condensate` |

---

## 1.3 Naming Conventions

| Rule | Correct | Incorrect |
|---|---|---|
| `substanceKey` is lowercase, underscore-separated | `hydrogen`, `sodium_chloride`, `adenosine_triphosphate` | `Hydrogen`, `NaCl`, `ATP`, `sodium-chloride` |
| `name` is sentence case, full name | `Sodium chloride`, `Adenosine triphosphate` | `sodium chloride`, `SODIUM CHLORIDE`, `Sodium Chloride` |
| `symbol` uses standard IUPAC symbols for elements | `H`, `Na`, `Fe` | `Hy`, `SD`, `Iron` |
| `symbol` for compounds uses common abbreviation or condensed formula | `H₂O`, `NaCl`, `ATP`, `DNA` | `Water`, `SodiumChloride` |
| `formula` uses Unicode subscripts, not plain numbers | `H₂O`, `C₆H₁₂O₆` | `H2O`, `C6H12O6` |
| `color` is always 6-digit hex | `#00d4ff` | `cyan`, `#0df`, `rgb(0,212,255)` |
| `substanceKey` is globally unique across all generations | `gen2_sulfuric_acid` is acceptable if needed for disambiguation | Never reuse a key |

---

## 1.4 Example Substance Row (Format Reference)

```
substanceKey:           hydrogen
generation:             1
unlockTier:             0
type:                   element
symbol:                 H
name:                   Hydrogen
formula:                null
stateAtSTP:             gas
composition:            []
category:               nonmetal
atomicNumber:           1
baseEnergy:             10
stabilityFactor:        0.7
reactivity:             0.85
electronegativity:      2.2
valenceElectrons:       1
maxBonds:               1
radioactive:            false
shardValue:             0
unlocksUserTier:        0
discoveryPrerequisites: []
isBaseElement:          true
color:                  #d8eef8
icon:                   null
isActive:               true
designPurpose:          "Foundational Gen 1 element. Primary reactant for water, 
                         hydrides, and acid synthesis chains. Highest reactivity 
                         of all elements — anchors the majority of Gen 1 reactions."
```

---

# 2. Reaction Master Table Template

## 2.1 Field Definitions

| Field | Type | Required | Description | Gameplay / Economy Role |
|---|---|---|---|---|
| `reactionID` | `int` | ✅ | Monotonically increasing integer ID. Globally unique. Never reused, never changed after authoring. | Database primary key. Reactions are referenced in logs, user discovered-state tracking, and the reaction list by this ID. |
| `reactionKey` | `string` | ✅ | Human-readable slug for designer use. Format: `{reactant1}_{reactant2}_to_{product}`. Unique across all generations. | Used in design tooling, seed scripts, and cross-referencing between the substance and reaction tables. Not shown to players. |
| `generation` | `int (1–6)` | ✅ | Which generation this reaction belongs to. Must match the generation of the product substance. | Determines which BigBang cycle this reaction becomes available in. All reactants must be from generation ≤ this value. |
| `unlockTier` | `int (0–N)` | ✅ | Tier gate. Reaction is invisible and non-performable until `user.unlockTier >= reaction.unlockTier`. | Must be set to the same tier as the product substance's `unlockTier`. If the product is Tier 2, the reaction must also be Tier 2. |
| `name` | `string` | ✅ | Short display name shown in the Reaction Panel and lab notebook (e.g., `Water Synthesis`, `Iron Oxidation`, `Glucose Fermentation`). | The name should describe what is being made or what the reaction does, not the reaction type. Sentence case. Max ~40 characters for UI fit. |
| `reactants` | `array` | ✅ | Array of `{ substanceKey, quantity }`. The input materials required to perform this reaction. Min 1 reactant, max 4. | All reactants are consumed from inventory on perform. Design reactant quantities to be achievable without grinding — if a reaction requires 5 of a substance, that substance should be abundant or fast to produce. |
| `product` | `object` | ✅ | `{ substanceKey, quantity }`. The primary output of the reaction. | Produced and added to inventory on success. The product's `unlockTier` and `generation` must match this reaction's values. |
| `byproducts` | `array` | ✅ | Array of `{ substanceKey, quantity }`. Secondary outputs produced alongside the main product. Default `[]`. | Byproducts are always produced on success — they are not optional. Use byproducts to create interesting inventory management decisions (do you want to accumulate this?) and to model realistic chemistry (combustion always produces CO₂ and H₂O). |
| `reactionType` | `enum` | ✅ | Mechanistic classification. One of: `synthesis`, `decomposition`, `combustion`, `fusion`, `transmutation`, `acid_base`, `redox`, `catalytic`, `fermentation`, `polymerization`. | Drives experiment hint categorization, animation selection, and future automation routing. The animation system uses this to determine visual intensity. |
| `compoundType` | `enum` | Compounds only | Output classification. One of: `compound`, `material`, `structure`, `biomolecule`, `polymer`. | Used for UI grouping in the Reaction Panel and for future automation sorting. |
| `energyCost` | `int (≥ 0)` | ✅ | Energy (EU) consumed from the player's reactor to perform this reaction. Minimum 0. | Core economy gate. High-tier reactions must cost meaningfully more than low-tier ones. Rule of thumb: `energyCost ≈ sum(reactant baseEnergy × quantity) × 0.5`. Never set to 0 for non-trivial reactions. |
| `energyChange` | `int` | ✅ | Net energy released (+) or absorbed (–) by the reaction itself, separate from `energyCost`. Positive = exothermic (reaction gives energy back). Negative = endothermic (reaction drains additional energy). | Affects overall energy economy. Combustion reactions should always be exothermic. Synthesis of complex molecules is always endothermic. Endothermic reactions are more expensive to chain — which is correct design. |
| `reactionTime` | `float (seconds)` | ✅ | Time in seconds for the reaction animation and cooldown after performing. | Controls pacing. Gen 1 reactions: 1–3s. Gen 2: 3–6s. Gen 3+: scale up. Do not make early reactions feel sluggish — the reactor should feel responsive at the start of each run. |
| `conditions` | `object` | Optional | Key-value object describing special conditions required (e.g., `{ "temperature": "high", "pressure": "low" }`). Null if no special conditions. | Lore/display field for now. Reserved for future condition-gating mechanics where certain reactions require catalysts or reactor upgrades to access. |
| `catalyst` | `string` | Optional | `substanceKey` of a substance that catalyzes this reaction. If set, the catalyst is consumed unless `catalystConserved: true` is also set. Null if no catalyst required. | Reserved for Gen 3+ enzyme and catalyst mechanics. Catalytic reactions are always `reactionType: catalytic`. The catalyst substance still occupies inventory — players must balance producing catalysts vs. using them. |
| `isReversible` | `bool` | ✅ | Whether this reaction can be run in reverse (decomposing the product back into reactants). Default `false`. | When `true`, a decomposition reaction should also exist in the table. Reversible reactions allow players to manage inventory overflow. |
| `discoveryXP` | `int` | ✅ | Abstract experience value awarded when this reaction is discovered for the first time. Does not directly affect gameplay stats — used to weight the significance of a discovery in the log and for future achievement tracking. | Higher values signal rarer, more important discoveries. Tier milestone reactions should have 10× the discoveryXP of common synthesis reactions. |
| `discoveredByDefault` | `bool` | ✅ | Whether the player starts knowing this reaction (shown in Reaction Panel without experimenting). Default `false`. | Set to `true` only for obvious/tutorial reactions that the game needs to surface without experiment friction. Gen 1, Tier 0 only — and sparingly even there. All other reactions must be discovered through experimentation. |
| `requiredUserUnlock` | `bool` | ✅ | Whether this reaction requires `user.unlockTier` to be explicitly at or above `reaction.unlockTier`. Default `true`. | Almost always `true`. Set to `false` only for special event or easter-egg reactions that bypass the normal tier gate. |
| `isActive` | `bool` | ✅ | Whether this reaction is live in the game. Default `false` during development. | Same staging gate as substances. A reaction should only be set active when both its reactant and product substances are also active. |
| `designPurpose` | `string` | ✅ | Internal designer note. Documents the reaction's role in the chemistry chain, what tier/milestone it enables, and any balance notes. | Required for all reactions. Example: `"Primary synthesis path for water. Tier 0 tutorial reaction — must be discoverable immediately. Gently exothermic to reward the player for their first discovery."` |

---

## 2.2 Valid `reactionType` Values

| Value | Description | Typical `energyChange` | Generations |
|---|---|---|---|
| `synthesis` | Two or more substances combine into one | Negative (endothermic) | All |
| `decomposition` | One substance breaks into two or more | Positive (exothermic) | All |
| `combustion` | Rapid oxidation, produces heat + light | Strongly positive | Gen 1–3 |
| `acid_base` | Neutralization between acid and base | Moderately positive | Gen 1–3 |
| `redox` | Oxidation-reduction electron transfer | Varies | Gen 1–4 |
| `fusion` | Atomic nuclei merge (very high energy) | Very strongly positive | Gen 1 (stellar), Gen 6 |
| `transmutation` | Element identity changes | Strongly negative | Gen 1 (rare), Gen 6 |
| `catalytic` | Reaction enabled by a catalyst substance | Reduced negative | Gen 3–5 |
| `fermentation` | Biological sugar → alcohol/acid conversion | Slightly positive | Gen 3–4 |
| `polymerization` | Monomers chain into polymer | Strongly negative | Gen 4–5 |

---

## 2.3 Naming Conventions

| Rule | Correct | Incorrect |
|---|---|---|
| `reactionKey` format: `{r1}_{r2}_to_{product}` | `hydrogen_oxygen_to_water` | `H2_synthesis`, `makeWater`, `reaction_001` |
| Multiple reactants: list all, alphabetical | `carbon_hydrogen_oxygen_to_methanol` | `methanol_synthesis` |
| `name` is sentence case, product-focused | `Water synthesis`, `Iron oxidation`, `Glucose fermentation` | `Synthesize Water`, `WATER`, `h+o` |
| `reactionID` is sequential per generation block | Gen 1: 1000–1999, Gen 2: 2000–2999, etc. | Mixed IDs, gaps without reason |
| Product substance in `reactionKey` uses `substanceKey` exactly | `hydrogen_oxygen_to_water` (not `hydrogen_oxygen_to_h2o`) | Mismatch with substanceKey |

---

## 2.4 `reactionID` Numbering Blocks

| Generation | ID Range |
|---|---|
| Gen 1 — Basic Matter & Chemistry | 1000–1999 |
| Gen 2 — Planetary Chemistry | 2000–2999 |
| Gen 3 — Prebiotic Chemistry | 3000–3999 |
| Gen 4 — Life Systems | 4000–4999 |
| Gen 5 — Civilization & Technology | 5000–5999 |
| Gen 6 — Cosmic / Exotic Matter | 6000–6999 |
| Special / Event / Easter Egg | 9000–9999 |

---

## 2.5 Example Reaction Row (Format Reference)

```
reactionID:             1001
reactionKey:            hydrogen_oxygen_to_water
generation:             1
unlockTier:             0
name:                   Water synthesis
reactants:              [{ hydrogen, 2 }, { oxygen, 1 }]
product:                { water, 1 }
byproducts:             []
reactionType:           synthesis
compoundType:           compound
energyCost:             15
energyChange:           +8
reactionTime:           2.0
conditions:             null
catalyst:               null
isReversible:           false
discoveryXP:            50
discoveredByDefault:    false
requiredUserUnlock:     true
isActive:               true
designPurpose:          "The first reaction every player discovers. The discovery 
                         moment should feel earned but inevitable — reactants are 
                         obvious, hint system surfaces it quickly. Slightly 
                         exothermic to reward the player immediately. Water then 
                         becomes the key reactant for acid synthesis chains."
```

---

# 3. Generational Structure

Generations represent complete thematic eras of chemistry. Each generation is unlocked by completing a BigBang reset while meeting the prerequisite shard threshold. Within a generation, tier advancement is driven by producing milestone substances.

---

## Gen 1 — Basic Matter & Chemistry

**Gameplay Fantasy:** You are a god at the moment of creation, assembling the first atoms from raw energy and discovering the most fundamental reactions in the universe. Every discovery feels primal and significant.

**Progression Purpose:** Tutorial and foundation. Teaches core loops — atom creation, experimentation, reaction performance, tier advancement. Must feel fast, rewarding, and never tedious. Players replay Gen 1 many times via BigBang prestige, so it must remain engaging across multiple runs.

**Substances:** Common elements (H, He, C, N, O, Na, Cl, Fe, etc.) and simple inorganic compounds (H₂O, CO₂, NaCl, Fe₂O₃, HCl, NH₃, CH₄, O₃).

**Reactions:** Single-step synthesis, simple decomposition, combustion, basic acid-base. All reactions use 1–3 reactants. No catalysts. No complex chains.

**Tier Structure (5 tiers):**
- Tier 0: Lightest elements, basic gas synthesis (H₂O, CO₂)
- Tier 1: Common metals, first salts, simple acids (NaCl, HCl)
- Tier 2: Oxides, first redox reactions (Fe₂O₃, rust pathway)
- Tier 3: Ammonia, methane, first organic compounds
- Tier 4: First multi-step chains; milestone substance unlocks BigBang gate

**Differentiation:** Smallest substance pool, fastest reaction times, lowest energy costs. The reactor should feel like a living thing from the first minute. Runs get shorter and more efficient with each BigBang because players know the optimal path.

---

## Gen 2 — Planetary Chemistry

**Gameplay Fantasy:** You are shaping a planet's geology. Acids eat through rock, minerals crystallize, salts precipitate from ancient seas. The chemistry is more complex but the scale feels geological and ancient.

**Progression Purpose:** First exposure to multi-step reaction chains. Players must produce intermediate compounds they don't immediately "use" — they are steps toward something greater. Introduces the concept of planning a chemistry tree rather than reacting things pairwise.

**Substances:** Minerals (SiO₂, CaCO₃), strong acids (H₂SO₄, HNO₃), bases (NaOH, Ca(OH)₂), salts (CaSO₄, Na₂CO₃), early metals/alloys (bronze, early steel precursors).

**Reactions:** Acid-base neutralization, carbonation, mineral dissolution, first redox chains with multiple steps. Some reactions begin requiring specific conditions (high temperature).

**Tier Structure (5–6 tiers):**
- Tier 0: Extends Gen 1 base elements into mineral context
- Tier 1: First strong acids and bases
- Tier 2: Salt synthesis chains (neutralization pathways)
- Tier 3: First alloys, early metalworking chemistry
- Tier 4: Industrial acids (H₂SO₄, HNO₃) — economically significant, open Gen 3 gate
- Tier 5: Planetary milestone substance — triggers BigBang gate for Gen 3

**Differentiation from Gen 1:** Reaction chains require 2–3 steps. Intermediate substances are more plentiful. Energy costs are meaningfully higher. Reaction times are longer. The player must manage inventory more carefully.

---

## Gen 3 — Prebiotic Chemistry

**Gameplay Fantasy:** Chemistry begins to organize itself. Small molecules arrange into the precursors of life. You are simulating the chemistry that, billions of years ago, sparked the transition from rock to biology. The palette shifts from minerals to organics.

**Progression Purpose:** Introduces catalysts and the concept of biochemical pathways. Reactions start having biological flavor. Players encounter their first "chain of chains" — synthesis routes that require 4–5 total steps across multiple intermediate substances.

**Substances:** Amino acids (glycine, alanine), simple sugars (ribose, glucose precursors), phosphates, nucleotide bases (adenine, cytosine), lipid precursors, formaldehyde, HCN as key reactants.

**Reactions:** First catalytic reactions. Condensation reactions. Phosphorylation pathways. Reduction of CO₂ to organic carbon. All reactions slower, higher energy cost. Some require specific temperature/pressure conditions.

**Tier Structure (6 tiers):**
- Tier 0: Simple carbon-organic bridges from Gen 2
- Tier 1: Amino acid synthesis pathways
- Tier 2: Simple sugar synthesis
- Tier 3: Nucleotide base synthesis
- Tier 4: First phosphate bonds — the energy currency concept introduced
- Tier 5: ATP precursor synthesis — triggers BigBang gate for Gen 4

**Differentiation from Gen 2:** Catalysts now required for some reactions. Substance pool is larger and interconnected — many substances participate in multiple reaction chains. Players must make strategic choices about what to prioritize. Automation hints become visible.

---

## Gen 4 — Life Systems

**Gameplay Fantasy:** Life emerges. The reactor is now a primordial cell, and you are guiding the first biological machines. Proteins fold, DNA assembles, metabolic pathways spin up. This is the most complex and rewarding generation.

**Progression Purpose:** Introduces automation. Enzymes (biological catalysts) act as passive generators — once produced, they continuously catalyze reactions without player input. The player graduates from manual chemistry to managing biological factories.

**Substances:** Complete amino acids, proteins, DNA/RNA strands, ATP, lipid bilayers, sugars (glucose, fructose), enzymes (as special substance type), cell membrane precursors.

**Reactions:** Enzymatic reactions (catalytic, with enzyme as catalyst), polymerization (amino acids → proteins), DNA synthesis, metabolic cycles (glycolysis steps), ATP synthesis.

**Tier Structure (6–7 tiers):**
- Tier 0: Bridges from Gen 3 amino acids and nucleotides
- Tier 1: First protein synthesis (polymerization)
- Tier 2: Enzyme synthesis — first automation unlocked
- Tier 3: DNA/RNA synthesis chains
- Tier 4: Metabolic cycle implementation (glycolysis-style)
- Tier 5: ATP production chain — energy system fundamentally changes
- Tier 6: First cell-like structure synthesis — triggers BigBang gate for Gen 5

**Differentiation from Gen 3:** Automation is central, not optional. Managing enzyme inventory becomes a strategic layer. Reaction chains are 5–8 steps. Some substances decay or are consumed passively — inventory management is critical.

---

## Gen 5 — Civilization & Technology

**Gameplay Fantasy:** Humanity. Matter shaped by intelligence. Polymers, semiconductors, pharmaceuticals, alloys. The chemistry is industrial in scale, and the player is now engineering with precision, not experimenting in the dark.

**Progression Purpose:** Peak complexity and automation sophistication. Players operate full reaction pipelines where multiple automated chains feed each other. Discovery takes a back seat to optimization — most reactions are known, and the game becomes about throughput and efficiency.

**Substances:** Steel, silicon, polyethylene, nylon, penicillin, aspirin, fertilizers (NH₃-derived), semiconductors (doped silicon), carbon fiber, high-performance alloys.

**Reactions:** Industrial synthesis (Haber process for ammonia-scale fertilizer), polymerization (plastics), pharmaceutical synthesis, metallurgical reactions, semiconductor doping.

**Tier Structure (7–8 tiers):**
- Tier 0: Industrial bridges from Gen 4 biology
- Tier 1–3: Material synthesis chains (metals, polymers, ceramics)
- Tier 4–5: Electronics / pharmaceutical / fuel chains
- Tier 6: High-tech material synthesis
- Tier 7: Singular technological milestone substance — BigBang gate for Gen 6

**Differentiation from Gen 4:** The player is optimizing, not discovering. Most reactions are `discoveredByDefault: true` to reduce experimentation friction — the game is about factory management now, not puzzle solving. Energy costs are very high, but automation makes this sustainable.

---

## Gen 6 — Cosmic / Exotic Matter

**Gameplay Fantasy:** Beyond known physics. Dark matter. Antimatter. Strange matter. Quantum condensates. The reactor has become something unknowable, operating at the boundaries of reality. Each reaction feels like a miracle. Each substance is a treasure.

**Progression Purpose:** Endgame. Designed for players who have completed multiple full prestige cycles. Substances here have enormous shard values — a single Gen 6 run dramatically accelerates future prestige. The challenge is the extreme energy cost and long reaction times, not discovery.

**Substances:** Dark matter particles, antimatter (antihydrogen, positrons), strange quarks/quark-gluon plasma, Bose-Einstein condensate, exotic neutron star matter, vacuum energy crystals.

**Reactions:** Fusion at stellar scales, matter-antimatter annihilation (very high `energyChange`), exotic matter transmutation, quantum entanglement reactions (mechanic TBD), dark matter catalysis.

**Tier Structure (5 tiers, very sparse):**
- Tier 0: Bridge from Gen 5 ultra-high-energy materials
- Tier 1–2: First exotic matter synthesis
- Tier 3: Antimatter production
- Tier 4: True exotic substances — each is a run-defining achievement

**Differentiation from Gen 5:** Discovery is back. Almost nothing is `discoveredByDefault`. Experimentation with exotic materials is dangerous (higher failure rates). Substances are rare by design — players may only produce a handful per run. Shard values are 10–100× Gen 1 equivalents.

---

# 4. Progression Philosophy

## 4.1 Unlock Tiers

Tiers are the heartbeat of within-generation pacing. Each tier must feel like a meaningful chapter, not a numeric increment.

- **One milestone substance per tier.** Only one substance has `unlocksUserTier > 0` per tier gate. This is the "boss item" — reaching it means you've mastered that tier's chemistry.
- **Tiers unlock substance visibility, not just access.** A Tier 2 substance is invisible in the UI until the player reaches Tier 2. The game should never show an item the player cannot yet interact with.
- **Tier advancement is permanent within a run.** There is no way to de-tier. Once unlocked, tier stays until BigBang.
- **Tier 0 must be immediately accessible and fast.** A player starting fresh (or after a BigBang) must reach their first tier advance within 2–5 minutes. This is the engagement anchor.
- **Avoid fake gating.** Do not gate a reaction at Tier 2 if both its reactants are available at Tier 0. Every tier gate must require a substance that was genuinely gated.

## 4.2 Discovery

Discovery is the core emotional loop of Genesis Lab. Every discovery must feel earned.

- **Default state: unknown.** `discoveredByDefault: false` for all reactions except a small number of tutorial reactions at Gen 1, Tier 0. The player should not know what's possible — they should wonder.
- **The hint system is the bridge.** When experimentation fails, the hint system tells the player *why* in progressively more specific ways: locked tier → name-similar → quantity shortage → generic fail. Hints must never give away exact formulas — they should narrow the search space.
- **Discovery grants permanent knowledge.** Once a player discovers a reaction, it appears in their Reaction Panel for the rest of the run. After a BigBang, discovered reactions are NOT carried over — rediscovery is part of the loop, made faster by player knowledge.
- **First discovery should feel special.** Discovery animations are more dramatic than normal reactions. The lab notebook logs discoveries prominently. Future: achievement system awards first discoveries.
- **No dead ends.** Every substance reachable by the player at their current tier should participate in at least one discoverable reaction at that tier. Players should never hold a substance that has nothing to do.

## 4.3 Prestige (Big Bang)

The BigBang is a civilizational reset, not a failure state. It must feel intentional, epic, and rewarding.

- **BigBang is voluntary.** Players choose when to BigBang. The game signals readiness (expected shard count visible before committing) but never forces it.
- **What resets:** Inventory, energy, reaction discoveries, unlock tier, run totals. Everything within-generation.
- **What persists:** Genesis Shards accumulated, prestige upgrades purchased, BigBang count, and — when designed — the ability to start the next generation.
- **Shard calculation:** At BigBang, shards = sum of `substance.shardValue` for every substance the player has produced at least once during the run (tracked in `user.runTotals`). Producing a substance 100 times gives the same shards as producing it once — the incentive is breadth, not grind.
- **Shard spending:** Three prestige upgrade tracks (Energy, Matter, Chemistry). Each track compounds multiplicatively — later levels cost exponentially more shards. This creates diminishing returns that make each BigBang feel impactful early but require many runs for maximal benefit.
- **Generational unlock via BigBang:** Each new generation requires a minimum BigBang count and a minimum cumulative shard total. Gen 2 unlocks after BigBang 1. Gen 3 after BigBang 3 with N shards. Gen 6 is only accessible to players with 10+ BigBangs and extreme shard totals.
- **Run length should decrease over time.** With prestige upgrades and player knowledge of optimal paths, each Gen 1 run should get faster. The fantasy is mastery — not repetition.

## 4.4 Automation

Automation rewards players who have mastered manual chemistry.

- **Automation is not available in Gen 1.** This is intentional. Gen 1 must be played manually — it teaches the core loop. Automation arriving too early removes the learning moment.
- **Gen 2: Passive generators.** Unlocked via prestige upgrades or late-tier milestones. Generate base elements at a slow tick rate. The player still performs reactions manually.
- **Gen 3–4: Catalyst-based automation.** Producing an enzyme or catalyst substance allows it to passively run its associated reaction at a slow rate. The player must maintain catalyst inventory — automation is not free.
- **Gen 5: Full pipeline automation.** Reaction chains can be queued and run automatically end-to-end. The player role shifts to pipeline design and resource routing.
- **Automation does not trivialize discovery.** Automated reactions can only run reactions the player has already discovered manually. Discovery remains a human act — automation is for production, not exploration.
- **Automation future design:** Dedicated automation interface (pipeline editor) is a planned Phase 7+ feature. Current content design must ensure substances and reaction chains are structured to support this — no dead-end substances, no circular dependencies.

## 4.5 Reaction Chains

Reaction chains are the strategic spine of the game.

- **Gen 1:** Chains are 1–2 steps. A → B → C at most.
- **Gen 2:** Chains are 2–3 steps. Intermediate substances are meaningful inventory items.
- **Gen 3–4:** Chains are 4–6 steps. Multiple parallel chains feed into a single synthesis target.
- **Gen 5–6:** Chains are 6–10 steps. Some chains are forking trees, not linear sequences.
- **No dead ends.** Every chain must terminate in either a milestone substance (unlocksUserTier) or a high-shard substance. No chain should produce a substance that is only used as a byproduct with no further use.
- **Shared intermediates are intentional.** Design substances that are intermediates in multiple chains. This creates interesting resource allocation — should you use your CO₂ for this chain or that one?
- **Byproducts feed other chains.** A byproduct of Reaction A should be a reactant in Reaction B wherever chemically sensible. This creates a closed-loop economy of matter.

## 4.6 Multi-Stage Chemistry

Multi-stage chemistry means the player never has a "buy 10, click button" idle experience. There must always be active decisions.

- **Each stage must feel distinct.** A 4-stage chain should not feel like clicking the same button 4 times. Each step should produce a visually different substance with a different role in the chain.
- **Stage gating by substance, not time.** Never gate a stage on time-elapsed. Gates are always on substance availability. Waiting with nothing to do is a design failure.
- **Parallel paths for the same milestone.** Where chemically plausible, there should be 2 different reaction pathways that produce the same milestone substance. This creates player choice and replayability — different paths per run.
- **The reactor is always active.** If the player has nothing to react, the game is failing them. Use the hint system, the lab notebook, and the objective system to always point toward the next action.

## 4.7 Experimentation

Experimentation is the discovery engine. It must feel risky, surprising, and worth the cost.

- **Cost is the tension.** Experimentation consumes substances. The player must decide: is this worth gambling? Early tiers should have low experiment costs. Later tiers should make experimentation a meaningful resource decision.
- **Failure is informative, never silent.** A failed experiment always yields a hint. The quality of the hint scales with how "close" the attempt was. A random wrong combination gets a generic fail. A close-but-wrong combination (similar substances, right type) gets a targeted hint.
- **Experiments cannot be automated.** Even in Gen 5 with full pipeline automation, experiments must be player-initiated. Discovery is a human act by design.
- **The discovery space thins at higher tiers.** Early Gen 1 has many undiscovered reactions — experimentation is very likely to hit something. By Tier 4, most obvious combinations are known and the player must be more deliberate. This is intentional: experimentation becomes more valuable and more strategic at higher tiers, not less.
- **Discovery log as memory.** The lab notebook records every experiment — failures, successes, discoveries. Players can review what they've tried, preventing frustrating re-experimentation of known-failed combinations. The notebook is a gameplay tool, not cosmetic.

---

# 5. Cross-Reference Conventions

## 5.1 Substance–Reaction Consistency Rules

These rules must be validated before any content is marked `isActive: true`:

1. Every `substanceKey` in a reaction's `reactants`, `product`, or `byproducts` must exist as an active substance.
2. A reaction's `unlockTier` must equal the `unlockTier` of its product substance.
3. A reaction's `generation` must equal the `generation` of its product substance.
4. All reactant substances must have `generation ≤ reaction.generation`.
5. If a substance has `unlocksUserTier > 0`, exactly one reaction must produce it.
6. If a substance has `isBaseElement: false` and `type: element`, it must be producible by at least one active reaction.
7. `reactionID` values must be unique globally and must fall within the correct generation ID block.

## 5.2 Balance Reference Ratios

These are soft targets, not hard rules. Use them as starting points and adjust based on playtesting.

| Metric | Gen 1 | Gen 2 | Gen 3 | Gen 4 | Gen 5 | Gen 6 |
|---|---|---|---|---|---|---|
| Reactions per substance | 1–2 | 2–3 | 2–4 | 3–5 | 3–4 | 1–2 |
| Avg reaction steps to milestone | 2 | 3 | 4–5 | 6 | 7–8 | 3–4 |
| Avg energyCost | 10–30 | 30–80 | 80–200 | 200–600 | 600–2000 | 2000–10000 |
| Avg reactionTime (s) | 1–3 | 2–5 | 4–8 | 6–12 | 8–20 | 15–60 |
| shardValue range | 0–5 | 5–20 | 20–60 | 60–150 | 150–500 | 500–5000 |
| discoveredByDefault fraction | ~10% | ~5% | ~2% | ~1% | ~15% | ~0% |

## 5.3 Content Authoring Order

When generating content for a generation, always author in this order to avoid forward-reference errors:

1. All element substances (Tier 0 first, ascending)
2. All compound substances (Tier 0 first, ascending)
3. All reactions (Tier 0 first, ascending)
4. Validate all cross-references
5. Set `isActive: true` for validated entries
6. Write seed script entries

---

*End of Content Bible v1.0*
