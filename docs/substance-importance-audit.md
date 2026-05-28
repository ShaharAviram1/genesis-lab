# Genesis Lab — Substance Importance Audit
**Version:** 1.0  
**Auditing:** substance-universe.md v2.0 (114 substances)  
**Status:** Design audit — read-only. Do not edit substance-universe.md until this audit is resolved.  
**Tone:** Direct. Critical. Game-design focused. Boring substances are not protected by realism.

---

## 1. Executive Summary

substance-universe.md v2.0 is significantly stronger than v1.0. The biology removal was correct. The Gen 4–6 content is genuinely good. The cosmic alchemy arc has real design integrity.

The problem is Gen 1 and Gen 2.

They still read like a chemistry textbook that has been slightly edited. You have invisible intermediates that no player will care about: sulfur trioxide, nitrogen dioxide, hydrogen sulfide, calcium carbonate, phosphoric acid. These substances exist because the real-world synthesis chain passes through them. That is not a good reason. The reactor does not care about the Contact Process. The reactor synthesizes what the player cares about.

The fix is not just deletion. It is a conceptual shift in how multi-step chains are modeled. Collapsing three-step acid chains into multi-reactant single-step syntheses is **strictly better design** — more inputs converging means a bigger T-junction synthesis moment, which is the emotional heart of the discovery system.

Gen 3 is mostly strong. A handful of items exist for realism or as placeholders for conceptual "Gen 4 containment" that doesn't actually name a downstream substance.

Gen 4 has superconductor bloat. Three superconductor tracks in one generation is encyclopedic. Pick one milestone.

Gen 5–6 are strong. Be conservative there.

**The goal:** Cut from 114 to a target of **82–90 standalone substances** after this audit is resolved. The removed substances don't disappear from the game — they become reaction inputs or condition requirements inside the reactions that matter.

---

## 2. Recommended Target Count

| Generation | Current | Target range | Notes |
|---|---|---|---|
| Gen 1 | 22 | 15–17 | Collapse 3 invisible intermediates; cut 2 dead-weight nobles |
| Gen 2 | 31 | 20–23 | Collapse 5 intermediates; cut 5 dead-end substances |
| Gen 3 | 25 | 20–22 | Tighten polymer chain; cut 2 placeholder materials |
| Gen 4 | 13 | 8–10 | Cut superconductor bloat; collapse nuclear intermediate |
| Gen 5 | 15 | 14–15 | Strong; leave mostly intact |
| Gen 6 | 8 | 8 | Do not touch |
| **Total** | **114** | **85–92** | Target: ~88 |

---

## 3. Full Audit Table

Verdict key:
- **KEEP** — stays as a standalone inventory substance
- **MERGE** — remove as a standalone item; absorb into adjacent reactions as an input or reaction mechanism
- **REMOVE** — cut entirely
- **MAYBE** — needs design discussion; borderline

---

### Generation 1 — Fundamental Matter

| # | itemKey | name | verdict | reason | suggested action |
|---|---|---|---|---|---|
| 1 | `hydrogen` | Hydrogen | **KEEP** | Most chain-critical element. Feeds everything including Gen 5 fusion chain. | — |
| 2 | `helium` | Helium | **KEEP** | Zero reactions until Gen 5 — then it becomes the BEC cryogenic input. The callback is one of the best moments in the game's design. | — |
| 3 | `carbon` | Carbon | **KEEP** | Feeds methane, CO, CO₂, coke, graphene, carbon fiber, fullerene. Most widely connected element. | — |
| 4 | `nitrogen` | Nitrogen | **KEEP** | Gates ammonia → nitric acid and nylon chain. Nitrogen chemistry is real and important. | — |
| 5 | `oxygen` | Oxygen | **KEEP** | Universal oxidizer. Every generation. Non-negotiable. | — |
| 6 | `sodium` | Sodium | **KEEP** | Gates NaCl (first milestone) and the Solvay process chain. | — |
| 7 | `chlorine` | Chlorine | **KEEP** | Required for NaCl synthesis directly. If HCl is collapsed, chlorine still participates in NaCl. | Keep chlorine; collapse HCl into NaCl synthesis |
| 8 | `iron` | Iron | **KEEP** | Steel chain anchor spanning Gen 1 → Gen 3. The most emotionally satisfying callback in the early game. | — |
| 9 | `sulfur` | Sulfur | **KEEP** | The gateway to sulfuric acid. Sulfur → H₂SO₄ needs to exist; sulfur stays. | Keep sulfur; collapse the intermediates |
| 10 | `argon` | Argon | **REMOVE** | Noble gas with zero callbacks and zero chains. Helium earns its place through Gen 5. Argon just generates shard income. Two inert elements with identical gameplay and only one having a purpose is one too many. | Cut entirely |
| 11 | `water` | Water | **KEEP** | First discovery. Universal. The most satisfying moment in Gen 1. | — |
| 12 | `carbon_dioxide` | Carbon dioxide | **KEEP** | Feeds Solvay process (sodium_carbonate) and lithium_carbonate. Combustion byproduct concept. Multi-generation. | — |
| 13 | `carbon_monoxide` | Carbon monoxide | **KEEP** | Required for iron oxide reduction in the steel chain. The "partial oxidation of carbon" is a real concept with a satisfying identity — toxic and invisible yet essential. | — |
| 14 | `ammonia` | Ammonia | **KEEP** | Feeds nitric acid AND nylon. Two major downstream uses across two generations. One of the most important compounds in the game. | — |
| 15 | `methane` | Methane | **KEEP** | First organic. Feeds benzene (high-energy cyclotrimerization) and opens the organic pathway. | — |
| 16 | `hydrogen_chloride` | Hydrogen chloride | **MERGE** | Listed as the "first acid" but the game's milestone acids are H₂SO₄ and HNO₃. HCl is a bridge compound that the player discovers and immediately steps over. NaCl can be synthesized sodium + chlorine directly. HCl's semiconductor etching role can be absorbed into the doped silicon reaction conditions. | Collapse into NaCl synthesis and semiconductor etching; remove as standalone |
| 17 | `sodium_chloride` | Sodium chloride | **KEEP** | First tier milestone. The discovery that earns the first reaction panel entry. | — |
| 18 | `iron_oxide` | Iron oxide | **KEEP** | First redox demonstration. Required for the steel chain. The "rust to steel" narrative arc starts here. | — |
| 19 | `hydrogen_sulfide` | Hydrogen sulfide | **MERGE** | Exists only as a one-step bridge between sulfur and sulfur_dioxide. With the acid chain collapsed (sulfur + O₂ + H₂O → H₂SO₄), H₂S becomes doubly invisible — it fed a substance that is itself being collapsed. Zero gameplay identity. | Collapse; sulfur participates in H₂SO₄ synthesis directly |
| 20 | `nitric_oxide` | Nitric oxide | **MERGE** | Invisible step in the NO → NO₂ → HNO₃ chain. Its primary real-world identity is biological (vasodilation, neurotransmission) — which we explicitly removed. As a reactor substance, it has no emotional weight. The player wants nitric acid. | Collapse; nitrogen + oxygen + water → HNO₃ directly |
| 21 | `hydrogen_peroxide` | Hydrogen peroxide | **MAYBE** | Unstable oxidizer with interesting mechanics potential (low stabilityFactor, possible decay). No critical chain dependency. Keep if the instability/decay mechanic is implemented as a real gameplay system; remove if H₂O₂ just sits in inventory doing nothing. | Decide based on whether instability mechanics are built |
| 22 | `ozone` | Ozone | **REMOVE** | Oxygen allotrope. Shard income. No chain. No callback. No identity. Exists because ozone exists in real chemistry. That is not a reason. | Cut entirely |

**Gen 1 summary:** Cut 4 (argon, ozone, hydrogen_chloride→MERGE, nitric_oxide→MERGE, hydrogen_sulfide→MERGE). That's 2 removes + 3 merges. Target: 15–17 substances.

---

### Generation 2 — Industrial Synthesis

| # | itemKey | name | verdict | reason | suggested action |
|---|---|---|---|---|---|
| 23 | `calcium` | Calcium | **KEEP** | Required for glass synthesis (3-input convergence). Calcium earns its place as the mineral-chain anchor. | — |
| 24 | `magnesium` | Magnesium | **KEEP** | Gen 4 callback via MgB₂ superconductor. Without this callback, magnesium's identity is thin — with it, magnesium is a cross-generation narrative. | — |
| 25 | `silicon` | Silicon | **KEEP** | Full semiconductor chain from Gen 2 → Gen 3. One of the longest single-element chains in the game. | — |
| 26 | `phosphorus` | Phosphorus | **KEEP** | n-type silicon dopant. With phosphoric_acid collapsed (see below), phosphorus feeds doped_silicon directly. Keep phosphorus; remove its intermediate. | Keep element; collapse phosphoric_acid |
| 27 | `potassium` | Potassium | **REMOVE** | Without saltpeter or electrolyte chains, potassium has no critical uses. "Potassium hydroxide" is not a milestone anyone cares about. Optional with no emotional identity. A major element reduced to shard income. | Cut entirely |
| 28 | `aluminum` | Aluminum | **KEEP** | Feeds aluminum_oxide → glass AND YBCO superconductor. Two major downstream uses across two generations. | — |
| 29 | `copper` | Copper | **KEEP** | Three callbacks: Gen 2 bronze → Gen 3 stainless steel → Gen 4 YBCO. The most cross-generationally useful metal in the game. | — |
| 30 | `tin` | Tin | **KEEP** | Bronze requires it. Bronze is a tier milestone that introduces the alloy reaction type. Tin's identity — "the ingredient that makes copper into bronze" — is thin but tied to a must-have milestone. | Keep; flag for removal if bronze synthesis is ever simplified to single-input |
| 31 | `zinc` | Zinc | **REMOVE** | Optional with shard income only. No chain dependency in the new design. Industrial depth without emotional identity. Remove. | Cut entirely |
| 32 | `gold` | Gold | **KEEP** | High shard value, noble metal prestige. Players understand gold. Inert with high value is a valid design for a prestige element. | — |
| 33 | `lithium` | Lithium | **KEEP** | Gen 3 battery chain + Gen 5 lithium deuteride. One of the longest callbacks in the game. | — |
| 34 | `fluorine` | Fluorine | **MAYBE** | Most electronegative element, extreme reactivity, strong elemental identity. Optional chain (semiconductor etching). The danger and volatility are memorable. If the game ever models reactant volatility, fluorine is the Gen 2 showcase. Keep as optional with high reactivity values. | Keep as optional; flag if chain dependency is thin |
| 35 | `nickel` | Nickel | **KEEP** | Required for stainless steel (Gen 3). | — |
| 36 | `sulfur_dioxide` | Sulfur dioxide | **MERGE** | Invisible intermediate in the sulfuric acid chain. The Contact Process (S → SO₂ → SO₃ → H₂SO₄) is real industrial chemistry. It is also a perfectly boring three-step chain that buries the milestone substance three discoveries deep. The player does not care about SO₂. They care about sulfuric acid. | Collapse: sulfur + oxygen + water → H₂SO₄ (conditions: high temperature, catalytic). Multi-reactant synthesis replaces the chain. |
| 37 | `sulfur_trioxide` | Sulfur trioxide | **MERGE** | The most invisible intermediate in the game. Exists only to convert SO₂ into H₂SO₄. Has no identity, no shard value, no emotional weight. No player has ever thought "I can't wait to discover sulfur trioxide." | Collapse immediately. See above. |
| 38 | `sulfuric_acid` | Sulfuric acid | **KEEP** | "King of chemicals." The milestone the player actually cares about. Tier gate. High shard value. Gen 2 identity substance. | — |
| 39 | `nitrogen_dioxide` | Nitrogen dioxide | **MERGE** | Same argument as sulfur_dioxide. Invisible intermediate in the NO → NO₂ → HNO₃ chain. The player wants nitric acid. NO₂ is homework. | Collapse: nitrogen + oxygen + water → HNO₃ (conditions: oxidizing atmosphere). |
| 40 | `nitric_acid` | Nitric acid | **KEEP** | Second major strong acid. Required for nylon chain (Gen 3). The milestone that matters. | — |
| 41 | `phosphoric_acid` | Phosphoric acid | **MERGE** | In v1.0, phosphoric acid was essential for DNA, ATP, and RNA. Those uses are gone. Its only remaining purpose is feeding n-type doped silicon — but phosphorus can dope silicon directly (phosphorus is the dopant; the acid is a delivery vehicle, not a substance the player cares about). | Collapse: phosphorus + pure_silicon → n-type doped_silicon. Phosphoric_acid removed as standalone. |
| 42 | `sodium_hydroxide` | Sodium hydroxide | **MAYBE** | First strong base. Chlor-alkali synthesis (NaCl + water → NaOH + Cl₂) is mechanically interesting. But NaOH doesn't lead anywhere critical in the new design — no soap chain, no critical industrial synthesis milestone. It risks being a dead-end "concept teaching" substance. Keep if it feeds something specific; otherwise collapse into acid-base reaction mechanics. | Design decision: assign a concrete Gen 3 downstream use, or merge |
| 43 | `calcium_oxide` | Calcium oxide | **KEEP** | One of three inputs to glass synthesis (three-input convergence). Earns its place in that convergence reaction. "Quicklime" has strong cultural resonance and the calcium + oxygen → calcium_oxide reaction has satisfying thermal identity. | Keep; calcium → calcium_oxide directly (see calcium_carbonate collapse) |
| 44 | `calcium_carbonate` | Calcium carbonate | **MERGE** | Currently feeds calcium_oxide via thermal decomposition. But calcium can synthesize to calcium_oxide directly (Ca + O₂ → CaO). Calcium carbonate's "limestone" geological identity is exactly the framing §2 says to avoid ("Not a planet simulator"). | Collapse: calcium → calcium_oxide directly. Calcium_carbonate removed. |
| 45 | `calcium_hydroxide` | Calcium hydroxide | **REMOVE** | "Slaked lime." Feeds water treatment lore. No critical chain in the new design. Dead end. Remove. | Cut entirely |
| 46 | `silicon_dioxide` | Silicon dioxide | **KEEP** | Quartz. Feeds glass AND the semiconductor chain (SiO₂ → pure_silicon). Geological identity that actually matters because it bridges geology to electronics. | — |
| 47 | `sodium_carbonate` | Sodium carbonate | **KEEP** | Glass synthesis input + Solvay Process (4-reactant synthesis: NH₃ + CO₂ + NaCl + H₂O → Na₂CO₃). The Solvay Process is the richest multi-reactant discovery in Gen 2. Keep. | — |
| 48 | `formaldehyde` | Formaldehyde | **REMOVE** | Biological uses (formose reaction, Strecker synthesis) removed. New stated use — "polymer resin feedstock" — is uncommitted and optional. Formaldehyde exists because the old Gen 3 required it. It doesn't have a chain-critical role in the new design. | Cut entirely |
| 49 | `acetic_acid` | Acetic acid | **REMOVE** | Aspirin chain removed. Acetyl-CoA removed. Now listed as "industrial solvent, polymer processing" — a non-answer. If it doesn't feed a named milestone substance, it's dead weight. | Cut entirely |
| 50 | `methanol` | Methanol | **KEEP** | MTO process: methanol → polyethylene chain. Chain-critical for the polymer sequence. | — |
| 51 | `urea` | Urea | **MAYBE** | The Wöhler synthesis (1828: NH₃ + CO₂ → urea) is a perfect lore beat for a reactor game — "the synthesis that proved organic molecules don't require life." Thematically on-point. But "carbon-nitrogen composite materials" as downstream is vague. Keep only if a concrete Gen 3 substance is authored that requires urea. Otherwise the lore beat belongs in a flavor text file, not a substance slot. | Assign a concrete downstream use or remove |
| 52 | `bronze` | Bronze | **KEEP** | First alloy. Tier milestone. Introduces the alloy reaction type. The copper + tin moment is satisfying. | — |
| 53 | `aluminum_oxide` | Aluminum oxide | **KEEP** | Feeds glass (3-input) AND YBCO superconductor (Gen 4). Two distinct important uses across two generations. | — |

**Gen 2 summary:** Cut 4 removes (potassium, zinc, calcium_hydroxide, formaldehyde, acetic_acid = 5 removes) + 5 merges (SO₂, SO₃, NO₂, phosphoric_acid, calcium_carbonate). Target: 20–23 substances.

---

### Generation 3 — Advanced Materials

| # | itemKey | name | verdict | reason | suggested action |
|---|---|---|---|---|---|
| 54 | `titanium` | Titanium | **KEEP** | Anchors titanium alloy chain and Gen 4 superconductor callbacks. Strong elemental identity (aerospace, medical implants). | — |
| 55 | `chromium` | Chromium | **KEEP** | Required for stainless steel. One element, one clear purpose, a major milestone downstream. | — |
| 56 | `tungsten` | Tungsten | **KEEP** | Highest melting point of any metal. The "refractory metals" concept is interesting. Tungsten carbide is a real milestone material. | — |
| 57 | `boron` | Boron | **KEEP** | Three callbacks: p-type silicon doping (Gen 3), borosilicate glass (Gen 3), MgB₂ superconductor (Gen 4). Best chain density of any Gen 3 element. | — |
| 58 | `coke` | Coke | **KEEP** | Required reducing agent for iron smelting. Connects carbon (Gen 1) to pig iron → steel. The concept of purifying carbon for industrial use is real and interesting. | — |
| 59 | `pig_iron` | Pig iron | **KEEP** | Three-input convergence: iron_oxide + coke + calcium_oxide → pig_iron. Rich intermediate with real identity ("too much carbon to be steel yet"). The blast furnace concept matters. | — |
| 60 | `steel` | Steel | **KEEP** | THE Gen 3 milestone. Non-negotiable. | — |
| 61 | `stainless_steel` | Stainless steel | **KEEP** | Multi-metal convergence: steel + chromium + nickel. Every ingredient was discovered earlier. This is what chain convergence should feel like. | — |
| 62 | `titanium_alloy` | Titanium alloy | **MERGE** | Labeled "must-have" but its downstream is "aerospace structural materials, Gen 4 containment components" — both conceptual, neither names a specific substance. This is the textbook definition of an invisible intermediate masquerading as a substance. Titanium feeds Gen 4 chains directly; the alloy step adds nothing the player remembers. | Remove as standalone; titanium participates in Gen 4 reactions directly |
| 63 | `tungsten_carbide` | Tungsten carbide | **MAYBE** | The hardest engineered material. Strong identity (drill bits, cutting tools). But its downstream in the game is also conceptual ("Gen 4 containment materials"). If it feeds a specific named Gen 4 substance, keep it. If it just exists because tungsten + carbon → WC is real chemistry, it's optional filler. | Assign a concrete Gen 4 downstream or remove |
| 64 | `graphene` | Graphene | **KEEP** | The wonder material. A landmark discovery. High energy cost communicates rarity. Feeds lithium-ion cell + Gen 4 substrates. Non-negotiable. | — |
| 65 | `carbon_fiber` | Carbon fiber | **KEEP** | Strong identity. "Strength without weight." Feeds Gen 4 containment (and needs a specific Gen 4 named substance to fully justify it). | — |
| 66 | `fullerene` | Fullerene | **KEEP** | Buckminster fullerene. The perfect spherical carbon molecule. The discovery should be visually spectacular — a perfect sphere in the reactor. Opens the carbon allotrope family narrative. | — |
| 67 | `carbon_nanotube` | Carbon nanotube | **KEEP** | Extreme tensile strength + electrical conductivity. Opens Gen 4 substrate chain. Strong identity. | — |
| 68 | `benzene` | Benzene | **KEEP** | Aromatic hub. The "ring" chemistry discovery. Feeds nylon chain. Cyclotrimerization of methane is a high-energy and satisfying reaction. | — |
| 69 | `ethylene` | Ethylene | **MERGE** | methanol → ethylene → polyethylene. Ethylene is a pure intermediate. The player discovers ethylene and immediately makes polyethylene from it. No player moment attached to ethylene itself. Collapse to: methanol → polyethylene (catalytic polymerization). The milestone is polyethylene. | Collapse: methanol → polyethylene directly. Ethylene removed as standalone. |
| 70 | `polyethylene` | Polyethylene | **KEEP** | First synthetic polymer. Tier milestone. High shard value. | — |
| 71 | `nylon` | Nylon | **KEEP** | High-performance polymer. Converges aromatic chemistry (benzene) + nitrogen chemistry (ammonia). A substance nature doesn't produce. | — |
| 72 | `pure_silicon` | Pure silicon | **KEEP** | Required intermediate in the semiconductor chain with real identity — "metallurgical grade silicon, purified from quartz." The purification step is interesting. | — |
| 73 | `doped_silicon` | Doped silicon | **KEEP** | Electronics milestone. Two variant tracks (n-type, p-type). Chain convergence. | — |
| 74 | `glass` | Glass | **KEEP** | Three-input convergence. The first "multi-substrate" synthesis. Satisfying. | — |
| 75 | `borosilicate_glass` | Borosilicate glass | **KEEP** | Gen 4 bridge. Heat-resistant glass that feeds plasma containment conceptually. Needs a specific Gen 4 downstream named substance to fully justify it. | — |
| 76 | `fused_quartz` | Fused quartz | **REMOVE** | Ultra-pure SiO₂. Optional. No critical downstream. "Gen 4 optics" is conceptual, not mechanical. If it doesn't feed a specific named Gen 4 substance, it's expensive silicon dioxide. Remove. | Cut entirely |
| 77 | `lithium_carbonate` | Lithium carbonate | **MERGE** | Lithium → lithium_carbonate → lithium_ion_cell. Lithium carbonate has no independent identity. The player discovers it and immediately uses it for the battery. Collapse: lithium + doped_silicon + graphene → lithium_ion_cell directly (multi-reactant synthesis). | Remove as standalone; lithium becomes a direct input to lithium_ion_cell synthesis |
| 78 | `lithium_ion_cell` | Lithium-ion cell | **KEEP** | Three-chain convergence: battery chain + semiconductor chain + graphene chain. The synthesis that requires three tracks to complete. Major Gen 3 milestone. | — |

**Gen 3 summary:** 2 removes (fused_quartz, titanium_alloy→MERGE) + 2 merges (ethylene, lithium_carbonate). Target: 20–22 substances.

---

### Generation 4 — Extreme States

| # | itemKey | name | verdict | reason | suggested action |
|---|---|---|---|---|---|
| 79 | `uranium` | Uranium | **KEEP** | Radioactive threshold element. The reactor's first encounter with radioactive material. Opens nuclear chain. | — |
| 80 | `yttrium` | Yttrium | **MAYBE** | Exists only to feed YBCO. Zero independent identity — a player encountering yttrium has no intuition for what it is. However: if YBCO is a major milestone (it is), yttrium earns its place retroactively when the player synthesizes YBCO. Design risk is low. Keep, but flag for reconsideration if YBCO's role weakens. | Keep with YBCO; reconsider if YBCO is simplified |
| 81 | `hydrogen_plasma` | Hydrogen plasma | **KEEP** | First plasma-state substance. Introduces the `plasma_synthesis` reaction type. The reactor changes character here. | — |
| 82 | `reactive_plasma_core` | Reactive plasma core | **KEEP** | Gen 4 tier milestone. The reactor begins to feel alive. | — |
| 83 | `diamond_synthetic` | Synthetic diamond | **KEEP** | Iconic. The hardest natural material made by the reactor under extreme pressure. Introduces pressure as a synthesis axis. | — |
| 84 | `metallic_hydrogen` | Metallic hydrogen | **KEEP** | The reactor simulating a Jupiter interior. Physics at extremes. Memorable concept. Low yield, high fantasy. | — |
| 85 | `ybco_superconductor` | YBCO superconductor | **KEEP** | Four-chain convergence: yttrium + copper + aluminum_oxide + oxygen. Materials science landmark (1987 high-temperature superconductor). The milestone superconductor. | — |
| 86 | `magnesium_diboride` | Magnesium diboride | **MAYBE** | A second superconductor track with a real magnesium callback from Gen 2. Simple composition (MgB₂). Interesting but: Gen 4 already has YBCO as the superconductor milestone. Two superconductors adds depth; three would be encyclopedic. Keep magnesium_diboride as optional; cut niobium_titanium. | Keep as optional if Gen 4 needs more content; otherwise cut |
| 87 | `niobium_titanium_alloy` | Niobium-titanium alloy | **REMOVE** | The third superconductor track in a generation that already has YBCO and possibly MgB₂. This is textbook substance encyclopedia thinking. "Alternative superconductor track alongside YBCO" is the worst reason to keep a substance. One milestone superconductor (YBCO). One optional alternative (MgB₂). Zero need for a third. | Cut entirely |
| 88 | `uranium_oxide` | Uranium oxide | **MERGE** | Pure intermediate: uranium → uranium_oxide → nuclear_fuel_pellet. "Yellowcake" has real-world identity but in the reactor, it's just a step. The player wants the nuclear fuel pellet. Collapse: uranium + oxygen → nuclear_fuel_pellet (enrichment conditions). | Collapse; uranium_oxide removed as standalone |
| 89 | `nuclear_fuel_pellet` | Nuclear fuel pellet | **KEEP** | Gen 4 energy milestone. Gate to Gen 5. Very high positive energyChange. | — |
| 90 | `hydrazine` | Hydrazine | **MAYBE** | High-energy rocket fuel. Low stabilityFactor. Interesting for volatility mechanics. Optional plasma oxidizer. Thin chain but strong character (dangerous, unstable). Keep if instability mechanics are implemented; otherwise thin downstream. | Conditional on instability mechanic implementation |
| 91 | `rhenium_superalloy` | Rhenium superalloy | **REMOVE** | Obscure name. No player recognition. Optional with no named downstream substance. Exists because high-temperature alloys are real. That is not a reason. | Cut entirely |

**Gen 4 summary:** 2 definite removes (niobium_titanium_alloy, rhenium_superalloy) + 1 merge (uranium_oxide). Target: 8–10 substances.

---

### Generation 5 — Cosmic Alchemy

Gen 5 is mostly strong. Be conservative.

| # | itemKey | name | verdict | reason | suggested action |
|---|---|---|---|---|---|
| 92 | `deuterium` | Deuterium | **KEEP** | Fusion chain anchor. First isotope mechanics. | — |
| 93 | `tritium` | Tritium | **KEEP** | Fusion chain. Radioactive. Requires nuclear fuel pellet energy. | — |
| 94 | `helium_3` | Helium-3 | **KEEP** | Fusion byproduct with dual role in BEC chain. Elegant design. | — |
| 95 | `fusion_plasma` | Fusion plasma | **KEEP** | Gen 5 energy milestone. The reactor produces miniature stars. | — |
| 96 | `liquid_helium` | Liquid helium | **KEEP** | The helium callback moment. Gen 1 noble gas finally reveals its purpose. One of the best callback beats in the game. | — |
| 97 | `bose_einstein_condensate` | Bose-Einstein condensate | **KEEP** | Multi-chain convergence. Quantum physics milestone. Gen 6 substrate. | — |
| 98 | `positron` | Positron | **KEEP** | Antimatter chain start. Pair production concept. | — |
| 99 | `antiproton` | Antiproton | **KEEP** | Antimatter chain step 2. | — |
| 100 | `antihydrogen` | Antihydrogen | **KEEP** | Antimatter chain culmination. Highest Gen 5 shard tier. Matter-antimatter annihilation event. | — |
| 101 | `lithium_deuteride` | Lithium deuteride | **MAYBE** | Cross-gen callback: Gen 2 lithium + Gen 5 deuterium. Historical resonance (thermonuclear fuel). But its downstream is thin — only amplifies stellar_core_fragment synthesis. Not chain-critical. Keep as optional depth if stellar_core_fragment benefits from it; otherwise remove. | Keep as optional; remove if stellar_core_fragment synthesis doesn't need it |
| 102 | `stellar_core_fragment` | Stellar Core Fragment | **KEEP** | Gen 5 iconic anchor #1. The moment the player holds something that only exists inside neutron stars. Non-negotiable. | — |
| 103 | `event_horizon_condensate` | Event Horizon Condensate | **KEEP** | Gen 5 iconic anchor #2. Final tier gate. The last synthesis before Gen 6. Non-negotiable. | — |
| 104 | `strange_quark_condensate` | Strange quark condensate | **KEEP** | Parallel exotic chain. Demonstrates Gen 5 has two major branches (antimatter + quark matter). | — |
| 105 | `dark_matter_proxy` | Dark matter proxy | **KEEP** | Multi-chain convergence: BEC + strange quark condensate. Feeds Gen 6. | — |
| 106 | `quantum_foam_lattice` | Quantum foam lattice | **KEEP** | Captures vacuum fluctuations at the threshold of particle physics and geometry. Feeds event_horizon_condensate and multiple Gen 6 reactions. | — |

**Gen 5 summary:** Leave mostly intact. 1 maybe (lithium_deuteride). Target: 14–15 substances.

---

### Generation 6 — Reality Manipulation

All 8 Gen 6 substances are **KEEP**. Do not touch.

| # | itemKey | name | verdict | reason |
|---|---|---|---|---|
| 107 | `prima_materia` | Prima Materia | **KEEP** | Gen 6 gate substance. Base input for all Gen 6 reactions. |
| 108 | `philosophers_stone` | Philosopher's Stone | **KEEP** | Apex catalyst with active mechanical effect (transmutation_mythic). |
| 109 | `aether` | Aether | **KEEP** | Classical physics myth with scientific adjacency. |
| 110 | `neutron_glass` | Neutron Glass | **KEEP** | Crystallized neutron star matter. |
| 111 | `void_crystal` | Void Crystal | **KEEP** | Casimir effect extension. Matter from vacuum. |
| 112 | `false_vacuum_seed` | False Vacuum Seed | **KEEP** | Three Gen 6 chain convergence. The most dangerous substance in the game conceptually. |
| 113 | `chrono_dust` | Chrono Dust | **KEEP** | Time dilation in crystalline form. |
| 114 | `dark_matter_crystal` | Dark Matter Crystal | **KEEP** | The final substance. Non-negotiable. |

---

## 4. Strongest Substances — Preserve at All Costs

These 30 substances are the spine of the game. Every other substance exists in relation to them.

**Gen 1 spine:**
- `hydrogen` — everything runs on hydrogen
- `carbon` — everything advanced runs on carbon
- `water` — first discovery; universal
- `iron` — steel chain anchor
- `sodium_chloride` — first tier milestone
- `ammonia` — nitrogen gateway to all later generations

**Gen 2 spine:**
- `sulfuric_acid` — "king of chemicals" tier milestone
- `bronze` — first alloy, introduces alloy synthesis type
- `silicon_dioxide` — geological anchor to semiconductor chain
- `copper` — three-generation callback champion

**Gen 3 spine:**
- `steel` — Gen 3 milestone
- `graphene` — wonder material, battery chain gate
- `carbon_nanotube` — extreme properties, Gen 4 bridge
- `lithium_ion_cell` — three-chain convergence milestone
- `nylon` — high-performance polymer, nitrogen + aromatic convergence
- `doped_silicon` — electronics milestone
- `glass` — three-input convergence, satisfying synthesis

**Gen 4 spine:**
- `reactive_plasma_core` — Gen 4 tier milestone, reactor begins feeling alive
- `ybco_superconductor` — four-chain convergence, materials landmark
- `metallic_hydrogen` — Jupiter interior simulation
- `nuclear_fuel_pellet` — Gen 5 gate, energy milestone

**Gen 5 spine:**
- `fusion_plasma` — Gen 5 energy milestone, miniature stars
- `antihydrogen` — antimatter culmination, highest Gen 5 shard tier
- `bose_einstein_condensate` — quantum cold milestone
- `stellar_core_fragment` — Gen 5 iconic anchor #1
- `event_horizon_condensate` — Gen 5 iconic anchor #2, final tier gate

**Gen 6 spine (all 8):**
- `prima_materia` → `philosophers_stone` → `dark_matter_crystal`

---

## 5. Most Obvious Cuts and Merges

These require no design discussion. Execute immediately when updating substance-universe.md.

**Definite removes (8 substances):**
1. `argon` — noble gas with no callback, no chain
2. `ozone` — oxygen allotrope with no chain
3. `potassium` — major element with zero critical downstream
4. `zinc` — optional element with no chain
5. `calcium_hydroxide` — dead-end industrial compound
6. `formaldehyde` — bio uses removed; nothing took their place
7. `acetic_acid` — pharma removed; "industrial solvent" is not a downstream
8. `niobium_titanium_alloy` — third superconductor in a generation that needs one
9. `rhenium_superalloy` — obscure optional with no named downstream
10. `fused_quartz` — expensive silicon dioxide with conceptual-only downstream

That's 10 definite removes.

**Definite merges (11 substances → absorbed into adjacent reactions):**
1. `hydrogen_chloride` — collapse into NaCl synthesis; semiconductor etching becomes a reaction condition
2. `hydrogen_sulfide` — collapse into H₂SO₄ synthesis; sulfur participates directly
3. `nitric_oxide` — collapse into HNO₃ multi-reactant synthesis
4. `sulfur_dioxide` — collapse into H₂SO₄ multi-reactant synthesis
5. `sulfur_trioxide` — collapse into H₂SO₄ multi-reactant synthesis
6. `nitrogen_dioxide` — collapse into HNO₃ multi-reactant synthesis
7. `phosphoric_acid` — collapse into doped_silicon; phosphorus is the dopant directly
8. `calcium_carbonate` — collapse into calcium_oxide; calcium → CaO directly
9. `ethylene` — collapse into polyethylene; methanol → polyethylene catalytic chain
10. `lithium_carbonate` — collapse into lithium_ion_cell; lithium is a direct input
11. `uranium_oxide` — collapse into nuclear_fuel_pellet; uranium → pellet directly

Post-merge, each collapsed intermediate becomes a **reactant input** in a richer multi-reactant synthesis. Example:

```
BEFORE:
sulfur → sulfur_dioxide → sulfur_trioxide → sulfuric_acid  (3 separate reactions, boring)

AFTER:
sulfur + oxygen + water → sulfuric_acid  (1 multi-reactant synthesis, conditions: high temperature)
```

This is strictly better. The chain information is preserved in the reaction recipe. The player gets fewer boring steps and one more satisfying convergence.

---

## 6. Notes on Future Reaction Design

**The merge principle creates better reactions, not simpler ones.**

Every collapsed intermediate becomes a reactant in a multi-input synthesis. The substance count goes down. The reaction richness goes up. This is the correct trade.

**Specific reaction design implications:**

| Collapsed chain | New reaction | Design improvement |
|---|---|---|
| S → SO₂ → SO₃ → H₂SO₄ | S + O₂ + H₂O → H₂SO₄ | 3-input convergence; no boring steps |
| N → NO → NO₂ → HNO₃ | N + O₂ + H₂O → HNO₃ | Conditions: oxidizing; 3-input |
| U → UO₂ → fuel_pellet | U + O₂ → fuel_pellet | Enrichment as a condition, not a substance |
| Li → Li₂CO₃ → Li-ion cell | Li + doped_Si + graphene → Li-ion cell | Four-input convergence; all three chain threads meet here |
| methanol → ethylene → polyethylene | methanol → polyethylene | MTO process as condition; milestone cleaner |

**The acid chain redesign is the most impactful single change.** Currently Gen 2 contains six substances that are really just two milestones (H₂SO₄ and HNO₃) surrounded by four invisible intermediates. After the merge, Gen 2 has two milestone acids with multi-reactant syntheses. This is a significant improvement in progression density.

**Watch for new invisible intermediates in Gen 3.** After fixing Gen 1–2, the same pattern can emerge in Gen 3 (e.g., benzene → nylon is currently just one step, which is fine, but any additions to the polymer chain should be evaluated against this criterion).

**Gen 4 superconductor design.** After cutting niobium_titanium_alloy, Gen 4 has YBCO (milestone) and possibly MgB₂ (optional). This is cleaner. The design intention should be: YBCO is the superconductor moment; MgB₂ is an optional discovery for players who experiment. Not two milestone superconductors competing for the same emotional space.

---

## 7. Revised Design Principle

> **Chemistry authenticity supports the fantasy; it does not control it.**

The reactor does not care about the Contact Process. It does not care that real sulfuric acid synthesis passes through SO₂ and SO₃. It produces what the player cares about discovering.

Every substance that exists because "that's how the real chemistry works" should be evaluated as if it were a design decision, not a fact. The question is never "is this chemically accurate?" The question is always "does this substance have a moment? Does discovering it feel like something? Does it make the player's relationship with the reactor richer?"

If the answer is no — if the substance is just a step on the way to a substance that has a moment — then it is a reaction ingredient, not a substance. It belongs in a reaction recipe, not in an inventory slot.

The bar for a standalone substance is:
1. **A player moment** — the discovery feels like something
2. **An identity** — the player can describe what this substance is and why it matters
3. **A downstream** — it feeds something specific and named, not "Gen X containment conceptually"

Any substance that fails all three tests is wrong. Any substance that fails two tests is probably wrong. A substance that fails one test needs a design discussion.

Sulfur trioxide fails all three. Calcium hydroxide fails all three. Niobium-titanium alloy fails all three. These are not close calls. Cut them and make the substances that matter feel more important by removing the noise around them.

---

*End of Substance Importance Audit v1.0*  
*Next step: Update substance-universe.md v2.1 to execute definite removes and merges. Resolve MAYBE items before or after v2.1 authoring.*
