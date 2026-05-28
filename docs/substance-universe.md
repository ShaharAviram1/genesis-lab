# Genesis Lab — Substance Universe Master List
**Version:** 2.0  
**Status:** Design — Pre-Balance, Pre-Seed  
**Reference:** generation-philosophy-v2.md §§3–4 (new generation structure)  
**Supersedes:** substance-universe.md v1.0

> **What changed from v1.0:** Gen 3 (Prebiotic Chemistry) and Gen 4 (Life Systems) are fully replaced. Gen 5 (Civilization & Technology) is replaced by Cosmic Alchemy. Gen 6 (Cosmic/Exotic Matter) is replaced by Reality Manipulation. 36 substances removed; ~40 new substances added across the redesigned generations. See generation-philosophy-v2.md §12 for the removal list.

---

## How to Read This Table

| Column | Meaning |
|---|---|
| `itemKey` | Stable machine-readable slug. Never changes after authoring. |
| `name` | Display name (sentence case). |
| `formula` | Chemical formula or symbol. `—` for alloys and engineered materials without a single formula. |
| `type` | element / compound / alloy / polymer / material / exotic / mythic |
| `category` | Subcategory per content-bible §1.2, extended for new substance classes |
| `gen` | Rough generation (1–6). Thematic era, not exact unlock tier. |
| `dependsOn` | Key direct precursors (itemKey values). Base elements list `— (energy)`. |
| `usedFor` | Key downstream consumers or systems this substance enables. |
| `designPurpose` | Why this substance exists. Its gameplay role. |
| `priority` | **must-have** = core to progression chain / **optional** = adds depth / **later** = future expansion |
| `notes` | Flags, design constraints, cross-generation notes. |

---

## Full Substance Table

### Generation 1 — Fundamental Matter

*The reactor wakes. Energy becomes matter. Matter becomes molecules. Every discovery feels like an act of creation.*

| itemKey | name | formula | type | category | gen | dependsOn | usedFor | designPurpose | priority | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `hydrogen` | Hydrogen | H | element | nonmetal | 1 | — (energy) | water, ammonia, methane, hydrogen_chloride, deuterium (Gen 5) | Most reactive element. Participates in more reactions than anything else. The primary currency element of Gen 1. | must-have | isBaseElement: true |
| `helium` | Helium | He | element | noble_gas | 1 | — (energy) | liquid_helium (Gen 5), shards | Inert. Zero reactions. Created for shard value. Helium returns in Gen 5 cryogenic chain — a callback to the very first noble gas. | must-have | isBaseElement: true; reactivity: 0 |
| `carbon` | Carbon | C | element | nonmetal | 1 | — (energy) | methane, carbon_dioxide, carbon_monoxide, coke (Gen 3), graphene (Gen 3), carbon_fiber (Gen 3), fullerene (Gen 3) | The backbone of all organic and advanced carbon chemistry. Participates in every generation from steel to graphene. Most chain-critical element in the game. | must-have | isBaseElement: true |
| `nitrogen` | Nitrogen | N | element | nonmetal | 1 | — (energy) | ammonia, nitric_oxide, nylon chain (Gen 3) | Key to ammonia and industrial chemistry. Nitrogen compounds gate multiple Gen 2 and Gen 3 chains. | must-have | isBaseElement: true |
| `oxygen` | Oxygen | O | element | nonmetal | 1 | — (energy) | water, carbon_dioxide, iron_oxide, combustion reactions | Universal oxidizer. Participates in reactions across all six generations. | must-have | isBaseElement: true |
| `sodium` | Sodium | Na | element | alkali_metal | 1 | — (energy) | sodium_chloride, sodium_hydroxide (Gen 2), sodium_carbonate (Gen 2) | Gates the salt and base chemistry chains. Milestone element for first-tier advance via NaCl. | must-have | isBaseElement: true |
| `chlorine` | Chlorine | Cl | element | halogen | 1 | — (energy) | hydrogen_chloride, sodium_chloride | Reactive halogen. First salt and first acid both require it. | must-have | isBaseElement: true |
| `iron` | Iron | Fe | element | transition_metal | 1 | — (energy) | iron_oxide, pig_iron (Gen 3), steel (Gen 3) | Anchors the metal chain from Gen 1 to Gen 3. The reunion: iron smelted in Gen 1 becomes the steel milestone in Gen 3. | must-have | isBaseElement: true |
| `sulfur` | Sulfur | S | element | nonmetal | 1 | — (energy) | hydrogen_sulfide, sulfur_dioxide (Gen 2), industrial acid chain | Critical pathway to Gen 2 acid chemistry (H₂SO₄). | must-have | isBaseElement: true |
| `argon` | Argon | Ar | element | noble_gas | 1 | — (energy) | shards, inert atmosphere applications | Noble gas. Shard income. No reaction chain. | optional | isBaseElement: true; reactivity: 0 |
| `water` | Water | H₂O | compound | oxide | 1 | hydrogen, oxygen | calcium_hydroxide, sodium_hydroxide, acid-base reactions throughout all gens | The most important compound in the game. Universal solvent. The first and most satisfying discovery. | must-have | First reaction most players discover |
| `carbon_dioxide` | Carbon dioxide | CO₂ | compound | oxide | 1 | carbon, oxygen | calcium_carbonate (Gen 2), urea (Gen 2), sodium_carbonate (Solvay), lithium_carbonate (Gen 3) | Key carbon carrier between inorganic chemistry and industrial synthesis. Byproduct of combustion reactions. | must-have | Combustion byproduct; multi-generation bridge |
| `carbon_monoxide` | Carbon monoxide | CO | compound | oxide | 1 | carbon, oxygen (partial) | iron_oxide reduction, pig_iron chain (Gen 3) | Industrial reducing agent. Key reactant in the iron smelting chain. Players encounter it in Gen 1 and need it again in Gen 3. | must-have | Partial oxidation product; critical for steel chain |
| `ammonia` | Ammonia | NH₃ | compound | inorganic | 1 | nitrogen, hydrogen | nitric_acid (Gen 2 Ostwald chain), nylon chain (Gen 3), urea (Gen 2), industrial nitrogen chemistry | The most chain-critical nitrogen compound. Feeds Gen 2 acid chemistry and Gen 3 polymer synthesis. | must-have | Used across more generations than almost any other compound |
| `methane` | Methane | CH₄ | compound | organic | 1 | carbon, hydrogen | formaldehyde (Gen 2), benzene (Gen 3 cyclotrimerization), organic chemistry opening | Simplest organic molecule. Opens the organic pathway. Combustion teaches energyChange mechanics. | must-have | First organic compound; Gen 3 benzene precursor |
| `hydrogen_chloride` | Hydrogen chloride | HCl | compound | acid | 1 | hydrogen, chlorine | sodium_chloride, acid-base reactions, semiconductor etching (Gen 3) | First acid in the game. Introduces acid-base chemistry. | must-have | Also hydrochloric acid in aqueous form |
| `sodium_chloride` | Sodium chloride | NaCl | compound | salt | 1 | sodium, chlorine | sodium_hydroxide (Gen 2 Chlor-alkali), sodium_carbonate (Solvay), shards | The first salt. Designated first Tier milestone — the discovery that earns a reaction panel entry. | must-have | First tier-unlock substance |
| `iron_oxide` | Iron(III) oxide | Fe₂O₃ | compound | oxide | 1 | iron, oxygen | pig_iron (reduction with CO), shards | Classic redox demonstration. Required to start the iron smelting chain in Gen 3. | must-have | First redox demonstration |
| `hydrogen_sulfide` | Hydrogen sulfide | H₂S | compound | inorganic | 1 | hydrogen, sulfur | sulfur_dioxide (Gen 2), industrial sulfur chemistry | Sulfur carrier compound. The link between Gen 1 sulfur and Gen 2 industrial acid chemistry. | must-have | Bridge: Gen 1 sulfur → Gen 2 acids |
| `nitric_oxide` | Nitric oxide | NO | compound | inorganic | 1 | nitrogen, oxygen | nitrogen_dioxide (Gen 2), nitric_acid (Gen 2 Ostwald chain) | Reactive intermediate. First link in the nitrogen oxide → strong acid chain. | must-have | Required for HNO₃ chain |
| `hydrogen_peroxide` | Hydrogen peroxide | H₂O₂ | compound | oxide | 1 | hydrogen, oxygen | oxidizing reactions, industrial bleaching | Unstable oxidizer. Interesting mechanics candidate — low stabilityFactor. | optional | stabilityFactor: low |
| `ozone` | Ozone | O₃ | compound | oxide | 1 | oxygen | shards, atmospheric lore | Oxygen allotrope. Shard income. No essential reaction chain. | optional | Allotrope; lower priority |

---

### Generation 2 — Industrial Synthesis

*The reactor burns. Matter becomes compounds. The scale is expanding.*

| itemKey | name | formula | type | category | gen | dependsOn | usedFor | designPurpose | priority | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `calcium` | Calcium | Ca | element | alkaline_earth | 2 | — (energy) | calcium_oxide, calcium_carbonate, calcium_hydroxide | Anchors the mineral chain. Required for geological compounds and cement feedstocks that feed Gen 3 glass synthesis. | must-have | isBaseElement: true |
| `magnesium` | Magnesium | Mg | element | alkaline_earth | 2 | — (energy) | magnesium_oxide, magnesium_diboride (Gen 4), lightweight alloy inputs | Alkaline earth metal. Magnesium returns in Gen 4 as the base component of magnesium diboride superconductor — a callback from Gen 2 geology to Gen 4 physics. | must-have | isBaseElement: true; Gen 4 callback via MgB₂ |
| `silicon` | Silicon | Si | element | metalloid | 2 | — (energy) | silicon_dioxide, pure_silicon (Gen 3), doped_silicon (Gen 3) | Anchors both geology (quartz/SiO₂) and modern technology (semiconductors). One of the longest single-element chains in the game, spanning Gen 2–3. | must-have | isBaseElement: true; dual geology/technology role |
| `phosphorus` | Phosphorus | P | element | nonmetal | 2 | — (energy) | phosphoric_acid, doped_silicon (n-type, Gen 3) | Semiconductor dopant and industrial acid feedstock. Its most important downstream role is n-type silicon doping in Gen 3. | must-have | isBaseElement: true; critical for semiconductor doping |
| `potassium` | Potassium | K | element | alkali_metal | 2 | — (energy) | potassium_hydroxide (industrial base), shards | Geological alkali metal. Industrial base chemistry. Lower chain priority in the new design without saltpeter or electrolyte applications. | optional | isBaseElement: true |
| `aluminum` | Aluminum | Al | element | metal | 2 | — (energy) | aluminum_oxide, glass (Gen 3), ybco_superconductor (Gen 4) | Most abundant metal in Earth's crust. Feeds Gen 3 glass synthesis chains and Gen 4 ceramic superconductor chemistry. | must-have | isBaseElement: true |
| `copper` | Copper | Cu | element | transition_metal | 2 | — (energy) | bronze, stainless_steel (Gen 3), ybco_superconductor (Gen 4) | The transition metal that spans Gen 2 alloy chemistry, Gen 3 advanced materials, and Gen 4 superconductor synthesis. Three distinct callbacks. | must-have | isBaseElement: true |
| `tin` | Tin | Sn | element | metal | 2 | — (energy) | bronze | Required for bronze alloy synthesis. | must-have | isBaseElement: true |
| `zinc` | Zinc | Zn | element | transition_metal | 2 | — (energy) | shards, industrial chemistry depth | Industrial metal. Adds Gen 2 metallurgy depth. | optional | isBaseElement: true |
| `gold` | Gold | Au | element | transition_metal | 2 | — (energy) | shards, precision electronics (Gen 3 trace components) | Noble metal. Very high shard value. No critical reaction chain. Pure prestige. | optional | isBaseElement: true; reactivity: very_low; shardValue: high |
| `lithium` | Lithium | Li | element | alkali_metal | 2 | — (energy) | lithium_carbonate (Gen 3), lithium_ion_cell (Gen 3), lithium_deuteride (Gen 5) | Light alkali metal that culminates in Gen 3 battery technology and reappears in Gen 5 thermonuclear fuel. One of the longest callbacks in the game. | must-have | isBaseElement: true; chain spans Gen 2 → Gen 5 |
| `fluorine` | Fluorine | F | element | halogen | 2 | — (energy) | hydrogen_fluoride, silicon etching (Gen 3 semiconductor fab) | Most electronegative element. Required for Gen 3 semiconductor fabrication process. | optional | isBaseElement: true; stabilityFactor: very_low; high reactivity |
| `nickel` | Nickel | Ni | element | transition_metal | 2 | — (energy) | stainless_steel (Gen 3), nickel alloys | Required for stainless steel synthesis in Gen 3. | must-have | isBaseElement: true |
| `sulfur_dioxide` | Sulfur dioxide | SO₂ | compound | oxide | 2 | sulfur, oxygen | sulfur_trioxide, sulfuric_acid (Contact Process) | First step in the sulfuric acid chain. | must-have | Atmospheric chemistry; acid rain lore |
| `sulfur_trioxide` | Sulfur trioxide | SO₃ | compound | oxide | 2 | sulfur_dioxide, oxygen (catalyst) | sulfuric_acid | Intermediate step in the Contact Process for H₂SO₄. | must-have | Pure intermediate; required for H₂SO₄ |
| `sulfuric_acid` | Sulfuric acid | H₂SO₄ | compound | acid | 2 | sulfur_trioxide, water | nitric_acid production, phosphoric_acid, industrial synthesis reactions | "King of chemicals." Major Gen 2 tier milestone. Opens broad industrial chemistry. | must-have | Gen 2 tier milestone; unlocksUserTier |
| `nitrogen_dioxide` | Nitrogen dioxide | NO₂ | compound | inorganic | 2 | nitric_oxide, oxygen | nitric_acid (Ostwald Process step 2) | Intermediate between nitric oxide and nitric acid. | must-have | Ostwald Process step |
| `nitric_acid` | Nitric acid | HNO₃ | compound | acid | 2 | nitrogen_dioxide, water | nylon chain (Gen 3 benzene oxidation), advanced synthesis oxidizer | Second major strong acid. Feeds Gen 3 polymer synthesis. | must-have | Gen 2→3 bridge; strong oxidizer role |
| `phosphoric_acid` | Phosphoric acid | H₃PO₄ | compound | acid | 2 | phosphorus, oxygen, water | phosphate intermediates, doped_silicon (n-type, Gen 3) | Industrial phosphate acid. Its most important downstream role in the new design is feeding the n-type silicon doping chain in Gen 3. | must-have | Critical for semiconductor doping chain |
| `sodium_hydroxide` | Sodium hydroxide | NaOH | compound | base | 2 | sodium, chlorine, water (Chlor-alkali) | acid-base reactions, industrial processing | First strong base. Classic acid-base neutralization chemistry. Chlor-alkali process from NaCl is an interesting three-substance chain. | must-have | Chlor-alkali process |
| `calcium_oxide` | Calcium oxide | CaO | compound | oxide | 2 | calcium, oxygen | calcium_hydroxide, glass (Gen 3) | "Quicklime." Key step in both the slaked-lime and glass synthesis chains. | must-have | High-temperature reaction; glass chain input |
| `calcium_carbonate` | Calcium carbonate | CaCO₃ | compound | carbonate | 2 | calcium, carbon_dioxide | calcium_oxide (decomposition), glass feedstock | Most abundant mineral. Decomposition into CaO is a classic thermal chemistry demonstration. Its downstream is glass synthesis in Gen 3. | must-have | Reversible: CaO + CO₂ |
| `calcium_hydroxide` | Calcium hydroxide | Ca(OH)₂ | compound | base | 2 | calcium_oxide, water | water treatment, industrial base chemistry | "Slaked lime." Important industrial chemistry. | must-have | Classic lime-and-water reaction |
| `silicon_dioxide` | Silicon dioxide | SiO₂ | compound | oxide | 2 | silicon, oxygen | glass (Gen 3), pure_silicon (Gen 3), fused_quartz (Gen 3) | Most abundant compound in Earth's crust. The foundation of both geology and the Gen 3 silicon/technology chain. | must-have | Longest single-chain dependency |
| `sodium_carbonate` | Sodium carbonate | Na₂CO₃ | compound | carbonate | 2 | sodium, carbon_dioxide, ammonia (Solvay Process) | glass (Gen 3) | Industrial alkali. Key input for glass synthesis. The Solvay Process synthesis (NH₃ + CO₂ + NaCl + H₂O) is one of the most satisfying multi-reactant reactions. | must-have | Solvay Process has four reactants |
| `formaldehyde` | Formaldehyde | HCHO | compound | organic | 2 | methane, oxygen (partial oxidation) | polymer resins (Gen 3 optional), industrial reagent | Simplest aldehyde. Industrial polymer feedstock. Previous prebiotic uses (formose reaction, Strecker synthesis) removed. | optional | Bio-era uses removed; polymer resin feedstock |
| `acetic_acid` | Acetic acid | CH₃COOH | compound | organic | 2 | carbon_monoxide, methanol (carbonylation) | industrial solvent, Gen 3 polymer processing | First carboxylic acid. Industrial reagent. Previous pharma and metabolic uses removed. | optional | Pharma chain removed; industrial use only |
| `methanol` | Methanol | CH₃OH | compound | organic | 2 | carbon_monoxide, hydrogen | formaldehyde (oxidation), ethylene (Gen 3, MTO process) | Simplest alcohol. Key intermediate for formaldehyde and as MTO feedstock for ethylene synthesis. | must-have | MTO process: methanol → ethylene (Gen 3) |
| `urea` | Urea | CO(NH₂)₂ | compound | organic | 2 | ammonia, carbon_dioxide | carbon-nitrogen composite materials (Gen 3), industrial nitrogen source | First organic compound synthesized in a laboratory (Wöhler 1828). Historical bridge from inorganic to organic chemistry. In the new design, feeds Gen 3 composite material synthesis. | must-have | Historical significance; Wöhler synthesis lore |
| `bronze` | Bronze | Cu/Sn | alloy | non_ferrous | 2 | copper, tin | Gen 2 alloy milestone, tools lore | First alloy in the game. The "Bronze Age" moment — but framed as reactor synthesis mastery, not historical narrative. Major Gen 2 tier unlock; introduces the `alloy` reaction type. | must-have | Gen 2 alloy milestone; unlocksUserTier |
| `aluminum_oxide` | Aluminum oxide | Al₂O₃ | compound | oxide | 2 | aluminum, oxygen | glass (Gen 3), ybco_superconductor (Gen 4 ceramic base) | Required for glass synthesis and as the ceramic oxide component of the YBCO superconductor chain in Gen 4. | must-have | Gen 4 YBCO input |

---

### Generation 3 — Advanced Materials

*The reactor creates. Compounds become designer matter. The player's first encounter with something that feels engineered, not discovered.*

| itemKey | name | formula | type | category | gen | dependsOn | usedFor | designPurpose | priority | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `titanium` | Titanium | Ti | element | transition_metal | 3 | — (energy, Gen 3 unlock) | titanium_alloy, stainless_steel variants, Gen 4 superconductor components | Lightweight, high-strength metal. Anchors the titanium alloy chain. Reappears in Gen 4 niobium-titanium superconducting alloy. | must-have | isBaseElement: true (Gen 3) |
| `chromium` | Chromium | Cr | element | transition_metal | 3 | — (energy, Gen 3 unlock) | stainless_steel | Required for stainless steel synthesis. The corrosion-resistance element. | must-have | isBaseElement: true (Gen 3) |
| `tungsten` | Tungsten | W | element | transition_metal | 3 | — (energy, Gen 3 unlock) | tungsten_carbide, high-temperature alloys | Highest melting point of any metal. Anchors the tungsten carbide chain. Introduces refractory metals. | must-have | isBaseElement: true (Gen 3); reactivity: very_low |
| `boron` | Boron | B | element | metalloid | 3 | — (energy, Gen 3 unlock) | doped_silicon (p-type), borosilicate_glass, magnesium_diboride (Gen 4) | Dual-use in Gen 3: p-type semiconductor doping and borosilicate glass synthesis. Reappears in Gen 4 superconductor. | must-have | isBaseElement: true (Gen 3) |
| `coke` | Coke | C | compound | organic | 3 | carbon (high-temperature processing) | pig_iron (reducing agent) | High-purity carbon fuel and reducing agent for iron smelting. Step 1 of the steel chain. | must-have | Steel chain start |
| `pig_iron` | Pig iron | Fe/C | alloy | ferrous | 3 | iron_oxide, coke, calcium_oxide | steel | Blast furnace product. High carbon content iron — the intermediate before steel. Three Gen 1/2 inputs converge here. | must-have | Steel chain step 2 |
| `steel` | Steel | Fe/C | alloy | ferrous | 3 | pig_iron, oxygen (basic oxygen process) | stainless_steel, construction, Gen 3 milestone | The industrial milestone substance of Gen 3. Major tier unlock. High shard value. The moment the player produces steel, the reactor feels different. | must-have | Gen 3 tier milestone; unlocksUserTier; high shard value |
| `stainless_steel` | Stainless steel | Fe/Cr/Ni | alloy | ferrous | 3 | steel, chromium, nickel | Gen 3 advanced equipment, Gen 4 chamber materials | Corrosion-resistant high-alloy steel. Requires steel + two additional metals. Multi-metal convergence milestone. | must-have | Multi-metal alloy; high shard value |
| `titanium_alloy` | Titanium alloy | Ti/Al | alloy | non_ferrous | 3 | titanium, aluminum | aerospace structural materials, Gen 4 containment components | Lightweight high-strength alloy. Bridges the titanium chain into advanced structural materials. Required conceptually for Gen 4 reactor containment. | must-have | Ti-6Al-4V simplified to Ti + Al |
| `tungsten_carbide` | Tungsten carbide | WC | compound | ceramic | 3 | tungsten, carbon | extreme-hardness tooling, Gen 4 containment materials | Hardest engineered material in Gen 3. Extreme high-temperature stability. Required for Gen 4 extreme-condition synthesis components. | optional | High shard value; low reactivity |
| `graphene` | Graphene | C | material | synthetic | 3 | carbon (chemical vapor deposition, very high energy) | lithium_ion_cell, carbon_nanotube, Gen 4 extreme-state substrates | Single-atom carbon sheet. "Wonder material." Very high energy cost. The moment the player synthesizes graphene, the reactor's capabilities feel expanded. Gate to battery chain and Gen 4 substrates. | must-have | Milestone discovery; high energyCost |
| `carbon_fiber` | Carbon fiber | C | material | synthetic | 3 | carbon (high-temp carbonization) | advanced structural materials, Gen 4 containment structures | High-strength lightweight structural carbon. The "strength without weight" design identity. Required for Gen 4 extreme-state containment. | must-have | High shard value |
| `fullerene` | Fullerene | C₆₀ | compound | synthetic | 3 | carbon (arc discharge, extreme energy) | carbon_nanotube (synthesis template), shards | Buckminster fullerene. The perfect spherical carbon allotrope. Opens the carbon allotrope family. Satisfying discovery — milestone shard value. | must-have | New in v2; C₆₀ "buckyball" |
| `carbon_nanotube` | Carbon nanotube | CNT | material | synthetic | 3 | fullerene, carbon (catalytic growth) | Gen 4 extreme-state synthesis, advanced composite materials, shards | Cylindrical carbon allotrope with extreme tensile strength and electrical conductivity. High-tier Gen 3 discovery. Opens Gen 4 carbon-based substrate chain. | must-have | New in v2 |
| `benzene` | Benzene | C₆H₆ | compound | organic | 3 | methane (cyclotrimerization, high energy) | nylon (polyamide synthesis) | Aromatic hub compound. Feeds the Gen 3 polymer synthesis chain through to nylon. Introduces aromatic chemistry as a distinct reaction mode. | must-have | Primary use: nylon chain; pharma chain removed |
| `ethylene` | Ethylene | C₂H₄ | compound | organic | 3 | methanol (MTO — methanol-to-olefins process) | polyethylene | Simplest alkene. The monomer that opens the synthetic polymer chain. First step toward polyethylene. | must-have | MTO process from Gen 2 methanol |
| `polyethylene` | Polyethylene | (C₂H₄)ₙ | polymer | synthetic | 3 | ethylene (polymerization) | Gen 3 materials milestone, synthetic polymer class anchor | First synthetic polymer. Major Gen 3 milestone. High shard value. | must-have | Gen 3 polymer milestone; high shard value |
| `nylon` | Nylon | — | polymer | synthetic | 3 | benzene, ammonia (polyamide synthesis) | Gen 3 high-performance polymer milestone, shards | First high-performance polymer. Converges the aromatic chemistry chain with the nitrogen chain. A substance nature does not produce — the reactor makes it. | must-have | Polyamide chain; adipic_acid intermediate collapsed per design principles |
| `pure_silicon` | Pure silicon | Si | material | synthetic | 3 | silicon_dioxide, coke (carbothermal reduction) | doped_silicon | Refined silicon from SiO₂. The starting point of the semiconductor chain. | must-have | Semiconductor chain step 1 |
| `doped_silicon` | Doped silicon | Si+P/B | material | synthetic | 3 | pure_silicon, phosphorus (n-type) OR pure_silicon, boron (p-type) | lithium_ion_cell, Gen 3 electronics milestone | The foundation of all modern electronics. Two variants (n-type and p-type) for different applications. Converges silicon, boron, and phosphorus chains. | must-have | Gen 3 electronics milestone; high shard value |
| `glass` | Glass | SiO₂/Na₂CO₃/CaO | compound | material | 3 | silicon_dioxide, sodium_carbonate, calcium_oxide | borosilicate_glass, optical components | Classic multi-reactant material synthesis. Three Gen 2 compounds produce one Gen 3 material. First "multi-substrate" convergence reaction. | must-have | Three Gen 2 inputs; satisfying convergence |
| `borosilicate_glass` | Borosilicate glass | SiO₂/B₂O₃ | compound | material | 3 | glass, boron | Gen 4 plasma containment vessels, precision laboratory components | Heat-resistant glass. Adds boron to standard glass for extreme temperature tolerance. Required for Gen 4 plasma chamber components. | must-have | New in v2; Pyrex-family glass |
| `fused_quartz` | Fused quartz | SiO₂ | material | synthetic | 3 | silicon_dioxide (extreme purification, very high energy) | Gen 4 optics, extreme-temperature materials | Ultra-pure silicon dioxide in vitreous form. Highest purity optical material in Gen 3. Required for Gen 4 precision synthesis. | optional | New in v2; high energyCost; niche discovery |
| `lithium_carbonate` | Lithium carbonate | Li₂CO₃ | compound | carbonate | 3 | lithium, carbon_dioxide, water | lithium_ion_cell | Intermediate in the lithium battery chain. | must-have | Battery chain intermediate |
| `lithium_ion_cell` | Lithium-ion cell | — | material | synthetic | 3 | lithium_carbonate, doped_silicon, graphene | Gen 3 energy storage milestone, advanced energy systems | Advanced energy storage. Converges the battery chain, semiconductor chain, and graphene chain — three separate Gen 3 threads meeting at one synthesis. | must-have | Three-chain convergence; Gen 3 energy milestone; high shard value |

---

### Generation 4 — Extreme States

*The reactor reaches. Physics bends. The player is operating a machine approaching the edge of what matter can be.*

| itemKey | name | formula | type | category | gen | dependsOn | usedFor | designPurpose | priority | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `uranium` | Uranium | U | element | actinide | 4 | — (energy, Gen 4 unlock) | uranium_oxide, nuclear_fuel_pellet | Radioactive heavy element. Opens the nuclear chemistry chain. The reactor's first encounter with radioactive material — a threshold moment. | must-have | isBaseElement: true (Gen 4); radioactive: true |
| `yttrium` | Yttrium | Y | element | transition_metal | 4 | — (energy, Gen 4 unlock) | ybco_superconductor | Rare earth metal required for the YBCO ceramic superconductor. Its sole role is the superconductor chain — but that chain is a major Gen 4 milestone. | must-have | isBaseElement: true (Gen 4) |
| `hydrogen_plasma` | Hydrogen plasma | H⁺ | exotic | plasma | 4 | hydrogen, nuclear_fuel_pellet (extreme energy) | reactive_plasma_core | Hydrogen stripped of electrons at extreme temperatures. The first plasma-state substance. Introduces the `plasma_synthesis` reaction type. The reactor begins to feel alive. | must-have | New in v2; first plasma_synthesis reaction; conditions: extreme_temperature |
| `reactive_plasma_core` | Reactive plasma core | — | exotic | plasma | 4 | hydrogen_plasma, carbon, nitrogen (multi-element plasma) | Gen 4 tier gate, stellar_core_fragment (Gen 5), plasma synthesis inputs | Multi-element reactive plasma sustained in the reactor. **Gen 4 tier milestone.** The reactor's visual changes when this is first created. Automation thematic trigger: the reactor maintaining plasma is the equivalent of a self-sustaining system. | must-have | Gen 4 tier milestone; unlocksUserTier; conditions: plasma_confinement |
| `diamond_synthetic` | Synthetic diamond | C | material | synthetic | 4 | carbon, graphene (extreme pressure synthesis) | precision cutting tools, Gen 5 extreme-state substrates | Synthetic diamond grown under extreme reactor pressure. Demonstrates pressure as a new synthesis axis. The hardest natural material, now reactor-synthesized on demand. | must-have | New in v2; conditions: extreme_pressure |
| `metallic_hydrogen` | Metallic hydrogen | H (metallic) | exotic | dense_state | 4 | hydrogen, reactive_plasma_core (extreme pressure) | Gen 5 fusion amplification, quantum state inputs | Hydrogen under extreme pressure where it behaves as a metal. Exists inside gas giant cores. The reactor is simulating a Jupiter interior. Major Gen 4 exotic state milestone. | must-have | New in v2; conditions: extreme_pressure; stabilityFactor: very_low |
| `ybco_superconductor` | YBCO superconductor | YBa₂Cu₃O₇ | compound | superconductor | 4 | yttrium, copper, aluminum_oxide, oxygen | Gen 4 superconductor milestone, Gen 5 magnetic containment systems | First high-temperature superconductor. Converges yttrium (Gen 4), copper (Gen 2), and aluminum oxide (Gen 2) — three chains at a T-junction. Its discovery is a materials science landmark. | must-have | New in v2; four-chain convergence; conditions: extreme_cold |
| `magnesium_diboride` | Magnesium diboride | MgB₂ | compound | superconductor | 4 | magnesium, boron | Gen 4 superconductor depth, alternative magnetic field applications | Simple-composition superconductor. Magnesium from Gen 2 + boron from Gen 3 — a cross-generation callback that arrives in Gen 4 physics. Demonstrates that two paths lead to superconductivity. | optional | New in v2; magnesium callback from Gen 2 |
| `niobium_titanium_alloy` | Niobium-titanium alloy | NbTi | alloy | superconductor | 4 | titanium, iron (simplified NbTi) | Gen 4 magnetic field coils, Gen 5 BEC containment systems | Low-temperature superconducting alloy used in magnetic confinement. Alternative superconductor track alongside YBCO. | optional | New in v2; simplified from real Nb-Ti |
| `uranium_oxide` | Uranium oxide | UO₂ | compound | oxide | 4 | uranium, oxygen | nuclear_fuel_pellet | First uranium compound. Intermediate in nuclear fuel production. | must-have | Nuclear chain intermediate; radioactive: true |
| `nuclear_fuel_pellet` | Nuclear fuel pellet | UO₂ | material | synthetic | 4 | uranium_oxide (enrichment, extreme energy) | hydrogen_plasma, positron production (Gen 5), liquid_helium cooling (Gen 5), fusion inputs | **Gen 4 energy milestone.** Very high positive energyChange. The gate substance between extreme chemistry and cosmic alchemy. Required as an energy input for multiple Gen 5 reactions. | must-have | Gen 4 energy milestone; gate to Gen 5 reactions |
| `hydrazine` | Hydrazine | N₂H₄ | compound | inorganic | 4 | ammonia, oxygen (controlled oxidation) | Gen 4 plasma reaction oxidizer, high-energy synthesis inputs | High-energy compound. Low stabilityFactor — demonstrates the volatility mechanic under Gen 4 extreme conditions. | optional | reactivity: high; stabilityFactor: low |
| `rhenium_superalloy` | Rhenium superalloy | Re/Ni | alloy | exotic | 4 | nickel, iron (rhenium abstracted into alloy) | Gen 4 extreme-temperature structural materials, Gen 5 containment | High-temperature superalloy stable under Gen 4 plasma conditions. Used in Gen 5 extreme synthesis chamber components. | optional | New in v2; extreme thermal stability |

---

### Generation 5 — Cosmic Alchemy

*The reactor transcends. The impossible becomes synthesis. You are operating something that should not exist.*

| itemKey | name | formula | type | category | gen | dependsOn | usedFor | designPurpose | priority | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `deuterium` | Deuterium | ²H | exotic | nonmetal | 5 | hydrogen (isotope separation, extreme energy) | tritium, fusion_plasma, lithium_deuteride | Heavy hydrogen isotope. First reactant in the fusion chain. Enormous energy cost — separating isotopes requires the full force of the Gen 4 reactor. | must-have | Fusion chain start; isotope mechanics introduction |
| `tritium` | Tritium | ³H | exotic | nonmetal | 5 | deuterium (neutron bombardment, nuclear_fuel_pellet energy) | fusion_plasma, lithium_deuteride | Radioactive heavy hydrogen. Combined with deuterium for maximum fusion yield. | must-have | radioactive: true; requires nuclear_fuel_pellet energy |
| `helium_3` | Helium-3 | ³He | exotic | noble_gas | 5 | fusion_plasma (byproduct) | bose_einstein_condensate (cryogenic medium), advanced fusion concepts | Rare helium isotope produced as a natural byproduct of D-T fusion. Dual role: fusion byproduct + cryogenic medium for BEC. | must-have | Fusion byproduct; dual role in BEC chain |
| `fusion_plasma` | Fusion plasma | — | exotic | plasma | 5 | deuterium, tritium (fusion, extreme energy + conditions) | helium_3 (byproduct), antiproton, quantum_foam_lattice, Gen 5 energy breakthrough | Controlled fusion product. Enormously positive energyChange. **Gen 5 energy milestone.** The reactor is producing miniature stars. Changes the energy economy. | must-have | Gen 5 energy milestone; unlocksUserTier; conditions: plasma_confinement, extreme_temperature |
| `liquid_helium` | Liquid helium | He(l) | exotic | noble_gas | 5 | helium (cryogenic cooling, nuclear_fuel_pellet energy) | bose_einstein_condensate (cryogenic medium) | Ultra-cold liquid state of helium. Helium has existed in the player's inventory since Gen 1 as a noble gas with no reactions. Now its purpose is revealed: the cryogenic medium for BEC. The callback should feel earned. | must-have | Helium returns from Gen 1; major callback moment |
| `bose_einstein_condensate` | Bose-Einstein condensate | BEC | exotic | quantum_condensate | 5 | liquid_helium, helium_3 (extreme cold conditions) | prima_materia (Gen 6), dark_matter_crystal (Gen 6), Gen 6 quantum substrate | Ultra-cold quantum state where all atoms occupy the same ground state. Requires convergence of the cryogenic chain and the fusion byproduct chain. A Gen 5 physics landmark. | must-have | Moved to Gen 5 from old Gen 6; conditions: extreme_cold |
| `positron` | Positron | e⁺ | exotic | antimatter | 5 | nuclear_fuel_pellet (pair production, extreme energy) | antihydrogen | Antimatter electron. First antimatter particle. Pair production from nuclear energy — the reactor reaches into particle physics. | must-have | Antimatter chain start; pair production concept |
| `antiproton` | Antiproton | p̄ | exotic | antimatter | 5 | fusion_plasma (particle accelerator simulation, extreme energy) | antihydrogen | Antimatter proton. Requires the full energy output of fusion plasma to produce via particle collision simulation. | must-have | Antimatter chain step 2 |
| `antihydrogen` | Antihydrogen | H̄ | exotic | antimatter | 5 | positron, antiproton | aether (Gen 6), prima_materia (Gen 6), matter-antimatter annihilation | Complete antimatter atom. The antimatter chain culmination. Matter-antimatter annihilation produces the highest energyChange event available in Gen 5. Landmark synthesis moment. | must-have | Gen 5 antimatter milestone; highest Gen 5 shard tier |
| `lithium_deuteride` | Lithium deuteride | LiD | compound | inorganic | 5 | lithium, deuterium | stellar_core_fragment (fusion amplification input) | Thermonuclear fuel compound. Lithium from Gen 2 meets deuterium from Gen 5 — a cross-generation convergence spanning three generations. Amplifies fusion reactions for extreme-state synthesis. | optional | Gen 5 fusion depth; lithium callback from Gen 2 |
| `stellar_core_fragment` | Stellar Core Fragment | — | exotic | degenerate_matter | 5 | nuclear_fuel_pellet, reactive_plasma_core, fusion_plasma (neutron degeneracy conditions) | event_horizon_condensate, neutron_glass (Gen 6), philosophers_stone (Gen 6) | **Gen 5 iconic anchor #1.** A stabilized pellet of neutron-degenerate matter synthesized under conditions that replicate the interior of a dying star. Neutron degeneracy pressure is real physics — extended to a reactor context. The player is holding something that only exists inside neutron stars. Very high shard value. Low yield. Its discovery should be a moment the player pauses. | must-have | New in v2; Gen 5 degenerate matter milestone; low yield: 1 unit; conditions: extreme_pressure + extreme_temperature + plasma_confinement |
| `event_horizon_condensate` | Event Horizon Condensate | — | exotic | extreme_gravity | 5 | stellar_core_fragment, quantum_foam_lattice (extreme spacetime curvature simulation) | prima_materia (Gen 6), chrono_dust (Gen 6) | **Gen 5 iconic anchor #2.** A stable condensate of matter that has passed through extreme spacetime curvature — gravitationally collapsed matter held in suspension by the reactor's containment field. The reactor is simulating conditions at an event horizon. **Gen 5 final tier gate.** Its visual when synthesized should be unforgettable. | must-have | New in v2; Gen 5 final tier gate; unlocksUserTier; requires stellar_core_fragment as reactant; low yield: 1 unit |
| `strange_quark_condensate` | Strange quark condensate | SQM | exotic | quark_matter | 5 | fusion_plasma (extreme pressure, strange quark production) | dark_matter_proxy | Hypothetical stable form of matter composed of strange quarks. Parallel chain to the antimatter synthesis track. Demonstrates that Gen 5 has two major exotic branches. | must-have | Moved to Gen 5 from old Gen 6; conditions: extreme_pressure + quark_confinement |
| `dark_matter_proxy` | Dark matter proxy | DM~ | exotic | exotic | 5 | bose_einstein_condensate, strange_quark_condensate (quantum resonance) | dark_matter_crystal (Gen 6), philosophers_stone (Gen 6) | Exotic particle formed at the intersection of quantum cold matter and strange quark condensate. Not dark matter itself — a proxy that resonates with it. Requires convergence of two parallel Gen 5 exotic chains. | must-have | Moved to Gen 5 from old Gen 6; convergence: BEC + strange_quark_condensate |
| `quantum_foam_lattice` | Quantum foam lattice | QFL | exotic | exotic | 5 | fusion_plasma, metallic_hydrogen (quantum vacuum conditions) | event_horizon_condensate, prima_materia (Gen 6), void_crystal (Gen 6) | A lattice structure that captures quantum vacuum fluctuations under extreme conditions. At the threshold between particle physics and geometry. Feeds the event horizon condensate and multiple Gen 6 reactions. | must-have | New in v2; conditions: extreme_pressure + plasma_confinement |

---

### Generation 6 — Reality Manipulation

*The reactor becomes. Myth is made real. These substances have names from alchemy and metaphysics — not because the game is fantasy, but because no other language exists for what they are.*

**Gen 6 rules enforced on every row:**
- Maximum 8–10 substances total (this table has 8)
- All reactions `discoveredByDefault: false`
- Low yield: 1 unit per synthesis — no mass production, no automation loops
- Every substance: mythic name (historical resonance) + scientific adjacency + Gen 5 chain convergence requirement

| itemKey | name | formula | type | category | gen | dependsOn | usedFor | designPurpose | priority | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `prima_materia` | Prima Materia | — | mythic | mythic | 6 | event_horizon_condensate, antihydrogen, quantum_foam_lattice (three-chain Gen 5 convergence) | philosophers_stone, aether, neutron_glass, void_crystal, dark_matter_crystal (base input for all Gen 6 reactions) | The "first matter." The substrate from which all Gen 6 substances emerge. Its synthesis is the moment the reactor crosses from cosmic alchemy into reality manipulation. Base input for most Gen 6 reactions. | must-have | Scientific adjacency: quantum vacuum, zero-point field; Rule 1: "prima materia" from classical alchemy |
| `philosophers_stone` | Philosopher's Stone | — | mythic | mythic | 6 | prima_materia, dark_matter_proxy, stellar_core_fragment (Gen 5/6 convergence) | transmutation_mythic (reaction type unlock), chrono_dust, shards | **The Gen 6 apex catalyst.** Producing the Philosopher's Stone unlocks the `transmutation_mythic` reaction type, allowing certain Gen 1–3 substances to be transmuted directly into higher-tier outputs. The one Gen 6 substance with an active mechanical effect beyond shards. | must-have | Scientific adjacency: catalytic transmutation, autocatalysis; unlocks `transmutation_mythic`; Rule 7 |
| `aether` | Aether | — | mythic | mythic | 6 | prima_materia, antihydrogen, bose_einstein_condensate | false_vacuum_seed, shards | A medium that propagates things which have no propagation medium in normal physics. The "fifth element" of classical philosophy — synthesized at the intersection of antimatter and quantum cold matter. | must-have | Scientific adjacency: Higgs field, dark energy; Rule 1: "aether" from Aristotelian physics |
| `neutron_glass` | Neutron Glass | — | mythic | mythic | 6 | prima_materia, stellar_core_fragment (degenerate matter crystallization) | false_vacuum_seed, shards | A crystalline form of neutron matter held stable outside its origin — a substance that only exists in neutron star crusts, now crystallized in the reactor. | must-have | Scientific adjacency: neutron star crust crystallography; Rule 1: from condensed matter physics speculation |
| `void_crystal` | Void Crystal | — | mythic | mythic | 6 | prima_materia, quantum_foam_lattice (crystallized vacuum energy) | false_vacuum_seed, dark_matter_crystal, shards | A crystallized unit of vacuum energy — matter made from nothing. The Casimir effect produces real measurable forces from vacuum fluctuations. Void Crystal extends this to a stable crystalline structure. | must-have | Scientific adjacency: Casimir effect, vacuum energy; Rule 1: "void" from Epicurean atomism |
| `false_vacuum_seed` | False Vacuum Seed | — | mythic | mythic | 6 | aether, neutron_glass, void_crystal (three Gen 6 substances converge) | dark_matter_crystal (catalyst), shards, lore endpoint | A seed that could theoretically trigger a quantum phase transition in the local vacuum — rewriting the laws of physics within its radius. Requires three Gen 6 chains to converge. The most dangerous substance in the game to contemplate. | must-have | Scientific adjacency: quantum phase transition, vacuum metastability; Rule 3: three Gen 6 convergences; Rule 8: very long synthesis time |
| `chrono_dust` | Chrono Dust | — | mythic | mythic | 6 | philosophers_stone, event_horizon_condensate (time dilation synthesis) | shards, lore integration | Matter whose internal clock runs at a different rate than normal spacetime. Time dilation near extreme gravitational gradients is real physics — Chrono Dust is what happens when the reactor captures that effect in crystalline form. | must-have | Scientific adjacency: time dilation, exotic particle decay rates; Rule 1: "chrono" from horology + particle physics |
| `dark_matter_crystal` | Dark Matter Crystal | DM◈ | mythic | mythic | 6 | prima_materia, dark_matter_proxy, void_crystal (crystallized dark matter) | Supreme shard substance; endgame | **The final prestige substance.** Crystallized dark matter — the substance that makes up most of the universe, now held in inventory. Its shard value is worth more than a complete Gen 1–4 run. Producing it should feel like an achievement the player wants to tell someone about. | must-have | Scientific adjacency: dark matter particle physics; maximum shardValue; low yield: 1 unit; Rule 4 strictly enforced |

---

## Universe Statistics

| Generation | Elements | Compounds / Materials / Other | Total |
|---|---|---|---|
| Gen 1 — Fundamental Matter | 10 | 12 | **22** |
| Gen 2 — Industrial Synthesis | 13 | 18 | **31** |
| Gen 3 — Advanced Materials | 4 | 21 | **25** |
| Gen 4 — Extreme States | 2 | 11 | **13** |
| Gen 5 — Cosmic Alchemy | 0 | 15 | **15** |
| Gen 6 — Reality Manipulation | 0 | 8 | **8** |
| **Total** | **29** | **85** | **114** |

**Priority breakdown (approximate):**
- `must-have`: ~95 substances (~83%)
- `optional`: ~19 substances (~17%)
- `later`: 0 substances (vacuum_energy_lattice placeholder removed; false_vacuum_seed now must-have in Gen 6)

**Net change from v1.0:** 135 → 114 substances. 21 fewer total, but the universe is significantly more focused. All 36 biology/civilization substances removed; ~15 new substances added across Gen 3–6.

---

## Key Dependency Chains

Critical chains that span multiple generations. Every link must be authored before downstream content can exist.

```
STEEL CHAIN (Gen 1 → 3)
iron → iron_oxide → [coke as reducing agent] → pig_iron → steel → stainless_steel
                                                               ↑
                                                       chromium + nickel

POLYMER CHAIN (Gen 2 → 3)
methanol → [MTO process] → ethylene → polyethylene
methane → benzene ──────────────────→ nylon (+ ammonia)

ADVANCED CARBON CHAIN (Gen 1 → 3)
carbon ──→ graphene → carbon_nanotube (+ fullerene)
       ──→ carbon_fiber
       ──→ fullerene (C₆₀)

SEMICONDUCTOR CHAIN (Gen 2 → 3)
silicon → silicon_dioxide → pure_silicon → doped_silicon → lithium_ion_cell
                                ↑                ↑                ↑
                              coke        boron/phosphorus     graphene

NUCLEAR CHAIN (Gen 1 → 4)
uranium → uranium_oxide → nuclear_fuel_pellet → hydrogen_plasma → reactive_plasma_core

GLASS CHAIN (Gen 2 → 3)
silicon_dioxide ─────────────────────┐
sodium_carbonate (Solvay) ───────────┼→ glass → borosilicate_glass (+ boron)
calcium_oxide ───────────────────────┘

FUSION CHAIN (Gen 1 → 5)
hydrogen → deuterium ─────┐
                           ├→ fusion_plasma → helium_3 ──┐
         tritium ──────────┘                              │
helium (Gen 1) ──→ liquid_helium ───────────────────────┤
                                                          └→ bose_einstein_condensate

ANTIMATTER CHAIN (Gen 4 → 5)
nuclear_fuel_pellet → positron ──┐
fusion_plasma → antiproton ──────┴→ antihydrogen

STELLAR CHAIN (Gen 4 → 5)
nuclear_fuel_pellet ──┐
reactive_plasma_core ─┼→ stellar_core_fragment → event_horizon_condensate (+ quantum_foam_lattice)
fusion_plasma ─────────┘

DARK MATTER CHAIN (Gen 5)
bose_einstein_condensate ────┐
                              ├→ dark_matter_proxy (Gen 5)
strange_quark_condensate ────┘

MYTHIC CHAIN (Gen 5 → 6)
event_horizon_condensate ──┐
antihydrogen ───────────────┼→ prima_materia → philosophers_stone (+ dark_matter_proxy + stellar_core_fragment)
quantum_foam_lattice ───────┘               → aether (+ antihydrogen + BEC)
                                            → neutron_glass (+ stellar_core_fragment)
                                            → void_crystal (+ quantum_foam_lattice)
                                            → dark_matter_crystal (+ dark_matter_proxy + void_crystal)

aether + neutron_glass + void_crystal → false_vacuum_seed
philosophers_stone + event_horizon_condensate → chrono_dust
```

---

## Cross-Generation Callback Substances

Substances that appear early but have their most important use in a later generation. Do not cut these based on their early-generation importance alone.

| Substance | Early Role | Late Role |
|---|---|---|
| `helium` | Gen 1 inert element, shards only | Gen 5 cryogenic chain; liquid helium required for BEC |
| `iron` | Gen 1 base element | Gen 3 pig iron → steel milestone |
| `carbon` | Gen 1 base element | Gen 3 graphene, carbon fiber, fullerene, carbon nanotube family |
| `silicon` | Gen 2 metalloid element | Gen 3 full semiconductor chain |
| `lithium` | Gen 2 alkali metal | Gen 3 battery chain (lithium-ion cell); Gen 5 lithium deuteride |
| `copper` | Gen 2 transition metal | Gen 3 stainless steel; Gen 4 YBCO superconductor |
| `magnesium` | Gen 2 alkaline earth | Gen 4 magnesium diboride superconductor |
| `boron` | Gen 3 metalloid element | Gen 3 doped silicon + borosilicate glass; Gen 4 magnesium diboride |
| `carbon_monoxide` | Gen 1 industrial gas | Gen 3 coke/pig iron reduction chain |
| `ammonia` | Gen 1 compound | Gen 2 nitric acid (Ostwald chain); Gen 3 nylon chain |
| `aluminum_oxide` | Gen 2 compound | Gen 4 YBCO superconductor ceramic base |
| `nuclear_fuel_pellet` | Gen 4 energy milestone | Gen 5 positron production (pair production); Gen 5 liquid helium cooling |
| `reactive_plasma_core` | Gen 4 tier milestone | Gen 5 stellar core fragment synthesis |
| `graphene` | Gen 3 advanced carbon | Gen 3 lithium-ion cell; Gen 4 extreme-state substrate |
| `stellar_core_fragment` | Gen 5 iconic anchor #1 | Gen 6 neutron glass; Gen 6 philosopher's stone |
| `event_horizon_condensate` | Gen 5 final tier gate | Gen 6 prima materia; Gen 6 chrono dust |
| `dark_matter_proxy` | Gen 5 exotic convergence | Gen 6 dark matter crystal; Gen 6 philosopher's stone |

**Callbacks removed from v1.0:**
- `iron → hemoglobin (Gen 4)` — biology removed
- `magnesium → chlorophyll (Gen 4)` — biology removed
- `sulfur → cysteine (Gen 3)` — prebiotic chemistry removed
- `phosphoric_acid → DNA/RNA/ATP` — biology removed
- `ammonia → amino acid synthesis` — biology removed
- `glucose → glycolysis / ethanol (fermentation)` — biology removed; ethanol removed entirely

---

*End of Substance Universe v2.0*  
*Next step: Reaction Universe master list — same approach (full universe before balance)*
