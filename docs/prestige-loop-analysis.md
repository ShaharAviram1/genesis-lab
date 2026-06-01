# Genesis Lab — Prestige Loop Analysis

**Status:** Analysis document — no implementation, no schema changes, no design doc modifications.
**Date:** 2026-06-01
**Purpose:** Understand the full prestige loop before any prestige branch is implemented.

---

## Part 1 — Current Progression Analysis

### Progression Path

The full progression from start to Tier 12 passes through four generation layers, each with a distinct pacing character.

---

#### Gen 1 — Tiers 0–3 (Elements and Basic Chemistry)

**Substances:** 18 total (9 base elements, 3 basic gases, 6 compounds)

**Milestones:**
- Tier 0 → 1: Water (H₂ + O) — the first stable compound, instant reaction
- Tier 1 → 2: Salt (Na + Cl) — the first mineral
- Tier 2 → 3: Iron Oxide (Fe + O₂) — opens the Gen 2 foundry

**Pacing:** Gen 1 reactions are 0–3 seconds. The bottleneck here is not time — it is energy and discovery. Players are clicking atoms and learning the reaction graph. The three tier gate substances (Water, Salt, Iron Oxide) are discoverable quickly because the hint system guides them.

**Bottlenecks:**
- First-time discovery: the hint system helps, but players must experiment to find reactions not marked `discoveredByDefault`.
- Early energy scarcity: atom clicking produces small energy amounts. Gen 1 reaction costs (1–8 energy) are modest but felt at start.
- Iron Oxide requires 3s wait — the first time a player encounters any reaction time at all.

**Progression speed:** Fast. A player completing Gen 1 for the first time spends ~10–20 minutes here. On a repeat run, Gen 1 can be cleared in under 5 minutes.

---

#### Gen 2 — Tiers 3–7 (The Foundry and Chemical Works)

**Substances:** 13 total (metals, acids, silicates, lithium)

**Milestones:**
- Tier 3 → 4: Copper — first smelted metal, unlocks alloy path
- Tier 4 → 5: Bronze — first alloy, shardValue 2
- Tier 5 → 6: Nickel — ammonia leaching path, unlocks advanced alloys
- Tier 6 → 7: (progression through silicon and quartz chain)
- Lithium at Tier 7: 30s reaction, the first significant single-reaction wait

**Reaction times:** 8–30 seconds.

**Pacing:** Gen 2 is where pacing first becomes tangible. Copper Smelting (8s), Tin Reduction (8s), and Bronze Alloying (12s) create a rhythm of "queue, wait, queue." The dependency chains deepen: Bronze requires Copper (from Iron Oxide + Sulfur) and Tin (from Iron Oxide + Carbon). Players must stock multiple intermediates simultaneously.

**Bottlenecks:**
- Single queue slot: only one reaction can process at a time. At 8–30 second reactions, this is frequent enough to notice but not frustrating.
- Multi-input reactions require holding multiple substance stockpiles.
- Lithium Isolation (30s, from salt + hydrogen_gas) is the first reaction where the wait crosses the "it feels slow" threshold.
- Gold requires iron + water at 25s and needs Tier 6 — deep into the Gen 2 chain.

**Capability unlocks in Gen 2:**
- `high_pressure` — from Ammonia (Gen 1 compound, available early)
- `catalyst` — from Nitric Acid (Tier 4)

**Progression speed:** Moderate. First run: 1–3 hours. Repeat run with prestige multipliers: 20–60 minutes.

---

#### Gen 3 — Tiers 6–10 (The Materials Lab)

**Substances:** 9 total (advanced structural and electronic materials)

**Milestones:**
- Tier 6 → 7: Steel (Fe×3 + C, 45s) — the first 3-minute-class synthesis chain
- Tier 7 → 8: Chrome (Fe₂O₃×2 + H₂SO₄, 45s) — acid-based metal extraction
- Tier 8 → 9: Graphene (C×3 + CH₄, 90s) — the Gen 4 gateway material
- Tier 9 → 10: Lithium Ion Cell (Li×2 + Graphene + Doped Silicon, 180s) — 3-minute synthesis

**Reaction times:** 45–180 seconds.

**Pacing:** Gen 3 is where the game's pacing character fully reveals itself. Reactions take 1–3 minutes. With a single queue slot, a player making Stainless Steel (90s, requires Steel×2 + Chrome + Nickel) is committing the reactor for 90 seconds per unit — while needing to pre-produce Steel (45s ×2) and Chrome (45s) and Nickel (20s). The dependency graph becomes wide and deep simultaneously.

**Capability unlocks in Gen 3:**
- `high_temperature` — from Steel (Tier 6)
- `vacuum` — from Graphene (Tier 8)
- `radiation_bombardment` — from Doped Silicon (Tier 9)
- `extreme_pressure` — from crossing Tier 7
- `extreme_temperature` — from crossing Tier 8

**Bottlenecks:**
- The Stainless Steel dependency chain is the first multi-hour bottleneck: Steel requires iron×3 + carbon in two passes; Chrome requires iron_oxide×2 + sulfuric_acid; Nickel requires iron_oxide + ammonia (20s, Tier 5). A player making a single Stainless Steel must queue 5–7 reactions across 10+ minutes of clock time.
- Lithium Isolation (30s) produces one Lithium per synthesis. The Lithium Ion Cell requires Lithium×2 — that's two 30-second Lithium runs before even starting the 180-second assembly.
- Doped Silicon (silicon×2 + gold, 90s) gates the electronics track. Gold requires its own 25-second synthesis from iron + water. Silicon requires carbon×2 + iron_oxide (20s).
- The single queue slot means every dependency must be resolved sequentially.

**Progression speed:** Slow to very slow. First run: 6–15 hours of intermittent active play. Repeat run with strong prestige multipliers: 2–5 hours.

---

#### Gen 4 — Tiers 9–12 (The Edge of Physics)

**Substances:** 8 total (plasma, exotic composites, nuclear, quantum materials)

**Milestones:**
- Tier 9: First Gen 4 access. `plasma_state` and `extreme_cold` capabilities unlock simultaneously.
- Tier 9 → 11: Hydrogen Plasma (H, 180s, conditions: plasma_state + extreme_temperature) → Metallic Hydrogen (180s → but wait, H⁺, 720s extreme_pressure)
- Tier 10 → 11: Ceramic Superconductor (Glass + Doped Si, 360s, extreme_cold)
- Tier 11 → 12: Nuclear Fuel Pellet (Metallic H + Stainless Steel, 720s, extreme_pressure + radiation_bombardment)
- Tier 12 capstones: Reactive Plasma Core (900s), Quantum Substrate (900s)

**Reaction times:** 180–900 seconds (3–15 minutes per synthesis).

**Pacing:** Gen 4 is a different game. The single-slot reactor becomes the dominant constraint. A 900-second Reactive Plasma Core assembly means the reactor is locked for 15 minutes. During that time, nothing else can be queued. The player must choose carefully what to produce first because each choice costs real minutes.

Gen 4 has four parallel synthesis tracks that must be managed:
- **Plasma track:** Hydrogen → Hydrogen Plasma (180s) → into Reactive Plasma Core and Metallic Hydrogen
- **Cold track:** Glass + Doped Silicon → Ceramic Superconductor (360s) → Cryogenic Matrix (540s)
- **Structural track:** Aramid Fiber + Carbon Nanotube → Ballistic Composite (270s)
- **Nuclear track:** Metallic Hydrogen + Stainless Steel → Nuclear Fuel Pellet (720s) → Tier 12 gate

These tracks are independent but converge at the capstones. A player who doesn't know the convergence points may produce the wrong thing at the wrong time and wait idle while the reactor processes an intermediate they don't yet need.

**Bottlenecks:**
- **Metallic Hydrogen:** 720 seconds per unit. Requires one unit for Nuclear Fuel Pellet, one for Quantum Substrate. Two syntheses = 24 minutes of reactor time just for this one intermediate.
- **Nuclear Fuel Pellet:** 720 seconds, gates Tier 12 access. The prerequisite for all Tier 12 capstones.
- **Single queue slot:** At Gen 4 timescales, the 1-slot constraint means players spend significant clock time waiting with nothing to do.
- **Energy cost at Gen 4:** 100–500 energy per reaction. Even with prestige multipliers, players must maintain significant energy reserves across 15-minute production cycles.

**Progression speed:** Very slow. A first run reaching Tier 12 requires days of intermittent play. A seasoned run with full multiplier upgrades: 10–20 hours.

---

### Summary: Where Progression Slows

| Transition | Primary bottleneck |
|---|---|
| Gen 1 → Gen 2 | Discovery, minor energy |
| Early Gen 2 | First real reaction times (8–30s), energy demand |
| Gen 2 → Gen 3 | Deep dependency chains, Lithium synthesis |
| Mid Gen 3 | Stainless Steel chain, parallel material preparation |
| Gen 3 → Gen 4 | Capability unlocks (substance-gated), single queue slot cost |
| Gen 4 progression | 3–15 minute reaction times, single queue slot |
| Tier 12 capstones | 15-minute synthesis × multiple needed, highest energy costs |

The game's pacing is not uniform. It accelerates at the start of each generation (new reactions feel accessible) then decelerates sharply as dependency chains widen. The sharpest deceleration points are: the Stainless Steel chain (Gen 3), the Gen 3 → Gen 4 capability gate, and Metallic Hydrogen production (Gen 4).

---

## Part 2 — Wall Identification

### Wall 1 — Energy Wall

**What it is:** The player cannot perform reactions because they lack sufficient energy. Energy is earned passively via WebSocket session activity and atom clicks. Gen 4 reactions cost 100–500 energy each.

**When it appears:** Always present, but becomes significant around Gen 3 where individual reactions cost 30–70 energy and the pace of energy regeneration may not match demand.

**Currently exists:** Yes. Partially mitigated by the energy prestige upgrade (multiplier stacks linearly, uncapped).

**Gets worse over repeated runs:** No — the energy wall softens with each Big Bang due to the energy multiplier. Run 1 is the hardest energy run. By run 5 with energy level ~5 (2.0x multiplier), energy is noticeably less constrained.

---

### Wall 2 — Material Wall

**What it is:** The player cannot start a reaction because they lack the required quantity of reactants. In Gen 3–4, reaction chains require multiple units of mid-tier intermediates as inputs.

**When it appears:** Becomes significant in Gen 3 where reactions require 2–4 intermediates that each require their own synthesis chains.

**Currently exists:** Yes. Mitigated by matter and chemistry prestige multipliers (reduce reactant costs and energy costs respectively).

**Gets worse over repeated runs:** No — cost reductions from prestige make the material wall softer. However, prestige multipliers cap at level 20 (100% reduction to the Math.max floor), so this wall eventually reaches a floor rather than vanishing entirely.

---

### Wall 3 — Time Wall

**What it is:** The player cannot make the game progress faster regardless of their resource position. Reaction durations are fixed server-side. A 900-second synthesis takes 15 minutes no matter how many Big Bangs a player has completed.

**When it appears:** Felt beginning in Gen 3 (45–90s reactions). Dominant in Gen 4 (180–900s reactions). By Tier 12, every meaningful synthesis costs 5–15 real minutes.

**Currently exists:** Yes. No prestige upgrade touches reaction time in any way.

**Gets worse over repeated runs:** Yes — subjectively, it gets worse. On run 1, long reaction times carry novelty. On run 10, a 15-minute Reactive Plasma Core synthesis is a frustrating mandatory wait the player has done many times. The same clock time feels longer when the content is familiar.

---

### Wall 4 — Queue Wall

**What it is:** `MAX_SLOTS = 1` in `server/routes/reactions.js`. The reactor can only process one reaction at a time. This serializes every synthesis step. In Gen 4, this means that producing even a single Reactive Plasma Core requires sequential execution of 10+ reactions, each 3–15 minutes long.

**When it appears:** Always present, but tolerable in Gen 1–2 (reactions are short). Becomes a dominant constraint in Gen 3 and above.

**Currently exists:** Yes. No mechanism exists to expand queue capacity.

**Gets worse over repeated runs:** Yes — the single slot is an objective bottleneck at Gen 4 timescales. More runs means more familiarity with the parallel track structure and more awareness of how much time the slot constraint wastes. An experienced player knows exactly which reactions they want to parallelize; not being able to is felt as friction rather than challenge.

---

### Wall 5 — Capability Wall

**What it is:** Nine reactor capabilities must be unlocked in sequence each run. Capabilities are cleared on Big Bang. The unlock path requires producing specific substances and crossing specific tiers, creating a fixed re-unlock sequence every run.

**Capability chain (per run):**
1. `high_pressure` — from Ammonia (Gen 1, early)
2. `catalyst` — from Nitric Acid (Gen 2, Tier 4)
3. `high_temperature` — from Steel (Gen 3, Tier 6)
4. `vacuum` — from Graphene (Gen 3, Tier 8)
5. `radiation_bombardment` — from Doped Silicon (Gen 3, Tier 9)
6. `extreme_pressure` — from crossing Tier 7
7. `extreme_temperature` — from crossing Tier 8
8. `plasma_state` — from crossing Tier 9
9. `extreme_cold` — from crossing Tier 9

**When it appears:** Every Big Bang. Each new run forces the entire capability sequence from scratch.

**Currently exists:** Yes. No prestige upgrade shortens or skips any capability re-unlock.

**Gets worse over repeated runs:** Yes — significantly. On run 1, unlocking each capability is a discovery and feels earned. On run 5, it is a known sequence. On run 10, it is a mandatory chore with no mechanical acknowledgment that the player has done it before. The capability wall is the most psychologically costly wall for repeat players because it adds no new information or decision-making while consuming real time.

---

### Wall 6 — Discovery Wall

**What it is:** The player doesn't know which reactions exist. New reactions must be discovered by attempting combinations. The hint system nudges players toward correct combinations but does not reveal them.

**When it appears:** Run 1 only, throughout Gen 1–3. Gen 4 reactions are gated by capabilities so they can't be accidentally discovered before the player is ready.

**Currently exists:** Yes — by design on run 1. For repeat runs, this wall effectively does not exist because the player has already discovered all reactions.

**Gets worse over repeated runs:** The inverse — this wall disappears after run 1. Knowledge carries over in the player's head, and `reactionLog` persists through Big Bang to confirm prior discoveries.

---

### Wall 7 — Complexity Wall

**What it is:** The player can't keep track of what to make next. Gen 4 has four parallel synthesis tracks that converge at Reactive Plasma Core and Quantum Substrate. The optimal production order requires planning 8–12 steps ahead to avoid wasted reactor time.

**When it appears:** Gen 4 entry. Manageable in Gen 1–3 because chains are mostly linear or have few branches.

**Currently exists:** Yes — this is the UI/UX expression of the queue constraint. Even if you know all reactions, managing a single queue slot across four parallel tracks requires careful sequencing.

**Gets worse over repeated runs:** Softens — experienced players learn the correct production order. But it never fully disappears because the single slot makes even optimal sequencing a multi-hour endeavor.

---

### Wall 8 — Knowledge Wall

**What it is:** The player doesn't know the game's systems — which substances unlock which capabilities, which tier gates what, what the optimal progression path is.

**When it appears:** Run 1 only. Closely related to the Discovery Wall but broader: includes tier gating, capability unlock triggers, reaction dependency graphs.

**Currently exists:** Yes — by design on run 1.

**Gets worse over repeated runs:** No — it disappears. By run 2, a player understands the system well enough to optimize their path.

---

### Wall Summary Table

| Wall | Present | Gets Worse Each Run | Currently Addressed by Prestige |
|---|---|---|---|
| Energy | Yes | No (softens) | Yes — energy multiplier |
| Material | Yes | No (softens) | Yes — matter/chemistry multipliers |
| Time | Yes | Yes (subjectively) | No |
| Queue | Yes | Yes (subjectively) | No |
| Capability | Yes | Yes (significantly) | No |
| Discovery | Yes (run 1 only) | No (disappears) | N/A |
| Complexity | Yes | No (softens) | No |
| Knowledge | Yes (run 1 only) | No (disappears) | N/A |

The pattern is clear: prestige currently addresses only the walls that naturally soften on their own. The walls that get worse over repeated runs — Time, Queue, Capability — are entirely unaddressed.

---

## Part 3 — Prestige Philosophy

### What Is the Purpose of Big Bang?

Big Bang is not a reset. It is a reconfiguration. The player chooses to destroy their current run's state in exchange for a permanent shift in how future runs will play out.

This framing matters because it sets the bar for what Big Bang must deliver: if a player cannot answer "what will be meaningfully different next time," they will not choose to prestige.

### What a Good Prestige Loop Should Accomplish

In Genesis Lab specifically, prestige should accomplish four things:

**1. Make familiar territory go faster.**
The player knows Gen 1–3. They have done it. Prestige should reward that knowledge by compressing the time cost of content they've already mastered. This is not about making the game trivial — it is about matching the pacing to the player's familiarity. A run 10 Gen 1 experience should be noticeably faster than a run 1 Gen 1 experience. If it feels identical, prestige has failed.

**2. Open content that was previously locked.**
Some things should not be reachable without prestige. Not because they are physically inaccessible, but because the resource requirements or conditions make them economically unrealistic on a first run. Prestige should function as the key that makes previously impossible territories accessible.

**3. Create permanent decisions with lasting identity.**
Each Big Bang should leave a permanent mark on the player's reactor that shapes how all future runs will play. Prestige upgrades should not just be numerical multipliers — they should create different play styles. A player who invests in the Automation branch plays differently than a player who invests in Reaction Acceleration. Both have permanently different reactors.

**4. Preserve meaningful difficulty at the frontier.**
Prestige should never solve the frontier. The newest content in the game — whatever the current edge is — should remain genuinely challenging regardless of prestige level. If prestige makes everything trivial, there is nothing to play toward.

### What Prestige Should Not Be

- A "make numbers bigger" system without strategic depth
- A full reset that asks the player to replay identical content indefinitely
- A system where the prestige choice is obvious (always buy X first)
- A system that makes Gen 4's Time Wall worse by making everything else trivially faster by comparison

---

## Part 4 — Reference Analysis: Egg Inc

### Why Prestige Works in Egg Inc

Egg Inc uses Soul Eggs as its prestige currency, earned at Big Bang (upgrading to a better egg). The question is not what the mechanics are — it is why the loop creates sustained motivation.

**Walls in Egg Inc:**
- **Income wall** — farm generates currency, and the farm's output caps based on chicken count × egg value.
- **Time wall** — chickens take time to run from hatch to nest, and this cannot be meaningfully compressed without Prestige Soul Egg bonuses.
- **Hab capacity wall** — habs have maximum occupancy; expanding requires farm progression.
- **Research wall** — research is expensive; later research tiers require prestige-level income to afford.
- **Egg value wall** — higher tier eggs multiply all income but require reset to access.

**What prestige solves:**
- Each prestige multiplies all future income by a fixed percentage per Soul Egg. The effect is immediate, permanent, and visible.
- The new egg type has significantly higher base value. The player's early game is materially different because their base income is higher.
- Mission rewards and common research carry over, meaning some infrastructure persists.

**Why players choose to prestige:**
The key insight is that Egg Inc makes the ROI of prestige completely transparent. The game tells you exactly how many Soul Eggs you will earn and exactly what multiplier they will provide. Players can evaluate the trade: "I will earn 1.4x income forever in exchange for resetting now." The decision is informed.

Additionally, prestige in Egg Inc accelerates a wall the player is actively experiencing: income is the primary bottleneck, and Soul Eggs directly multiply income. The player is not buying a solution to a future problem — they are buying relief from the wall they just hit.

**How progression feels after prestige:**
The early game compresses dramatically. A player who has prestige Soul Eggs from a Tier 6 egg reaches Tier 3 content in minutes rather than hours. The game skips past content the player has mastered and delivers them to their frontier faster. This compression is the primary reward of prestige — not the frontier content, but the speed of reaching it.

### Comparison to Genesis Lab

**Principle 1 — Transparent ROI.** Egg Inc's Soul Egg count is visible at all times; the multiplier effect is stated explicitly. Genesis Lab's current prestige system shows upgrade costs and effects but doesn't communicate "if you Big Bang now, you will earn X shards and reach level Y of multiplier." The player cannot easily evaluate the trade before committing.

**Principle 2 — Direct wall relief.** Egg Inc prestige directly solves the income wall, which is the wall that stops the player from progressing. Genesis Lab prestige currently solves the energy wall and material wall — which are walls that naturally soften anyway. It does not solve the Time wall or the Capability wall, which are the walls that stop a repeat player from progressing.

**Principle 3 — Post-prestige compression.** Egg Inc compresses mastered content after prestige. Genesis Lab has no meaningful compression mechanism yet. A run 10 Gen 1 experience is mechanically identical to a run 1 Gen 1 experience.

**Principle 4 — Frontier preservation.** Both games preserve difficulty at the frontier. Egg Inc makes early eggs trivial while keeping the highest tier eggs genuinely challenging. Genesis Lab's design should follow this principle: Gen 1–2 should eventually feel fast, Gen 4 capstones should remain challenging.

**The key difference:** Egg Inc's prestige loop works because the game has a single primary bottleneck (income) and prestige directly solves it. Genesis Lab has multiple bottlenecks, and the current prestige system solves only the ones that least need solving. Before the prestige system can be compelling, it needs to address the bottlenecks players actually experience at the point when they choose to Big Bang.

---

## Part 5 — Which Walls Should Prestige Solve?

### Energy Wall — Category B (Partially Soften)

**Reasoning:** The energy system is already well-designed for prestige. The current energy multiplier does exactly the right thing: it makes each atom click more valuable, scaling linearly with investment. However, the energy wall should never be fully removed — zero-energy starts create a natural early-game rhythm that grounds each run. Prestige should make energy accumulation faster, not eliminate it.

The energy wall should be soft enough by run 5–8 that it is no longer a primary concern, but it should never disappear entirely.

---

### Material Wall — Category B (Partially Soften)

**Reasoning:** The material wall is part of the game's core chemistry loop. Recipes have costs and prerequisites for design reasons. However, the material wall grows less interesting on repeat runs because experienced players know exactly what to produce. Prestige should reduce the friction of maintaining stockpiles — through cost reductions (existing) and eventually through automation — but should not eliminate the need to produce materials at all.

At full prestige, the material wall should be a minor inconvenience rather than a bottleneck.

---

### Time Wall — Category A (Prestige Should Solve It)

**Reasoning:** Reaction time is the dominant unaddressed wall for repeat players. A player who knows all reactions and has sufficient resources is still blocked by the clock. Unlike the energy wall, this wall does not soften on its own — it stays constant regardless of run count.

Prestige must reduce reaction durations meaningfully across runs. This does not mean eliminating reaction time entirely — Gen 4 capstones should still take several minutes on any run. It means that by run 10, a player should spend noticeably less of their life waiting.

The key constraint: reaction time reduction should be bounded. Gen 4 capstone reactions should retain at least 25–33% of their base time even at maximum prestige investment. The frontier must remain hard.

---

### Queue Wall — Category A (Prestige Should Solve It)

**Reasoning:** The single queue slot (`MAX_SLOTS = 1`) is the most mechanically impactful constraint in the late game. It serializes all Gen 4 production. No prestige upgrade addresses it. This is a primary candidate for a prestige branch — not a cheap upgrade, but a major infrastructure investment.

Expanding from 1 to 2 queue slots would compress Gen 4 production time by roughly 40–50% for parallel-track reactions. This is a transformative improvement that feels earned.

Queue expansion should not be trivially cheap. It represents one of the most meaningful capability changes in the game and should require either substantial shard investment or multiple Big Bangs to unlock.

---

### Capability Wall — Category A (Prestige Should Solve It — with limits)

**Reasoning:** Re-unlocking all 9 capabilities every run with no prestige shortcut is the primary source of run 5+ friction. The psychological cost is high because the sequence is known, linear, and contributes nothing new after run 1.

Prestige should offer meaningful shortcuts to the capability sequence. The question is of degree:

- The `high_pressure` and `catalyst` unlocks (Gen 1–2 range) could be permanently granted after a certain investment — the player has clearly mastered this territory.
- The Gen 3 capabilities (`high_temperature`, `vacuum`, `radiation_bombardment`) might be "re-unlocked at a faster rate" — still requiring production but requiring fewer units.
- The Gen 4 capabilities (`extreme_pressure`, `extreme_temperature`, `plasma_state`, `extreme_cold`) should remain gated by tier progression, because reaching those tiers is itself meaningful.

Full capability skip should not be available — it would break the natural progression gate that ensures players are ready for Gen 4 content.

---

### Discovery Wall — Category C (Prestige Should Never Solve It)

**Reasoning:** Discovery is the soul of Gen 1 and the hook of the game. The moment Water is first synthesized or Steel is first produced creates genuine surprise and satisfaction. Prestige should never hand players pre-discovered reactions.

Importantly, this wall solves itself naturally — `reactionLog` persists through Big Bang, and player knowledge persists in the player's mind. There is no need for a prestige system to touch it.

Granting pre-discovered reactions via prestige would eliminate the hook entirely for new players returning after a Big Bang.

---

### Complexity Wall — Category C (Prestige Should Never Solve It)

**Reasoning:** The complexity of managing four parallel Gen 4 tracks is a feature, not a bug. Players who invest in understanding the production order are rewarded with efficient runs. This is meaningful strategic content.

Complexity is already softened by the queue panel and reaction panel UI. Further simplification should come from UI improvements, not from prestige bypassing the complexity.

The Automation branch (eventually) addresses a specific subset of complexity — removing the need to manually queue Gen 1 base element production. But automation should not eliminate decision-making at the Gen 4 level.

---

### Knowledge Wall — Category C (Prestige Should Never Solve It)

**Reasoning:** Knowledge is earned through play and transfers implicitly. Pre-loading a player with knowledge about systems they haven't discovered yet breaks the discovery loop. This wall solves itself and must not be mechanically dismantled.

---

### Wall Classification Summary

| Wall | Category | Reasoning |
|---|---|---|
| Energy | B | Soften, never eliminate. Already partially addressed. |
| Material | B | Soften, never eliminate. Already partially addressed. |
| **Time** | **A** | Must be addressed. Gets worse each run. Currently zero prestige coverage. |
| **Queue** | **A** | Must be addressed. Major Gen 4 constraint. Deserves its own prestige branch. |
| **Capability** | **A** | Must be partially addressed. Mandatory chore by run 5+. Partial shortcuts acceptable; full skip not. |
| Discovery | C | Never address. Self-resolves. Core to the game's identity. |
| Complexity | C | Never address via prestige. UI improvements, not mechanical bypass. |
| Knowledge | C | Never address. Self-resolves through play. |

---

## Part 6 — Multi-Big-Bang Progression Model

This section describes what each stage of the prestige arc should feel like. These are design targets, not predictions of the current system.

---

### First Big Bang

**Trigger point:** Player reaches Tier 9 minimum (Gen 4 entry) and chooses to reset.

**What earned:** A modest shard reward. Enough to buy 1–2 prestige upgrades — a taste of the system, not a transformation.

**What feels different next run:** Slightly more energy income, slightly cheaper reactions. The improvement is perceptible but not dramatic. Gen 1 may feel a bit faster. The player begins to understand the economy.

**What remains hard:** Everything. Gen 3 is still slow. Gen 4 is still gated by capabilities. The Time wall is unaddressed.

**Intended feeling:** "I understand why people do this. My next run will be a little better, and I want to push further before I Big Bang again."

---

### Fifth Big Bang

**Trigger point:** Player has been pushing to Tier 11–12 consistently. Has meaningful prestige investment.

**What earned:** Significantly more shards per run than the first Big Bang. Player has been compounding their prestige level.

**What feels different next run:**
- Gen 1 clears visibly faster — energy multiplier makes early atom clicking meaningful.
- Gen 2 reaction costs noticeably reduced.
- The player has begun investing in one or more prestige branches.
- If the Time wall is addressed by now, Gen 3 reactions are 10–20% shorter.

**What remains hard:** Gen 4 is still genuinely challenging. The Metallic Hydrogen → Nuclear Fuel Pellet → Tier 12 path still takes many hours. The capability sequence for Gen 4 capabilities is still required.

**Intended feeling:** "Each run is meaningfully faster through Gen 1–2. Gen 3 is still work but feels achievable. I'm making real decisions about where to spend my shards."

---

### Tenth Big Bang

**Trigger point:** Player has been to Tier 12 multiple times. Has substantial prestige investment. Has likely unlocked at least one full prestige branch.

**What feels different next run:**
- Gen 1 feels almost trivial — cleared in under 5 minutes.
- Gen 2 is fast, 20–40 minutes.
- Gen 3 takes 1–3 hours but is clearly compressing.
- Gen 4 is where the player now spends their time.
- If Queue expansion exists, parallel Gen 4 production is live.
- The capability sequence is shorter due to partial prestige shortcuts.

**What remains hard:** Gen 4 capstones still take several minutes each even with time reduction. The player is spending most of their run time at the frontier, which is correct.

**Intended feeling:** "I barely notice Gen 1–2 anymore. Gen 3 is a warmup. My run is now primarily about Gen 4. I'm solving interesting problems about production order and resource management."

---

### Twentieth Big Bang

**Trigger point:** Deep into the prestige arc. Player has invested across multiple branches.

**What feels different next run:**
- Gen 1–2 is almost instantaneous — not because reactions are instant, but because costs are minimal and energy income starts high.
- Gen 3 takes 30–60 minutes — a brief warmup before the real content.
- Gen 4 takes 3–6 hours — still challenging, still requires real investment.
- The player's reactor has a distinct "identity" based on their branch investments.

**What should never become trivial:** Gen 4 capstones. Reactive Plasma Core and Quantum Substrate should remain genuinely time-expensive even at maximum prestige investment, because they are the final gate to whatever Gen 5 will be.

**What must remain meaningful:** The choice of what to synthesize next. Even at run 20, the player should make real production decisions at Gen 4. If the queue expands to 3 slots but capstones still take 5+ minutes, the player is still managing a challenging resource allocation problem.

**Intended feeling:** "I am a different kind of player than I was on run 1. I have made permanent choices about how my reactor works. My run has a distinct shape. And Gen 4 still demands my full attention."

---

### The Constant

Across all 20 Big Bangs, one thing must remain true: there is something the player is working toward. On run 1 that is Gen 4. On run 10 that is Tier 12. On run 20 that is Gen 5, or the next prestige branch, or the deepest capstone. The frontier must always exist.

---

## Part 7 — Gen Boundaries

The question for each tier: should a player be able to reach it without prestiging?

Distinction used throughout: "physically impossible" means the game mechanics prevent it. "Economically unrealistic" means it is theoretically possible but the cost in time and resource is so high that a rational player would not attempt it.

Economically unrealistic is the preferred design tool. It preserves player agency while creating soft gates that prestige can open.

---

### Gen 4 (Tier 9 access)

**Verdict: Yes**

A first-run player should be able to reach Gen 4 without prestiging. This is the natural endpoint of a first run and the trigger for a Big Bang. Making it impossible would force prestige before the player understands why they're doing it.

Reaching Gen 4 requires producing Graphene (unlocks `plasma_state` at Tier 9). This requires Steel → Chrome → Graphene chains. Difficult, but achievable on a first run with enough time.

---

### Mid Gen 4 (Tiers 10–11)

**Verdict: Yes — but long**

Tiers 10–11 require Hydrogen Plasma (180s) and the cold track (Ceramic Superconductor at 360s, then Cryogenic Matrix at 540s). These are physically accessible with zero prestige, just very slow. Metallic Hydrogen at 720 seconds per unit is the defining bottleneck.

A first-run player can reach Tier 11, but it will take many hours of mostly waiting. This is acceptable — the player is operating at the frontier of what their current prestige level can reasonably support.

Mid Gen 4 is the "this is hard and meant to be" zone on run 1.

---

### End Gen 4 (Tier 12)

**Verdict: Maybe**

Tier 12 requires Nuclear Fuel Pellet (720s, extreme_pressure + radiation_bombardment). Physically accessible. Economically painful on a first run because of the sequential 720s syntheses required to build prerequisites.

A first-run player who is persistent can reach Tier 12. It should feel like a genuine achievement — not trivial, not routine. By run 3–5 with prestige upgrades, Tier 12 should become a reliable destination rather than an achievement. By run 10, it should be an expected stopping point.

The design principle: Tier 12 on run 1 = marathon. Tier 12 on run 5 = hard but reliable. Tier 12 on run 10 = standard destination.

---

### Gen 5 (Hypothetical)

**Verdict: No — not on run 1**

Gen 5 does not yet exist in the game. When it does, it should require meaningful prestige investment before being reachable. The transition from Gen 4 to Gen 5 should represent a prestige gate in the economy, not just a gameplay wall.

Specifically: Gen 5 access should require either (a) a prestige branch unlock that explicitly grants access, or (b) cumulative prestige upgrades that together make the required resource costs feasible. The distinction from Gen 4's "economically unrealistic but physically possible" to Gen 5 should be that Gen 5 is genuinely unreachable on a zero-prestige run — the resource requirements should exceed what zero-multiplier runs can support.

---

### Gen 6 (Hypothetical)

**Verdict: No**

Gen 6 belongs multiple prestige tiers deep. If it exists, it is behind multiple Big Bangs and multiple prestige branch unlocks. No further analysis warranted at this design stage.

---

### Gen Boundary Table

| Target | Verdict | Reasoning |
|---|---|---|
| Gen 4 entry (Tier 9) | Yes | First-run endpoint, must be reachable |
| Mid Gen 4 (Tier 10–11) | Yes, but slow | Achievable with time; should compress by run 3–5 |
| End Gen 4 (Tier 12) | Maybe — marathon on run 1 | Should become routine by run 5, standard by run 10 |
| Gen 5 | No on run 1 | Should require prestige investment to unlock |
| Gen 6+ | No | Deep prestige territory |

---

## Part 8 — Candidate Prestige Branches

Candidates listed without full design. Each entry states the primary wall addressed and whether it appears core to the prestige loop or optional enrichment.

---

### Branch 0 — Reactor Efficiency (Existing)
**Walls addressed:** Energy wall (multiplier), Material wall (cost reductions)
**Status:** Implemented. Three upgrade types: energy, matter, chemistry.
**Classification:** Core — the foundation of the prestige economy. However, it currently addresses only the walls that least need solving. It is necessary but insufficient.
**Open issue:** Matter/chemistry multipliers cap at level 20. Energy has no cap. Long-term shard spending in this branch is entirely energy-focused once matter/chemistry are maxed.

---

### Branch 1 — Automation Infrastructure
**Walls addressed:** Queue wall (partially), Material wall (passive production)
**Concept:** Permanent blueprint unlocks that allow modules to passively produce base Gen 1 materials, reducing the early-run setup time and freeing the queue for meaningful synthesis.
**Classification:** Core — addresses the queue wall, which is one of the three unaddressed walls. However, automation of Gen 1 materials only partially addresses the queue wall. Full queue wall resolution requires queue slot expansion.
**Design note:** Automation must not extend into Gen 4. The Gen 4 manual synthesis requirement is a core design invariant. Automation is a Gen 1–3 quality-of-life feature.

---

### Branch 2 — Reaction Acceleration
**Walls addressed:** Time wall (directly)
**Concept:** Prestige upgrades that reduce base reaction durations by a percentage per level. Soft-capped so capstone reactions retain meaningful duration at maximum investment.
**Classification:** Core — the Time wall is the most impactful unaddressed wall for repeat players. This branch is mandatory for the prestige loop to feel rewarding over 10+ runs.
**Design constraint:** Must not apply uniformly. Gen 4 capstones should be reduced proportionally less than Gen 1–2 reactions. The frontier must remain hard.

---

### Branch 3 — Reactor Memory
**Walls addressed:** Capability wall
**Concept:** Permanent upgrades that reduce or eliminate the re-unlock requirements for lower-tier capabilities. At low investment: capabilities unlock at lower substance/tier thresholds. At high investment: Gen 1–2 capabilities (high_pressure, catalyst) are available at run start.
**Classification:** Core — the Capability wall is the second most impactful unaddressed wall for repeat players. Without this branch, run 5+ includes a mandatory known sequence with no mechanical shortcut.
**Design constraint:** Gen 4 capabilities (plasma_state, extreme_cold, extreme_pressure, extreme_temperature) should never be permanently bypassed. They are tied to tier progression that must be earned.

---

### Branch 4 — Queue Expansion
**Walls addressed:** Queue wall (directly)
**Concept:** A high-cost, high-impact upgrade that expands `MAX_SLOTS` from 1 to 2 (and eventually 3). This is the most mechanically transformative prestige upgrade possible — it changes how the entire late game plays.
**Classification:** Core, but expensive. This upgrade should require substantial prestige investment — not a first-run purchase. It should be a 5–10 Big Bang investment milestone.
**Design note:** Expanding to 2 slots roughly halves effective Gen 4 production time for parallel-track reactions. This is not a minor quality-of-life change — it is a structural upgrade. Price accordingly.

---

### Branch 5 — Reactor Specialization
**Walls addressed:** None directly — creates new possibilities
**Concept:** Permanent branching choices that give the reactor unique properties, unlocking synthesis pathways not available by default. Examples: a plasma-specialist reactor that can ionize unusual substances, or a cold-specialist reactor with unique low-temperature reaction chains.
**Classification:** Optional — enrichment and replayability layer. Does not solve walls, creates variety and long-term identity.
**Implementation dependency:** Requires Gen 5+ content to justify. Should not be designed until the core branches (0–4) are complete.

---

### Branch 6 — Offline Systems
**Walls addressed:** Time wall (indirectly, via progress while away)
**Concept:** Mechanisms for the reactor to accumulate resources or queue progress during offline periods. Limited by a cap (TBD during balancing).
**Classification:** Optional — quality-of-life for casual players. Does not address the time wall for active sessions, only mitigates idle gaps.
**Design constraint:** Offline progress must be bounded to prevent players from "sleeping through" Gen 4 entirely. Offline should soften the time wall, not eliminate it.

---

### Branch Summary

| Branch | Walls Addressed | Classification |
|---|---|---|
| 0 — Reactor Efficiency | Energy, Material | Core (existing) |
| 1 — Automation Infrastructure | Queue (partial), Material | Core |
| 2 — Reaction Acceleration | Time | Core, must be implemented |
| 3 — Reactor Memory | Capability | Core, must be implemented |
| 4 — Queue Expansion | Queue (direct) | Core, high cost |
| 5 — Reactor Specialization | None (creates variety) | Optional |
| 6 — Offline Systems | Time (indirect) | Optional |

---

## Part 9 — Shard Economy Requirements

**Approach:** Rather than adjusting the current shard formula, this section derives what shard rewards should feel like from the desired progression model and works backward to requirements.

---

### What the Economy Must Accomplish

A satisfying prestige economy requires that:
1. First Big Bang feels rewarding but does not unlock the full prestige system.
2. Each Big Bang contributes meaningfully to a long-term build.
3. No single Big Bang allows purchase of all available upgrades.
4. At run 20, the player still has meaningful spending decisions, not just "max everything."

---

### Derived Requirements by Run

**First Big Bang (target tier 9–10):**

The player should earn enough to buy 1–2 small upgrades. Specifically, they should be able to start investing in one branch but not make dramatic progress.

Target: 60–120 shards. Enough to reach level 4–5 in one multiplier category (cost 20+30 = 50 shards to reach level 5) or to buy one small blueprint entry point if those are tiered.

**Current reality:** ~149 shards at Tier 9. This is approximately 25–50% above the target. Either the target should be higher (allow slightly more purchasing power on run 1) or the shard formula should yield less at Tier 9 specifically. The tier² bonus of 80 shards is a large portion of the T9 total — at T9, tier bonus alone is 80 of 149 shards, meaning substance production adds only ~69 shards. The balance between tier progression and substance depth could be adjusted.

**Fifth Big Bang (target tier 11–12):**

The player has been investing meaningfully. Each run should feel like real progress toward a multi-run goal.

Target: 200–350 shards per run at tier 12. Enough to maintain momentum on 2–3 upgrade tracks simultaneously without completing any single track in one run.

**Current reality:** ~328–361 shards at Tier 12. This falls within the target range. The economy for experienced Gen 4 runs appears correctly scaled.

**Tenth Big Bang (target deep tier 12, substantial Gen 4 output):**

Target: 300–500 shards. The increase from run 5 to run 10 should be driven by improved Gen 4 substance production (more high-shardValue synthesis per run thanks to time/queue prestige investments).

**Current reality:** ~361 shards in optimized runs. The difference between a standard and optimized run is only ~33 shards (328 vs 361), meaning the log2 accumulation bonus is functioning as intended (diminishing returns). However, if Time and Queue prestige branches allow significantly deeper Gen 4 runs, higher-shardValue synthesis chains may contribute more, naturally increasing later-run payouts.

---

### The Central Problem with the Current Formula

At Tier 9 first run: 149 shards. At Tier 12 Gen 4 run: 328–361 shards. The ratio is 2.2x.

But the effort required to go from Tier 9 to Tier 12 is 3–5x greater in real-time terms. A player who stops at Tier 9 every run earns 45% of what a Tier 12 run earns, while investing far less time.

This creates weak incentive to push into Gen 4 on early runs. If shard economy is intended to reward deeper progression, the formula should widen the gap between Tier 9 and Tier 12 payouts — either by increasing Gen 4 substance shardValues relative to the tier bonus, or by reducing the tier² bonus for lower tiers.

---

### Branch Economics

For the prestige economy to create meaningful spending decisions across 20 runs, the total cost of all upgrades must be substantially more than 20 × (average shards per run).

If average shard yield is 200–250 per run across 20 runs: ~4,000–5,000 total shards.

For all upgrades to take 20 runs to acquire, total upgrade cost should be in the range of 3,500–5,000 shards across all branches.

Current branch 0 (to level 20 cap on matter/chemistry, level 15 on energy): approximately 420+420+240 = 1,080 shards for a "full multiplier build."

This means automation blueprints and new branches must collectively cost 2,400–3,900 shards to fill the 20-run arc. Individual blueprints should not be priced at 15–40 shards. They should be priced at 100–500 shards each, with the most impactful upgrades (queue expansion, deep time reduction) at the high end.

The current plan of 5 blueprints at ~40 shards each (200 total) is misaligned with the desired arc by roughly one order of magnitude.

---

## Part 10 — Conclusions

**1. What is the true purpose of prestige in Genesis Lab?**

Prestige is the mechanism that converts run experience into permanent reactor identity. Each Big Bang should leave the player's reactor measurably different from how it was before — faster, more capable, or more specialized. The purpose of Big Bang is not to replay the game — it is to reshape the game for all future runs.

The correct test for any prestige investment: does it make a run 10 meaningfully different from a run 1 in a way the player can feel?

---

**2. What walls must prestige solve?**

Three walls must be addressed before the prestige loop can sustain motivation across 10+ Big Bangs:

- **Time Wall** — Reaction durations must compress meaningfully with prestige investment. This is the most critical unimplemented prestige lever.
- **Queue Wall** — Single-slot serialization must become expandable via prestige. This is the most mechanically impactful upgrade available.
- **Capability Wall** — The mandatory 9-capability re-unlock sequence must be partially shortcuttable for repeat players. Partial shortcuts (not full bypass) for early capabilities.

---

**3. What walls must remain unsolved?**

- **Discovery Wall** — Discovery is the game's core hook. Pre-loading reactions would destroy the experience for returning players who chose to Big Bang.
- **Complexity Wall** — The strategic complexity of Gen 4 multi-track production is content, not obstacle. It must remain.
- **Knowledge Wall** — Self-resolves through play. No mechanical intervention warranted.

The Time and Capability walls at Gen 4's frontier must also remain partially unsolved. Gen 4 capstone reactions should never become trivially fast. The frontier must resist full prestige mitigation.

---

**4. What is the biggest flaw in the current prestige system?**

The current prestige system addresses walls that soften on their own, while leaving the walls that worsen on their own completely untouched.

Energy and material multipliers help with a run 1 problem. By run 3–4, energy and material scarcity are no longer the primary friction. But time and capability re-unlock — which grow more frustrating with each run — receive zero prestige coverage.

A player on run 10 has 3x energy income and 50% cheaper reactions. They also have the exact same 15-minute reaction times and the exact same 9-step capability sequence as run 1. The prestige system has optimized the part of the game that is already manageable, while leaving the painful parts unchanged.

This mismatch between what prestige offers and what players actually need is why the current system would not sustain engagement beyond 3–5 Big Bangs.

---

**5. What design questions must be answered before implementing prestige branches?**

Five questions, in order of blocking priority:

**Q1 — What is the reaction time reduction formula for Branch 2 (Reaction Acceleration)?**
A flat percentage per level, or a diminishing curve? What is the floor for Gen 4 capstones? This must be decided before implementation because it affects all Gen 4 pacing across every future run.

**Q2 — What capability shortcuts exist in Branch 3 (Reactor Memory)?**
Which capabilities become permanent grants at what prestige investment levels? The line between "shortcut early capabilities" and "break the progression gate" must be drawn precisely.

**Q3 — What is the pricing for queue slot expansion (Branch 4)?**
Queue expansion is the most transformative upgrade in the system. Setting its cost too low destroys the Gen 4 experience by trivializing production time. Setting it too high makes it feel unreachable. This is a critical balance decision.

**Q4 — Are the branch blueprints in Branch 1 (Automation) priced with the correct order of magnitude?**
The current design document suggests ~40 shards per blueprint. The economy analysis indicates these should be 100–500 shards each to occupy the correct space in a 20-run progression arc. This must be resolved before implementation or the entire automation system will be unlocked in a single run.

**Q5 — Does Gen 5 exist at the same prestige level as Gen 4, or does it require prestige to unlock?**
If Gen 5 is physically accessible without prestige (like Gen 4 currently is), then the economy and progression designed here must account for it. If Gen 5 is prestige-gated, then the current shard economy and upgrade costs must create a natural threshold that Gen 5 unlocks sit behind. This is an architecture question, not just a balance question, and it determines how the entire long-term prestige arc is designed.

---

*End of analysis. No implementation, no schema changes, no design doc modifications.*
