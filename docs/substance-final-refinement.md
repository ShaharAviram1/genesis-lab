# Genesis Lab — Substance Universe: Final Refinement Pass

**Version:** 1.0  
**Status:** Design — Pre-Reaction-Graph  
**Date:** 2026-05-09  
**Inputs:** substance-universe.md v2.0 (114 substances), substance-importance-audit.md, generation-philosophy-v2.md v2.2  
**Output:** Final substance recommendations, naming verdicts, compression decisions, and pre-reaction-design checklist  
**Target count:** 70–75 substances (floor: 65, ceiling: 80)

---

## 1. Fantasy Weight Applied — Full Substance Audit

Every substance from substance-universe.md v2.0 rated on the fantasy weight hierarchy:
- **5 — Iconic:** player will remember this forever
- **4 — Memorable:** registers as significant, good name
- **3 — Functional:** name communicates purpose, tracks without excitement
- **2 — Invisible:** necessary only; no emotional identity
- **1 — Dead Weight:** no identity, no necessity

### Gen 1 — Fundamental Matter (22 → target 14–15)

| Substance | FW | Verdict | Note |
|---|---|---|---|
| Hydrogen | 5 | **KEEP** | Most important substance in existence. Anchor. |
| Helium | 4 | **KEEP** | Gen 5 callback (liquid helium, BEC). Deceptively load-bearing. |
| Carbon | 5 | **KEEP** | Feeds everything. Graphene, diamond, nanotubes. Irreplaceable. |
| Nitrogen | 3 | **KEEP** | Ammonia synthesis. Gen 2 gateway. |
| Oxygen | 5 | **KEEP** | Combustion, synthesis, everywhere. |
| Sodium | 3 | **KEEP** | → Salt. Too important to cut. |
| Chlorine | 3 | **KEEP** | → Salt. Same. |
| Iron | 5 | **KEEP** | Steel chain origin. Iconic. |
| Sulfur | 3 | **KEEP** | → Sulfuric acid (multi-reactant). Necessary. |
| Water | 5 | **KEEP** | Synthesis reagent for half the game. |
| Ammonia | 4 | **KEEP** | Multiple Gen 2 pathways. Good name. |
| Sodium Chloride (Salt) | 5 | **KEEP** | Name: "Salt". Level 5 through familiarity. |
| Iron Oxide | 3 | **KEEP** | Steel chain input. |
| Methane | 3 | **KEEP** | → Benzene, nylon pathway. |
| Carbon Dioxide | 3 | **KEEP** | Gen 2 reagent. Familiar, needed. |
| Hydrogen Peroxide | 3 | **MAYBE** | Recognizable name, some chain use. Survives if ≥1 clear downstream. |
| Argon | 1 | **CUT** | Noble gas with zero downstream. No name resonance for players who don't know chemistry. |
| Ozone | 1 | **CUT** | Dead end. No synthesis chain. Players know the word but not why it matters. |
| Carbon Monoxide | 2 | **MERGE** | Absorb into pig iron synthesis: `iron_oxide + carbon + quicklime → pig_iron`. CO is a reaction mechanism, not an item. |
| Hydrogen Sulfide | 2 | **CUT** | Cut entirely — its Gen 2 downstream (sulfuric acid) is now multi-reactant. No other chain. |
| Nitric Oxide | 2 | **MERGE** | Absorb into nitric acid synthesis. Merge with nitrogen dioxide; player synthesizes `nitric_acid` from `nitrogen + oxygen + water` directly. |
| Nitrogen Dioxide | 2 | **MERGE** | Same as nitric oxide — both are invisible intermediates on the way to nitric acid. |

**Gen 1 survivors: 14 + 1 maybe = 14–15**
`Hydrogen, Helium, Carbon, Nitrogen, Oxygen, Sodium, Chlorine, Iron, Sulfur, Water, Ammonia, Salt, Iron Oxide, Methane, CO₂ [+ Hydrogen Peroxide if downstream confirmed]`

---

### Gen 2 — Industrial Synthesis (31 → 13, FINAL)

*Gen 2 identity: "The Workshop" — three phases: Foundry → Chemical Works → Materials Bench.*

| Substance | FW | Phase | Verdict | Role |
|---|---|---|---|---|
| Copper | 4 | Foundry | **KEEP** | Bronze gateway. Ancient foundry metal. Familiar, load-bearing. |
| Tin | 3 | Foundry | **KEEP** | Bronze convergence input. `copper + tin → bronze`. Not optional — the convergence is the point. |
| Gold | 5 | Foundry | **KEEP** | Gen 2 prestige milestone. Fantasy weight 5. No intervention needed. |
| Nickel | 2 | Foundry | **KEEP** | Stainless steel third input. Weakness is the name; strength is the delayed revelation of purpose. Hint: "Nickel does not corrode. Neither does the alloy it creates." |
| Bronze | 4 | Foundry | **KEEP** | Gen 2 alloy milestone. The first time the reactor produces something that did not exist in nature. Discovery message must match the weight. |
| Sulfuric Acid | 4 | Chemical Works | **KEEP** | "King of Chemicals." Multi-reactant: `sulfur + oxygen + water → sulfuric_acid`. The workshop's most dangerous product. |
| Nitric Acid | 3 | Chemical Works | **KEEP** | Nylon feedstock (Gen 3). Hint must reference aqua regia — it connects gold and acid in a way players will remember. |
| Quicklime | 3 | Chemical Works | **KEEP** | Pig iron and glass synthesis reagent. Rename from calcium oxide is correct. Ancient, furnace-adjacent, reactive with water. |
| Quartz | 4 | Materials Bench | **KEEP** | Rename from silicon dioxide. Double gateway: glass chain and doped silicon chain. Most load-bearing Gen 2 substance for Gen 3 dependency. |
| Soda Ash | 3 | Materials Bench | **KEEP** | Glass synthesis flux. Industrial common name. Sounds like it belongs in a warehouse. |
| Silicon | 3 | Materials Bench | **KEEP** | Electronics chain gateway. Cultural weight through "Silicon Valley" — players know what this implies. |
| Calcium | 3 | Materials Bench | **KEEP** | Quicklime gateway. Weakest FW in Gen 2 — compensate with hint text framing calcium as reactive and dangerous, not biological. |
| Lithium | 3 | Materials Bench | **KEEP** | Lithium-ion cell gateway. Forward-looking — by the time you synthesize lithium, Gen 3 feels imminent. |
| Phosphorus | — | — | **CUT** | One doped silicon substance, one synthesis path (`quartz + boron → doped_silicon`). Phosphorus adds a substance without adding a named product. The n/p doping distinction is a reaction condition, not an inventory item. |
| Hydrogen Chloride | 2 | — | **CUT** | `sodium + chlorine → salt` directly. No remaining downstream. |
| Sodium Hydroxide | 2 | — | **CUT** | No Gen 3+ downstream. |
| Sulfur Trioxide | 1 | — | **CUT** | Invisible intermediate, absorbed into multi-reactant H₂SO₄. |
| Sulfur Dioxide | 1 | — | **CUT** | Same. |
| Phosphoric Acid | 1 | — | **CUT** | No remaining role. |
| Calcium Carbonate | 1 | — | **CUT** | `calcium → quicklime` directly. |
| Calcium Hydroxide | 1 | — | **CUT** | Dead end. |
| Magnesium | 2 | — | **CUT** | No downstream after MgB₂ cut. |
| Aluminum | 2 | — | **CUT** | YBCO simplified; aluminum oxide chain cut with it. |
| Aluminum Oxide | 2 | — | **CUT** | Cut with aluminum. |
| Zinc | 1 | — | **CUT** | No chain, no identity. |
| Potassium | 1 | — | **CUT** | Same. |
| Fluorine | 2 | — | **CUT** | No Gen 3+ chain. |
| Methanol | 2 | — | **CUT** | No downstream after polyethylene cut. |
| Formaldehyde | 1 | — | **CUT** | Dead end. |
| Urea | 2 | — | **CUT** | No concrete Gen 3 chain. |
| Acetic Acid | 1 | — | **CUT** | No chain, no identity. |

**Gen 2 final: 13 substances. No optionals. No maybes.**

**Phase 1 — The Foundry:** Copper, Tin, Gold, Nickel, Bronze  
**Phase 2 — The Chemical Works:** Sulfuric Acid, Nitric Acid, Quicklime  
**Phase 3 — The Materials Bench:** Quartz, Soda Ash, Silicon, Calcium, Lithium

*Emotional arc: ancient craft (foundry) → industrial chemistry (acid works) → modern materials science (electronics feedstock). Every substance feeds a named Gen 3 milestone or is a named Gen 2 milestone itself. No invisible intermediates remain.*

---

### Gen 3 — Advanced Materials (25 → target 14–16)

| Substance | FW | Verdict | Note |
|---|---|---|---|
| Titanium | 4 | **KEEP** | Titanium alloy is the Gen 3 premium alloy milestone. Name is iconic. |
| Chromium (Chrome) | 3 | **KEEP** | Name: **Chrome**. Stainless steel input. Rename eliminates chemical-register mismatch. |
| Tungsten | 3 | **KEEP** | Tungsten carbide downstream. Extreme material identity ("hardest metal"). |
| Boron | 3 | **KEEP** | Borosilicate glass + possible boron-doped silicon. Load-bearing. |
| Pig Iron | 3 | **MAYBE** | `iron_oxide + carbon + quicklime → pig_iron → steel`. Intermediate with a name players know. If pig iron is kept, it must be a named milestone, not a silent step. |
| Steel | 5 | **KEEP** | Gen 3 tier milestone. One of the most iconic substances in the game. Do not touch. |
| Stainless Steel | 4 | **KEEP** | Named milestone. Requires convergence (steel + chrome + nickel). Emotionally clear. |
| Titanium Alloy | 4 | **KEEP** | Gen 3 premium alloy. Requires titanium + steel. Clear emotional upgrade. |
| Tungsten Carbide | 3 | **KEEP** | Extreme material. Name communicates density and hardness. Fantasy weight 3, chain value high. |
| Graphene | 5 | **KEEP** | Wonder material. Fantasy weight 5 without question. |
| Carbon Fiber | 3 | **MAYBE** | Good name. Gen 3 structural material. Survives if ≥1 clear Gen 4 downstream. Otherwise cut (graphene is the dominant Gen 3 carbon). |
| Buckyball (Fullerene) | 4 | **KEEP** | Name: **Buckyball**. Renamed from "fullerene." Enormously more memorable. |
| Nanotube (Carbon Nanotube) | 5 | **KEEP** | Name: **Nanotube**. The ultimate Gen 3 advanced carbon. Cascade synthesis: graphene → nanotube. |
| Benzene | 3 | **MAYBE** | Nylon feedstock. Hexagonal ring structure is genuinely beautiful. Survives if nylon requires benzene explicitly. |
| Nylon | 4 | **KEEP** | The sole polymer milestone. Familiar, Gen 3 anchor. |
| Polyethylene | 1 | **CUT** | Nylon is the iconic polymer. Polyethylene is its invisible sibling. Cut. |
| Ethylene | 1 | **CUT** | With polyethylene cut, ethylene is an intermediate with no destination. Cut. |
| Doped Silicon | 4 | **KEEP** | Electronics milestone. The name "doped silicon" is Gen 3-register perfect. |
| Pure Silicon | 2 | **CUT** | `quartz → doped_silicon` directly (with dopant reagent). Pure silicon is an invisible intermediate. Cut. |
| Glass | 4 | **KEEP** | Familiar, beautiful, important. Multi-reactant synthesis: `quartz + soda_ash → glass`. |
| Borosilicate Glass | 3 | **MAYBE** | Only keep if it feeds a named Gen 4 substance. Otherwise one glass is enough. |
| Fused Quartz | 1 | **CUT** | No named downstream. Third glass variant with no identity. Cut. |
| Lithium Carbonate | 2 | **CUT** | Lithium-ion cell can synthesize from `lithium + doped_silicon + graphene` directly. Lithium carbonate is an invisible intermediate. Cut. |
| Lithium-Ion Cell | 5 | **KEEP** | Three-chain convergence milestone. Name is instantly recognizable. Gen 3 finale. |
| Coke | 2 | **CUT** | `iron_oxide + carbon + quicklime → pig_iron`. Carbon (Gen 1) plays the carbon role directly. Coke is an unnecessary intermediate. Cut. |

**Gen 3 survivors: 13 + 4 maybe = 13–17 (pig iron, carbon fiber, benzene, borosilicate conditionally)**  
`Titanium, Chrome, Tungsten, Boron, Steel, Stainless Steel, Titanium Alloy, Tungsten Carbide, Graphene, Buckyball, Nanotube, Nylon, Doped Silicon, Glass, Lithium-Ion Cell [+ Pig Iron if milestone, + Carbon Fiber if downstream, + Benzene if nylon requires it, + Borosilicate if Gen 4 downstream]`

---

### Gen 4 — Extreme States (13 → target 8–9)

| Substance | FW | Verdict | Note |
|---|---|---|---|
| Uranium | 4 | **KEEP** | Load-bearing. Nuclear chain gateway. Name is iconic (for the right reasons). |
| Yttrium | 3 | **KEEP** | Ceramic superconductor input. Necessary. Name is obscure but Elevated-register. |
| Hydrogen Plasma | 3 | **KEEP** | → Reactive Plasma Core. First plasma state. Signals escalation clearly. |
| Reactive Plasma Core | 5 | **KEEP** | Gen 4 tier milestone. The name is exciting. Automation thematic trigger. |
| Synthetic Diamond | 4 | **KEEP** | Name: **Synthetic Diamond**. Extreme pressure state. Clear upgrade from raw carbon. |
| Metallic Hydrogen | 5 | **KEEP** | Fantasy weight 5. The name itself is science fiction made real. Gen 4 prestige anchor. |
| Ceramic Superconductor | 4 | **KEEP** | Name: **Ceramic Superconductor** (renamed from YBCO). Gen 4 materials milestone. |
| Nuclear Fuel Pellet | 4 | **KEEP** | Gen 5 gate. Name communicates exactly what it is and why it matters. |
| YBCO Superconductor | — | **RENAMED** | → Ceramic Superconductor. Above. |
| Magnesium Diboride | 2 | **CUT** | Third superconductor in a generation with two already. Obscure name. No player recognition. |
| Niobium-Titanium Alloy | 1 | **CUT** | Second alloy superconductor. No fantasy identity. Cut entirely. |
| Hydrazine | 2 | **MAYBE** | Rocket propellant. Fantasy weight 3 if framed as "rocket fuel." Cut if no clear Gen 5 downstream. |
| Rhenium Superalloy | 1 | **CUT** | Obscure name, no player recognition, no Gen 5 downstream. Cut. |

**Gen 4 survivors: 8 + 1 maybe = 8–9**  
`Uranium, Yttrium, Hydrogen Plasma, Reactive Plasma Core, Synthetic Diamond, Metallic Hydrogen, Ceramic Superconductor, Nuclear Fuel Pellet [+ Hydrazine if Gen 5 downstream confirmed]`

---

### Gen 5 — Cosmic Alchemy (15 → target 14–15, mostly intact)

| Substance | FW | Verdict | Note |
|---|---|---|---|
| Deuterium | 4 | **KEEP** | Fusion fuel. Real, weighty, meaningful name. |
| Tritium | 4 | **KEEP** | Fusion fuel. Dangerous, exotic, real. |
| Helium-3 | 4 | **KEEP** | Rare isotope. Gen 1 helium callback. Fusion product. |
| Fusion Plasma | 5 | **KEEP** | Gen 5 energy milestone. The name is mythic-register. |
| Liquid Helium | 4 | **KEEP** | Gen 1 helium callback. Superconductor coolant. Beautiful name. |
| Bose-Einstein Condensate | 5 | **KEEP** | Fantasy weight 5. Named from physics history. Players will say "I made a BEC" with awe. |
| Positron | 4 | **KEEP** | Antimatter chain start. Real name, enormous weight. |
| Antiproton | 4 | **KEEP** | Antimatter chain. Load-bearing intermediate. |
| Antihydrogen | 5 | **KEEP** | Gen 5 antimatter milestone. Screenshot moment guaranteed. |
| Stellar Core Fragment | 5 | **KEEP** | "You are holding something from inside a neutron star." Maximum fantasy weight. |
| Event Horizon Condensate | 5 | **KEEP** | Gen 5 finale and Gen 6 gate. The name is perfectly calibrated. |
| Strange Quark Condensate | 4 | **KEEP** | Real physics concept. "Strange" is the quark flavor — scientifically adjacent. |
| Dark Matter Proxy | 4 | **KEEP** | "Proxy" is honest — we can't synthesize dark matter, but we can approximate it. Good scientific adjacency. |
| Quantum Foam Lattice | 4 | **KEEP** | Gen 5 exotic anchor. "Foam" is the real physics term for spacetime structure at the Planck scale. |
| Lithium Deuteride | 2 | **CUT** | MAYBE → CUT. Thin downstream (stellar core fragment amplification only). Lithium deuteride as a synthesis reagent can be implicit. |

**Gen 5 survivors: 14**  
`Deuterium, Tritium, Helium-3, Fusion Plasma, Liquid Helium, BEC, Positron, Antiproton, Antihydrogen, Stellar Core Fragment, Event Horizon Condensate, Strange Quark Condensate, Dark Matter Proxy, Quantum Foam Lattice`

---

### Gen 6 — Reality Manipulation (8 → 8, do not touch)

All 8 Gen 6 substances are confirmed. No cuts, no additions, no renames (except within the canonical rename table where applicable — none apply here).

| Substance | FW | Verdict |
|---|---|---|
| Prima Materia | 5 | **KEEP** |
| Philosopher's Stone | 5 | **KEEP** |
| Aether | 5 | **KEEP** |
| Neutron Glass | 5 | **KEEP** |
| Void Crystal | 5 | **KEEP** |
| False Vacuum Seed | 5 | **KEEP** |
| Chrono Dust | 5 | **KEEP** |
| Dark Matter Crystal | 5 | **KEEP** |

---

## 2. Final Substance List — 75 Substances

*Optionals marked with (?) — cut to reach 70 if needed.*

### Gen 1 — Fundamental Matter (15)

1. Hydrogen  
2. Helium  
3. Carbon  
4. Nitrogen  
5. Oxygen  
6. Sodium  
7. Chlorine  
8. Iron  
9. Sulfur  
10. Water  
11. Ammonia  
12. Salt (Sodium Chloride)  
13. Iron Oxide  
14. Methane  
15. Carbon Dioxide  

*Cut from v2.0: Argon, Ozone, Carbon Monoxide (merged), Hydrogen Sulfide, Nitric Oxide, Nitrogen Dioxide (both merged), Hydrogen Peroxide (borderline — track downstream in reaction design)*

---

### Gen 2 — Industrial Synthesis (13, FINAL)

*Phase 1 — The Foundry:*  
16. Copper  
17. Tin  
18. Gold  
19. Nickel  
20. Bronze  

*Phase 2 — The Chemical Works:*  
21. Sulfuric Acid  
22. Nitric Acid  
23. Quicklime  

*Phase 3 — The Materials Bench:*  
24. Quartz  
25. Soda Ash  
26. Silicon  
27. Calcium  
28. Lithium  

*Cut from v2.0: HCl, NaOH, SO₃, SO₂, NO₂, H₃PO₄, CaCO₃, Ca(OH)₂, Mg, Al, Al₂O₃, Zn, K, F, Methanol, Formaldehyde, Urea, Acetic Acid, Phosphorus*  
*Tin and Nickel confirmed KEEP — no longer optional. Bronze = `copper + tin → bronze`. Stainless Steel = `steel + chrome + nickel → stainless_steel`.*

---

### Gen 3 — Advanced Materials (16 + 3 optional = 16–19)

29. Titanium  
30. Chrome (Chromium)  
31. Tungsten  
32. Boron  
33. Steel  
34. Stainless Steel  
35. Titanium Alloy  
36. Tungsten Carbide  
37. Graphene  
38. Buckyball  
39. Nanotube  
40. Nylon  
41. Doped Silicon  
42. Glass  
43. Lithium-Ion Cell  
44. Pig Iron (?)  
45. Carbon Fiber (?)  
46. Benzene (?)  

*Pig Iron: intermediate between iron oxide and steel. If kept, it must function as a named milestone, not a silent step. Can be cut if `iron_oxide + carbon + quicklime → steel` directly (two-step collapse).*  
*Carbon Fiber: distinct structural material (rigid) vs. graphene (flat/electronic). Keep if Gen 4 or Gen 5 uses it as reagent. Otherwise graphene covers the carbon-chain milestone.*  
*Benzene: nylon precursor. Keep if nylon synthesis is `benzene + nitric_acid → nylon` (authentic). Cut if nylon becomes `methane + nitrogen + ... → nylon` (less satisfying but simpler).*  

*Cut from v2.0: Coke, Pure Silicon, Polyethylene, Ethylene, Fused Quartz, Borosilicate Glass (borderline), Lithium Carbonate*

---

### Gen 4 — Extreme States (8 + 1 optional = 8–9)

47. Uranium  
48. Yttrium  
49. Hydrogen Plasma  
50. Reactive Plasma Core  
51. Synthetic Diamond  
52. Metallic Hydrogen  
53. Ceramic Superconductor  
54. Nuclear Fuel Pellet  
55. Hydrazine (?)  

*Cut from v2.0: Magnesium Diboride, Niobium-Titanium Alloy, Rhenium Superalloy*

---

### Gen 5 — Cosmic Alchemy (14)

56. Deuterium  
57. Tritium  
58. Helium-3  
59. Fusion Plasma  
60. Liquid Helium  
61. Bose-Einstein Condensate  
62. Positron  
63. Antiproton  
64. Antihydrogen  
65. Stellar Core Fragment  
66. Event Horizon Condensate  
67. Strange Quark Condensate  
68. Dark Matter Proxy  
69. Quantum Foam Lattice  

*Cut from v2.0: Lithium Deuteride*

---

### Gen 6 — Reality Manipulation (8)

70. Prima Materia  
71. Philosopher's Stone  
72. Aether  
73. Neutron Glass  
74. Void Crystal  
75. False Vacuum Seed  
76. Chrono Dust  
77. Dark Matter Crystal  

*(77 total with all Gen 3–4 optionals. Gen 2 is now fully locked at 13 — no Gen 2 optionals remain.)*

---

## 3. Optional Cuts to Reach a Smaller Universe

Gen 2 is now locked at 13. Remaining optionals are all in Gen 3 and Gen 4. If the reaction designer needs a smaller universe for v1 scope, these are the available cuts:

| # | Cut | Gen | Impact | Safe to cut? |
|---|---|---|---|---|
| 1 | **Carbon Fiber** | 3 | Graphene covers Gen 3 advanced carbon. No emotional gap. | Yes — graphene is stronger |
| 2 | **Benzene** | 3 | Nylon synthesis changes to `methane + nitric_acid → nylon`. Less authentic but functional. | Yes — nylon survives |
| 3 | **Pig Iron** | 3 | Steel synthesis becomes `iron_oxide + carbon + quicklime → steel` directly. One step, richer convergence. | Yes — steel is the milestone, pig iron is not |
| 4 | **Hydrazine** | 4 | Thin Gen 5 downstream. Flavor substance only. | Yes — purely optional |

**Cutting all 4 brings total to 73.** Cutting Benzene and Pig Iron (the weakest pair) brings total to 75 — the upper bound of the target range.

**Do not cut Tin.** Bronze must require two metals. The convergence is the point.

---

## 4. Generation Identity Refinement

Each generation must FEEL different to the player. Not just a different set of substances — a different *mode of play*, a different emotional register, a different relationship with the reactor.

### Gen 1 — The Laboratory

**Emotional register:** Discovery. Curiosity. Control.  
**What the player feels:** "I understand what I'm making. Everything here is real."  
**Reactor character:** Precise, clean. Every synthesis is familiar — the reactor is a powerful tool doing recognizable things.  
**Player relationship:** Master of fundamentals. The names are textbook names and that is the point — familiarity is the fantasy at this stage.  
**Design goal:** Every Gen 1 substance should feel like a *correct* thing to synthesize. The player should feel smart, not lost.  
**Tone signal:** Hint text is factual. Discovery messages reference real-world uses. Colors are clean — blue, white, amber.

---

### Gen 2 — The Workshop

**Emotional register:** Craft. Heat. Danger. First mastery.  
**What the player feels:** "I am building the foundations of serious synthesis."  
**Reactor character:** Industrial. Multi-reactant syntheses dominate. The reactor is managing conditions — heat, pressure, reactive chemistry — not just combining atoms.  
**Three phases within Gen 2:**  
- *The Foundry* (Copper, Tin, Gold, Nickel, Bronze): smelting, alloying, ancient craft. The first convergence synthesis. Bronze is the milestone that names the phase.  
- *The Chemical Works* (Sulfuric Acid, Nitric Acid, Quicklime): dangerous, reactive, industrial. The reactor produces things that burn and dissolve. Quicklime feeds the steel furnace. Nitric acid feeds the polymer chain.  
- *The Materials Bench* (Quartz, Soda Ash, Silicon, Calcium, Lithium): the workshop becomes a laboratory. Quartz gates glass and doped silicon. Silicon and Lithium point forward — by the time you have both, Gen 3 feels imminent.  
**Player relationship:** The first time the player feels like a *manufacturer* rather than a *chemist*. Bronze, sulfuric acid, soda ash — these are foundry and workshop substances.  
**Design goal:** Gen 2 should feel like the end of the familiar world and the beginning of something more serious.  
**Tone signal:** Hint text shifts from "you know this" to "you are building toward something." Discovery of gold should feel like a small prestige event.

---

### Gen 3 — The Materials Lab

**Emotional register:** Precision. Wonder. Competence becoming expertise.  
**What the player feels:** "I'm making things that don't exist yet — or barely exist."  
**Reactor character:** Complex. Convergence syntheses dominate. The reactor is demanding attention. Steel requires three inputs. Lithium-ion cell requires three separate Gen 3 chains converging.  
**Player relationship:** The player is no longer making things they recognize — they are making things they have *heard about*. Graphene. Nanotube. These are the substances of scientific press releases.  
**Design goal:** Gen 3 is where the game earns its scientific credibility. The escalation from workshop to materials lab must feel earned.  
**Tone signal:** Hint text becomes technical-poetic. "A single atom thick. Stronger than steel. The reactor holds the geometry stable." Discovery messages slow down slightly — the substance deserves a moment.

---

### Gen 4 — The Edge of Physics

**Emotional register:** Tension. Power. Imminence.  
**What the player feels:** "I'm doing things that require extreme conditions. Something bigger is coming."  
**Reactor character:** Unstable. The first plasma states appear. Synthesis conditions (temperature, pressure, radiation) start driving the visuals. The reactor's ambient audio and lighting should shift noticeably in Gen 4.  
**Player relationship:** The player is working at the edge of what real laboratories can do. Metallic hydrogen is real physics, barely achievable. Nuclear fuel pellets are not household items.  
**Design goal:** Gen 4 should feel like the last gasp of earthbound science. After nuclear fuel pellets and reactive plasma core, the player should feel the threshold — Gen 5 is going to be different.  
**Tone signal:** Hint text becomes more restrained. "The reactor stabilizes the lattice under pressure we cannot measure." Discovery messages acquire weight. Ceramic Superconductor: "resistance collapses to zero at 93 Kelvin. The reactor holds it there."

---

### Gen 5 — The Cosmos

**Emotional register:** Awe. Isolation. The scale of things.  
**What the player feels:** "I am making things that exist inside stars and at the boundary of the universe."  
**Reactor character:** The reactor is no longer a tool — it is a phenomenon. Gen 5 syntheses should look and sound different. The 3D scene should shift in character. Antihydrogen should visually annihilate on synthesis. BEC should be visually strange — matter that is colder than deep space.  
**Player relationship:** The player's relationship with the reactor becomes reverent. They are not manufacturing. They are witnessing.  
**Design goal:** Gen 5 should feel genuinely vast. The names must carry that — Stellar Core Fragment, Event Horizon Condensate, Antihydrogen. These are words from physics papers, not chemistry textbooks.  
**Tone signal:** Hint text becomes sparse, evocative. "The BEC forms at 170 nanokelvin. Quantum behavior becomes visible to the naked eye." Discovery messages for Gen 5 milestones should be one-sentence statements of scale. "The reactor synthesized antihydrogen. For 38 milliseconds, it held antimatter in suspension."

---

### Gen 6 — The Myth

**Emotional register:** Myth. Weight. Finality.  
**What the player feels:** "These names are from another tradition entirely. The reactor is doing something that should not be possible."  
**Reactor character:** The reactor is a legend. Gen 6 synthesis should feel rare and theatrical. The Philosopher's Stone must be a moment the player closes the laptop and thinks about.  
**Player relationship:** The player is no longer a scientist — they are an alchemist. The vocabulary has crossed from physics into classical philosophy: Prima Materia, Aether, Void Crystal. The scientific adjacency is real, but the emotional register is mythic.  
**Design goal:** Gen 6 must justify the entire arc that preceded it. Every Gen 1–5 substance contributed to this. The Dark Matter Crystal is the answer to all of them.  
**Tone signal:** Hint text is minimal. When it speaks, it uses the language of classical alchemy — not parody, but as if the alchemists were right. "Prima Materia: the undifferentiated substance from which all matter arises. The reactor found it at the intersection of four Gen 5 chains." Discovery messages for Gen 6 substances should feel like ending chapters, not item unlocks.

---

## 5. Strongest Substances — The 30 Spine Substances

These substances must survive every future compression pass, balance revision, and scope cut. They are the skeleton of the game.

| # | Substance | Gen | Why It Is Irreplaceable |
|---|---|---|---|
| 1 | Hydrogen | 1 | Origin of all synthesis chains. |
| 2 | Carbon | 1 | Graphene, diamond, nanotube, pig iron — everything flows from carbon. |
| 3 | Oxygen | 1 | Combustion, oxidation, synthesis reagent everywhere. |
| 4 | Iron | 1 | Steel chain gateway. |
| 5 | Water | 1 | Half the syntheses in the game use water as a reagent. |
| 6 | Salt | 1 | Gen 2 convergence: sodium + chlorine. Iconic. |
| 7 | Ammonia | 1 | Multiple Gen 2 gateway reactions. |
| 8 | Iron Oxide | 1 | Steel chain. |
| 9 | Bronze | 2 | First alloy. Gen 2 milestone. |
| 10 | Sulfuric Acid | 2 | Chemical industry backbone. Multi-reactant synthesis milestone. |
| 11 | Gold | 2 | Gen 2 prestige anchor. |
| 12 | Quartz | 2 | Glass chain, doped silicon chain — double gateway. |
| 13 | Steel | 3 | Gen 3 tier unlock. Most iconic manufactured material in history. |
| 14 | Graphene | 3 | Wonder material. Gen 3 advanced carbon anchor. |
| 15 | Nanotube | 3 | Gen 3 advanced carbon finale. |
| 16 | Nylon | 3 | Sole polymer milestone. |
| 17 | Doped Silicon | 3 | Electronics anchor. Feeds lithium-ion cell. |
| 18 | Glass | 3 | Familiar, beautiful, necessary. |
| 19 | Lithium-Ion Cell | 3 | Three-chain convergence. Gen 3 finale. |
| 20 | Reactive Plasma Core | 4 | Gen 4 tier milestone. Automation thematic trigger. |
| 21 | Metallic Hydrogen | 4 | Fantasy weight 5. Gen 4 prestige anchor. |
| 22 | Nuclear Fuel Pellet | 4 | Gen 5 gate. Load-bearing. |
| 23 | Fusion Plasma | 5 | Gen 5 energy milestone. |
| 24 | Antihydrogen | 5 | Gen 5 antimatter milestone. Screenshot moment. |
| 25 | Bose-Einstein Condensate | 5 | Fantasy weight 5. Named from physics history. |
| 26 | Stellar Core Fragment | 5 | "You are holding something from inside a neutron star." |
| 27 | Event Horizon Condensate | 5 | Gen 5 finale and Gen 6 gate. |
| 28 | Prima Materia | 6 | Gen 6 input base. Alchemical anchor. |
| 29 | Philosopher's Stone | 6 | Unlocks transmutation_mythic. The one. |
| 30 | Dark Matter Crystal | 6 | Final substance. Game's terminus. |

---

## 6. Remaining Weak Substances — Survived on Chain Value Only

These substances pass the chain-value test but fail or barely pass the fantasy weight test. They are in the game because something needs to feed something else — not because any player will be excited to make them. Watch these in reaction design.

| Substance | Gen | FW Level | Why It Stayed | Risk |
|---|---|---|---|---|
| Nitrogen | 1 | 3 | Ammonia gateway | Textbook. Mitigate with hint text that emphasizes its cosmic abundance. |
| Sodium | 1 | 3 | Salt gateway | Invisible element. The discovery of salt (not sodium) is the emotional moment. |
| Chlorine | 1 | 3 | Salt gateway | Same as sodium. The synthesis of salt is the milestone. |
| Sulfur | 1 | 3 | H₂SO₄ multi-reactant reagent | Sulfur alone is not exciting. The sulfuric acid synthesis is the moment. |
| Calcium | 2 | 3 | Quicklime → pig iron / glass | Industrial. Hint text should invoke masonry and metallurgy. |
| Silicon | 2 | 3 | Quartz → doped silicon gateway | The element itself is Level 2; Quartz rescues the chain. |
| Tin | 2 | 3 | Bronze input | Survives only while bronze requires it. If bronze simplifies, cut. |
| Nickel | 2 | 2 | Stainless steel input | Level 2 name. Mitigate by making stainless steel synthesis feel significant. |
| Titanium | 3 | 4 | Titanium alloy chain | Solid. Name is iconic enough. No intervention needed. |
| Chrome | 3 | 3 | Stainless steel + titanium alloy | The rename from "chromium" lifts this to Level 3. |
| Boron | 3 | 3 | Borosilicate + boron-doped silicon | Obscure element but load-bearing. Hint: "the lightest element that forms a covalent network." |
| Tungsten | 3 | 3 | Tungsten carbide | Known for being the hardest metal. Hint text should lead with that. |
| Yttrium | 4 | 2 | Ceramic superconductor input | Level 2 element. Mitigate by making the ceramic superconductor synthesis feel significant. |
| Hydrogen Plasma | 4 | 3 | Reactive plasma core input | The word "plasma" does a lot of work here. |
| Uranium | 4 | 4 | Nuclear chain | Has genuine cultural weight. Handle with care in hint text. |
| Positron | 5 | 4 | Antimatter chain | Strong name. The chain dependency (nuclear fuel pellet → positron) is interesting. |
| Antiproton | 5 | 4 | Antimatter chain | Real physics. Level 4 — just below antihydrogen. |
| Strange Quark Condensate | 5 | 4 | Gen 5 exotic chain | "Strange quark" is the real physics name for that quark flavor. |
| Dark Matter Proxy | 5 | 4 | Gen 5 dark matter chain | "Proxy" is honest and interesting — we approximate, we do not capture. |

---

## 7. Pre-Reaction-Design Checklist

Before beginning the reaction graph, verify:

### Substance Checklist
- [ ] Canonical rename table applied in substance-universe.md v3.0 (Quartz, Quicklime, Soda Ash, Buckyball, Chrome, Ceramic Superconductor, Synthetic Diamond, Nanotube)
- [ ] Optional substances (Tin, Nickel, Pig Iron, Carbon Fiber, Benzene, Hydrazine) given final keep/cut decision with documented downstream justification
- [ ] Hydrogen Peroxide: downstream confirmed or cut before v3.0 locks
- [ ] Total substance count finalized (target: 70–75)

### Chain Completeness Checks
- [ ] Every Gen 3 substance has at least one upstream dependency confirmed in Gen 1 or Gen 2
- [ ] Every Gen 4 substance has at least one upstream dependency confirmed in Gen 1–3
- [ ] Every Gen 5 substance has at least one upstream dependency in Gen 1–4 (no orphan Gen 5 substances)
- [ ] Every Gen 6 substance has at least two upstream dependencies in Gen 5 (convergence requirement)
- [ ] The Philosopher's Stone synthesis requires ≥2 Gen 5 inputs
- [ ] The Dark Matter Crystal synthesis requires ≥3 substances (multi-chain convergence)

### Invisible Intermediate Audit
- [ ] Carbon monoxide: confirmed absorbed into pig iron / steel synthesis (not in inventory)
- [ ] Sulfur dioxide / trioxide: confirmed absorbed into H₂SO₄ multi-reactant synthesis
- [ ] Nitric oxide / nitrogen dioxide: confirmed absorbed into HNO₃ multi-reactant synthesis
- [ ] Phosphoric acid: confirmed cut (no inventory slot)
- [ ] Pure silicon: confirmed cut (Quartz → Doped Silicon synthesis uses dopant as reagent)
- [ ] Lithium carbonate: confirmed cut (lithium-ion cell synthesizes from lithium directly)
- [ ] Ethylene: confirmed cut (no downstream after polyethylene cut)
- [ ] Coke: confirmed cut (carbon serves as the carbon reagent in pig iron synthesis)

### Multi-Reactant Synthesis Requirements
The following substances MUST become multi-reactant synthesis milestones (not single-input chains):
- [ ] **Salt:** `sodium + chlorine → salt`
- [ ] **Sulfuric Acid:** `sulfur + oxygen + water → sulfuric_acid` (conditions: high temperature)
- [ ] **Nitric Acid:** `nitrogen + oxygen + water → nitric_acid` (conditions: high temperature, catalyst)
- [ ] **Bronze:** `copper + tin → bronze` (or `copper → bronze` if tin is cut)
- [ ] **Pig Iron** (if kept): `iron_oxide + carbon + quicklime → pig_iron`
- [ ] **Steel:** `pig_iron + carbon → steel` (or `iron_oxide + carbon + quicklime → steel` if pig iron cut)
- [ ] **Doped Silicon:** `quartz + boron → doped_silicon (p-type)` or `quartz + phosphorus → doped_silicon (n-type)`
- [ ] **Glass:** `quartz + soda_ash → glass`
- [ ] **Nylon:** `benzene + nitric_acid → nylon` (or simplified recipe)
- [ ] **Lithium-Ion Cell:** `lithium + doped_silicon + graphene → lithium_ion_cell` (three-chain convergence)
- [ ] **Ceramic Superconductor:** `yttrium + copper + oxygen → ceramic_superconductor` (conditions: extreme cold)
- [ ] **Antihydrogen:** `positron + antiproton → antihydrogen` (conditions: ultra-high vacuum, extreme cold)
- [ ] All Gen 6 substances: minimum 2 inputs, convergence from different Gen 5 chains

### Reaction Type Coverage
- [ ] `plasma_synthesis` reaction type defined and used for all plasma-state syntheses
- [ ] `transmutation_mythic` reaction type defined, gated behind Philosopher's Stone, documented
- [ ] Reaction types reviewed: standard_synthesis, plasma_synthesis, transmutation_mythic — confirm no legacy biology types remain

### Tonal Integrity
- [ ] Gen 1–2 hint text is factual and grounded (no mythic language)
- [ ] Gen 3–4 hint text is technical-poetic (elevated but not mythic)
- [ ] Gen 5 hint text is evocative and scale-focused (awe without explaining)
- [ ] Gen 6 hint text is minimal and uses alchemical vocabulary
- [ ] Gen 6 discovery messages feel like chapter endings, not item unlocks

### Economy Fields (Separate Axes)
- [ ] `atomCreationCost` set independently of `energyDensity` — not derived from it
- [ ] `energyDensity` set independently of `shardValue`
- [ ] Gen 6 `shardValue` is exponentially higher than Gen 5 (scarcity must be felt in economy)
- [ ] Automation availability decreases per generation — Gen 6 substances cannot be automated

---

## 8. Final Recommendations Before Reaction Graph Design

1. **Lock substance-universe.md v3.0 first.** Apply all compression decisions, renames, and optional-cut decisions before writing a single reaction. The reaction graph will be shaped by the substance list — do not design reactions for substances that might be cut.

2. **Design the steel chain first.** Iron oxide → [pig iron →] steel → stainless steel → titanium alloy is the structural spine of Gen 3. Its multi-reactant synthesis design will set the template for all other Gen 3 chains.

3. **Design the Gen 5 finale last.** The Event Horizon Condensate synthesis and the Gen 6 Prima Materia synthesis are the two highest-stakes reactions in the game. Design them after all upstream reactions are locked.

4. **Treat invisible-intermediate merges as design opportunities.** Every collapsed intermediate is an opportunity to add a reagent. `sulfur → sulfuric_acid` (boring) becomes `sulfur + oxygen + water → sulfuric_acid` (three inputs, more interesting). Use the collapse to increase convergence everywhere possible.

5. **The Philosopher's Stone must feel unlike any other reaction.** It is not a three-input synthesis that takes fifteen minutes. It is a ritual. Consider: special animation, unique synthesis conditions (multiple Gen 5 substances converging), a distinct sound. It unlocks `transmutation_mythic` — that unlock should feel like a door opening, not a crafting recipe completing.

6. **Resist adding substances during reaction design.** The compression work here is fragile. Every new substance added during reaction design must pass the fantasy weight test and must not create a new invisible intermediate. Add one, cut one.

7. **The Reality Gradient is a design constraint, not a style choice.** Gen 1 reactions must look and feel different from Gen 6 reactions. This is not theming — it is player communication. A Gen 6 reaction that looks like a Gen 1 reaction has failed to communicate that the player has reached something extraordinary.
