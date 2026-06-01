# Genesis Lab — Prestige System Redesign

**Status:** Design (pre-implementation)  
**Date:** 2026-06-01  
**Scope:** Prestige system architecture redesign. Automation Infrastructure is the first implemented prestige branch.  
**Prerequisite phases complete:** A, B1, C, D, E, F, B2

> **Revision note (2026-06-01):** This document was originally scoped as an automation system design. During design it became clear that automation is not a standalone feature — it is the first branch of a redesigned prestige system. This document has been restructured accordingly. The prestige philosophy and branch architecture are now the primary concern. Automation Infrastructure is Branch 1 and is documented in full in Part II. Branches 2+ are named but not designed.

> **Revision note (2026-06-01) — Final philosophy decisions captured:** Five design decisions finalized before implementation planning begins. Added: §P0 (Big Bang Purpose), §P1 player freedom and milestone target philosophy, §P2 branch specialization philosophy, §P5 Frontier Progression Philosophy. Option C (shard economy) confirmed. Updated "What is already decided" checklist.

---

# Part I — Prestige System Design

---

## P0. The Purpose of Big Bang

Big Bang exists for three purposes. Every design decision in the prestige system should serve at least one of them.

**1. Gain permanent reactor infrastructure.**
Each Big Bang converts run experience into permanent capabilities — blueprints, branch upgrades, and infrastructure that reshape all future runs. The reactor grows in knowledge and capability across lifetimes. After a Big Bang, the player's reactor is not the same reactor it was. It knows things it did not know before. It can build things it could not build before.

**2. Push deeper into the progression frontier.**
Big Bang is not a reset — it is a reconfiguration that lets the player go further next time. The purpose is not to replay the game from scratch. The purpose is to arrive at the frontier faster, and to push that frontier further with each cycle. A run that ends with a Big Bang at Tier 9 should make Tier 12 more reachable next time. A run that ends at Tier 12 should make Gen 5 more reachable after that.

**3. Break future economic walls.**
Without prestige investment, certain content is economically inaccessible — not physically blocked, but practically unreachable given zero-prestige resource constraints. Prestige is the mechanism that makes these walls yield over multiple runs. Each Big Bang should bring something previously out-of-reach closer to reach.

**What Big Bang is not for:**

- **Merely reducing clicking.** Click reduction is a downstream effect of certain upgrades. It is not a purpose. A prestige system designed around "eliminate clicking" produces a prestige system that feels like a settings menu, not a progression arc.
- **Merely gaining generic multipliers.** "+10% energy generation" is not a compelling reason to destroy a run and start over. Permanent reactor capabilities are.

This distinction matters because it guides every design decision that follows. If a proposed prestige upgrade does not serve at least one of the three purposes above, it should not exist.

---

## P1. Prestige Philosophy

### The problem with generic multipliers

The current prestige system gives the player percentage bonuses: energy +10%, matter generation +10%, chemistry speed +10%. These are the standard currency of idle game prestige systems. They work mechanically. But they are wrong for Genesis Lab.

**They are abstract.** The player cannot visualize what "+10% energy generation" does to their reactor. They know it helps. They cannot feel it. The bonus accumulates invisibly across runs and the player barely perceives it as real progression.

**They are not memorable.** Players do not remember the moment they purchased their third energy multiplier. They remember the moment they synthesized their first Bronze. Prestige upgrades should produce moments — events the player can recall and look forward to. "+10% energy" is not a moment. It is a checkbox.

**They are disconnected from game identity.** Genesis Lab is about a reactor that evolves. Each run, the reactor should feel like it is growing into something it was not before — gaining new capabilities, new infrastructure, new reach. Percentage bonuses suggest the reactor is doing the same thing slightly faster. That is not what the reactor should be doing between Big Bangs.

**They create no anticipation.** A player entering a new run with multiplier upgrades begins with vaguely better numbers. A player entering a new run with an Atmospheric Separator blueprint begins knowing exactly what they will build once they reach Gen 4. That is a goal. That is something to work toward. Multipliers create no such goal.

**They offer false choice.** Choosing between the energy multiplier and the matter multiplier is nearly arbitrary — the player barely understands the difference in practice. Choosing between the Atmospheric Separator blueprint (hydrogen + oxygen production) and the Carbon Scrubber blueprint (carbon production) is a real strategic decision with visible downstream consequences for how that run plays.

### What infrastructure unlocks provide instead

**Legibility.** The player knows exactly what the Atmospheric Separator does. They know it produces hydrogen and oxygen while they focus on Gen 4 synthesis. There is nothing abstract about it.

**Memorability.** "I unlocked the Atmospheric Separator" is a story. The player remembers purchasing the blueprint. They remember constructing it for the first time and watching it run during a Gen 4 synthesis session. These are events.

**Identity coherence.** The game's core arc is the reactor evolving — from primitive hydrogen synthesis to cosmic alchemy. Between runs, the reactor should be gaining literal new capabilities. Infrastructure fits this arc. The reactor is becoming something it was not. Multipliers suggest it is running the same program faster.

**Anticipation and goals.** Every blueprint the player owns is a commitment they can look forward to fulfilling in the next run. "Once I reach Graphene, I can build the Atmospheric Separator." That is a mid-run goal. That is what prestige should create.

**Agency with consequences.** Which blueprint to buy first, which modules to construct in a given run, how much to upgrade before Big Bang — these are real decisions with visible effects on that run's progression. The decisions matter and the player can observe the results.

### The new prestige identity for Genesis Lab

Prestige is the reactor gaining permanent knowledge and capability across lifetimes. Each Big Bang is not a reset — it is a cycle. The reactor remembers what it has learned to build. The player arrives in a new run not with a slightly faster version of the same reactor, but with a reactor that knows how to do things it could not do before.

Infrastructure upgrades express this. Multipliers do not.

### Player Freedom and Spending Autonomy

The prestige system does not define a prescribed progression path. There is no correct order in which to spend Genesis Shards.

Balancing targets such as "a player who has done five Big Bangs should be in a position to afford X" are designer calibration references. They describe what the economy should feel like at a given investment depth. They are not player instructions. They are not visible objectives. They are not required purchase sequences.

A player who completes twenty Big Bangs and invests exclusively in one branch is not playing wrong. A player who spreads investment evenly across all branches is not playing wrong. The game communicates what each upgrade does and then steps back. The shape of the player's reactor is their own.

### Milestone Targets Are Internal

"Big Bang #1 should provide enough shards for 1–2 upgrades" and "by Big Bang #10 the player should have reached one full branch" are balancing targets used to calibrate shard earn rates and upgrade costs. They describe a typical progression arc and help verify that the economy is correctly shaped. They are working assumptions, subject to revision after playtesting.

They are not:
- **Mandatory checkpoints.** No purchase is required at any Big Bang count.
- **Visible objectives.** Milestone numbers are not surfaced to the player.
- **Required purchase orders.** No player will ever be told "you should have bought this by now."

These targets exist so that upgrade pricing, shard earn rates, and branch structure can be validated against a realistic progression arc. They are the measuring stick, not the instruction.

---

## P2. Prestige Architecture

The prestige system is organized into branches. Each branch is a domain of permanent reactor capability that the player unlocks over multiple Big Bang cycles.

**Structure of a branch:**

All branches share the same two-layer mechanic:
- **Layer 1 — Blueprint (permanent):** Purchased with Genesis Shards. Survives every Big Bang. Represents the reactor's permanent knowledge of how to build something.
- **Layer 2 — Construction (per-run):** Building the capability within a run requires in-run investment (energy, materials, or other resources). Destroyed on Big Bang. Blueprint remains.

This two-layer structure is the architectural foundation of the prestige system. Blueprints are meta-progression. Constructions are per-run investment. Big Bang is meaningful because it resets constructions — the player must rebuild, but faster each time.

**Current branches:**

**Branch 0 — Reactor Efficiency (legacy)**  
The existing energy, matter, and chemistry multiplier upgrades. These are grandfathered into the branch architecture as the Reactor Efficiency branch. See §P3 (Shard Economy) and §P4 (Migration Strategy) for how this interacts with the new design.

**Branch 1 — Automation Infrastructure**  
The first new prestige branch. Fully designed in Part II of this document. Five automation modules: Atmospheric Separator, Carbon Scrubber, Nitrogen Condenser, Iron Smelter, Sulfur Extractor. Blueprints purchased with Genesis Shards. Modules constructed per-run using Gen 4 materials.

**Future branches (named, not designed):**

The following are architectural placeholders only. No design decisions have been made for any of them. They are listed to establish that the branch system is extensible, not to scope or commit to their implementation.

- **Branch 2 — Reactor Expansion:** Additional synthesis queue slots, increased reactor processing capacity. Possible construction requirement: advanced Gen 3–4 materials.
- **Branch 3 — Offline Systems:** Improvements to offline progress accumulation. Possible scope: extended offline windows, reduced catch-up penalty, offline synthesis support.
- **Branch 4 — Reactor Specialization:** Specialized reactor modes or capabilities that alter synthesis behavior in specific ways. Not scoped.

**What is not a branch:**

Discovery, synthesis queuing, tier progression, and experiment behavior are not prestige branches. These systems are run-level. Prestige affects the infrastructure the player arrives with, not the fundamental mechanics of how discovery and synthesis work. This boundary is hard.

### Branch Specialization Philosophy

The branch system is designed to encourage specialization. Investing deeply into one branch makes other branches relatively more expensive to reach — not through any mechanical penalty, but through the opportunity cost of a finite shard pool.

**Specialization creates differentiated builds.** A player who invests heavily in Reaction Acceleration has a reactor that moves fast through long synthesis chains. A player who invests in Queue Expansion has a reactor that can parallelize Gen 4 work. These are different reactors with different play styles. That differentiation is the goal: meaningful choices, distinct builds, reactors with real character.

**Specialization is pressure, not lock-in.** A player who has invested deeply in one branch can always pivot. Spending shards on a second branch is always available — at the cost of slower progress in the first. No choice is permanent. No branch is ever closed.

**Completionism is a valid long-term goal.** A player who wants to own every upgrade in every branch should eventually be able to, given enough runs. The 20-run arc is designed to leave open spending decisions throughout — deep specialization reaches targets faster, a generalist build reaches them more slowly but still reaches them.

**No build should feel obviously optimal.** If every player's rational strategy leads to the same purchase order, the system has failed. Multiple valid specialization paths — speed-focused, parallelism-focused, automation-focused, efficiency-focused — are a design success condition, not a side effect.

---

## P3. Shard Economy

### Current state

The existing prestige economy has three upgrade tracks: energy multiplier, matter multiplier, chemistry multiplier. Each has multiple purchasable levels at increasing shard costs. All three draw from the same Genesis Shard pool.

The question now: how does the shard economy accommodate prestige branches without creating a "good option / bad option" dynamic?

### Option A — Keep multipliers, add blueprints as a parallel spending category

Multiplier upgrades continue as-is. Blueprint purchases are added as an additional way to spend shards. Both compete for the same shard pool.

**Problem:** If infrastructure blueprints deliver more value per shard than multiplier upgrades (as the prestige philosophy argues they should), players will recognize this over time. Early runs where shards are spent on multipliers will feel like waste in retrospect. The "wrong" choice remains available and some players will make it unknowingly.

The branch architecture implies all shard spending should feel equally legitimate. Option A doesn't achieve this — it creates two tiers of spending with one tier being superior.

### Option B — Deprecate multipliers, transition fully to prestige branches

Remove multiplier upgrades. All shard spending goes to prestige branches. Existing multiplier purchases are grandfathered as passive bonuses at their current level — no rollback, but no further purchase allowed.

**Pro:** Clean philosophical alignment. All active shard spending is infrastructure. The system is unified.

**Problem:** The UI change is significant. Players who planned to continue investing in multipliers are cut off. It requires migration planning (the old panel disappears or is replaced). This is the most disruptive option.

### Option C — Fold multipliers into a prestige branch — recommended

The existing energy, matter, and chemistry multiplier upgrades become Branch 0: Reactor Efficiency. They are repositioned as a prestige branch rather than standalone upgrades. The shard pool is shared across all branches.

**Why this is the correct recommendation:**

- All existing shard investments are honored unconditionally. No existing level is taken away.
- All shard spending is now conceptually unified under the branch architecture. There is no "prestige" and "also prestige" — everything is a branch.
- Players who prefer the abstract multiplier path can continue investing in Branch 0. Players who understand the new philosophy invest in Branch 1. Neither is wrong.
- The UI can present both as branches in the same interface, making the system feel architecturally coherent even before Branch 2+ is designed.
- The philosophy is expressed behaviorally: players who engage with the new design will favor infrastructure; players who prefer simplicity have a safe option. The game does not force them.

**One important UI implication:** If the Reactor Efficiency branch still *looks* like the old Upgrades panel (flat list with percentage numbers), it will undermine the branch architecture. Even Branch 0 must be presented within the branch framework — as a branch the player can choose to invest in, not as a legacy sidebar widget.

---

## P4. Migration Strategy

This section describes what happens to the existing prestige system when the new architecture is implemented. This is design only — no implementation decisions are made here.

### What survives unchanged

- **All existing multiplier purchase levels:** Every energy, matter, and chemistry upgrade already purchased by any player is honored at its current level. No rollback, no conversion, no expiry. These become Level N of the Reactor Efficiency branch.
- **Genesis Shard balances:** No change to any player's shard count.
- **Big Bang mechanics:** The shard award calculation, Big Bang trigger, and inventory reset are unchanged.

### What changes

- **Framing:** The "Upgrades" panel is redesigned to present the prestige branch architecture. What was a flat list of three upgrade tracks becomes a branch-selection interface.
- **Reactor Efficiency branch:** Energy, matter, and chemistry multipliers are repositioned as Branch 0 within this interface. Their behavior is unchanged — only their visual context changes.
- **New branch entry point:** Automation Infrastructure (Branch 1) appears in the same branch interface. Blueprint purchases appear alongside the Reactor Efficiency options as a distinct branch.

### What becomes legacy

- **The existing "Upgrades" panel layout** (flat list of three multipliers with direct buy buttons) is retired and replaced by the branch-organized prestige interface. The old layout is not preserved in parallel.
- **The term "prestige upgrades"** as a monolithic category is retired. The correct language going forward: "prestige branches" and "branch investments."

### Whether existing multiplier upgrades can continue to be purchased

Yes. Repositioning multipliers as Branch 0 does not cap or freeze them. A player who wants to continue purchasing energy multiplier levels can do so — those purchases now happen within the Branch 0 section of the prestige interface rather than the old Upgrades panel. No functional change; only presentational change.

### Migration summary table

| Element | Status |
|---------|--------|
| Existing multiplier levels | Survive unchanged |
| Existing shard balances | Survive unchanged |
| Big Bang mechanics | Unchanged |
| Multiplier upgrades (future purchases) | Repositioned as Branch 0 in prestige interface |
| Upgrades panel UI | Replaced by branch interface |
| The term "prestige upgrades" | Deprecated; use "prestige branches" |

---

## P5. Frontier Progression Philosophy

The prestige system is designed to strongly reward pushing into unexplored territory. It is not designed to reward repeatedly farming the same progression point.

### What the Frontier Means

The frontier is wherever the player has not yet been. On run 1, the frontier is Gen 4. On run 5, it is Tier 12. On run 10, it is the first Gen 5 substance. The frontier advances as the player pushes deeper.

Frontier progress is defined by:
- **New highest tier reached** — crossing a tier gate for the first time in the player's history
- **New highest generation reached** — producing a Gen 3 or Gen 4 substance for the first time in a run
- **New highest substance reached** — synthesis of substances never produced before
- **Depth over volume** — going deeper in a single run is more valuable than producing more of something already mastered

### What the Frontier Does Not Reward

Repeated runs that stop at the same depth do not advance the frontier. A player who performs ten Big Bangs at Tier 9 has not pushed deeper — they have replayed the same run ten times. The shard formula already reflects this through diminishing returns on substance volume (log₂ accumulation). Volume without depth is not progress.

### Design Implications

**Shard payout should weight frontier depth over run volume.** A run that reaches Tier 12 for the first time should pay substantially more than a run that stops at Tier 9 again. The current tier² bonus approximates this, but the gap between Tier 9 and Tier 12 payouts (currently ~2.2×) may need widening to match the actual effort differential (~3–5×).

**Prestige upgrades should open paths, not only accelerate existing ones.** An upgrade that allows the player to reach Gen 5 for the first time is a frontier-opening upgrade. An upgrade that compresses Gen 1 from 10 minutes to 8 minutes accelerates known territory without expanding the frontier. Both types have a place, but the frontier-opening upgrades should feel meaningfully more significant.

**The optimal Big Bang timing should involve pushing as deep as possible.** A prestige economy that makes early Big Bangs (low tier, low depth) competitive with deep Big Bangs has the wrong shape. Players should feel — through the shard economy, not through instruction — that going deeper before Big Bang is almost always worth it.

### What This Philosophy Does Not Mean

Compressing familiar territory is expected and intended. Gen 1–3 will always be run through on every run. Time and capability prestige upgrades exist specifically to make this faster. The goal is that compressing familiar territory serves as a means — arriving at the frontier faster — not an end in itself. The optimal strategy should never be "stop at Tier 9 every run."

---

# Part II — Branch 1: Automation Infrastructure

The following sections constitute the full design for the first prestige branch. Nothing in this part affects the prestige architecture decisions above. If the prestige architecture changes, Branch 1 operates within whatever architecture is decided.

---

## 1. Goals

**What automation should accomplish:**

After multiple Big Bangs, the player has demonstrated mastery of Gen 1–4 synthesis. They understand the feedstock loops. They have reached Tier 12. They know what hydrogen is — they have synthesized thousands of units of it across multiple runs. At this point, re-queuing primitive element production is not meaningful play. It is time tax.

Automation eliminates time tax for players who have earned the right to skip it. It does not eliminate discovery. It does not eliminate decision-making. It eliminates the rote repetition that comes after understanding has already been achieved.

The player should feel: *I built this. The reactor now does this for me because I invested in making it capable.*

Not: *This is a quality-of-life checkbox that turned on automatically.*

**What player pain points it solves:**

- Post-Tier-12 feedstock grind: on a second or third run, the player knows the path exactly. Repeating the Gen 1 feedstock loop provides no information and no discovery — it is pure execution time.
- Synthesis queue occupation: without automation, Gen 1 element production occupies queue slots that should be available for Gen 4 synthesis decisions. Automation frees the queue for choices, not maintenance.
- Idle downtime: between long Gen 4 synthesis reactions, the player has nothing productive to queue. Automation runs during these windows.

**Why automation is post-Big-Bang infrastructure, not midgame convenience:**

The first run is discovery. Later runs are construction. Automation is part of what gets constructed across runs — it is the infrastructure the player builds over multiple Big Bang cycles. The first run has no automation at any point. That is correct. The game today is the intended first-run experience.

---

## 2. Non-Goals

These are explicit constraints for V1. They are design invariants, not future considerations.

- **No auto-discovery.** Automation never triggers the experiment panel or attempts unknown combinations. Discovery remains entirely player-driven, on every run.
- **No auto-experimentation.** Automation does not feed the experiment system.
- **No auto-synthesis.** Automation never queues a reaction. The synthesis queue has exactly one entry point: the player. This is Constraint 3 from the roadmap philosophy and it is non-negotiable.
- **No auto-tier progression.** Automation cannot unlock tiers. Tier gates require the player to synthesize specific milestone substances through deliberate queue actions.
- **No Gen 2+ substance production.** Automation produces raw feedstock only. It never produces Iron Oxide, Ammonia, Bronze, or any compound — only the Gen 1 elements those compounds are made from.
- **No Gen 5–6 feedstock.** Automation scope is bounded at Gen 1 raw elements. This is Constraint 6 from the roadmap.
- **No automation before Gen 4 materials are available.** Module construction requires Gen 4 substances. Automation physically cannot activate until the player reaches Gen 4 in a given run. Gen 1–3 is always fully manual — on every run, regardless of prestige history.

---

## 3. Automation Model Evaluation

### Option A — Element Generators
Simple named producers: Hydrogen Generator, Oxygen Generator, Carbon Extractor. Each produces one substance at a fixed rate.

- Gameplay impact: clear and legible.
- Complexity: low.
- Progression fit: weak. Feels like a settings menu, not an achievement.

### Option B — Reactor Modules
Named devices that match the game's physical vocabulary: Atmospheric Separator, Carbon Scrubber, Nitrogen Condenser. Mechanically identical to Option A, but named and framed as things the player constructs and installs as extensions of the reactor system.

- Gameplay impact: same production behavior as Option A, with naming that reinforces reactor-as-thing-being-built.
- Complexity: equivalent to Option A once named.
- Progression fit: excellent. The player doesn't "unlock" a module — they build one. Language of construction fits Option B.

### Option C — Inventory Maintenance Systems
The player sets target stock levels. The system auto-produces whenever inventory drops below target.

- Gameplay impact: inverts the mental model.
- Complexity: higher — threshold evaluation, edge cases with queue deductions.
- Progression fit: weak. "Maintain 100 hydrogen" feels like a spreadsheet, not a reactor.

**Recommendation: Option B — Reactor Modules.** Under the prestige philosophy, naming matters more than before. A player spending Genesis Shards and Graphene to obtain an Atmospheric Separator is building something the reactor did not have before. That should sound like something they built.

---

## 4. Two-Layer Unlock System

Automation uses the same two-layer structure as all prestige branches.

### Layer 1 — Blueprint (Permanent, account-level)

Blueprints are purchased with Genesis Shards. They survive every Big Bang unconditionally. A blueprint represents the reactor's permanent knowledge of how to build a specific module.

A blueprint alone does nothing. It is not a generator. It does not produce resources. It is a capability unlock — the reactor now knows how to build this, whenever the conditions are right.

Blueprint costs: TBD during balancing. See Part III.

### Layer 2 — Module Construction (Per-run, destroyed on Big Bang)

Owning a blueprint enables the player to construct that module within a run. Construction requires:
- A large energy payment
- Advanced Gen 4 substances (Graphene, Lithium-Ion Cells, and similar)

The Gen 4 material requirement is not accidental — it is the gate. A player cannot construct automation before reaching Gen 4 in that run. This means Gen 1, Gen 2, and Gen 3 progression is always fully manual on every run, regardless of prestige history. The construction gate preserves the early-game experience unconditionally.

Once constructed, a module runs continuously for the rest of that run.

Big Bang destroys all constructed modules. The blueprint remains. The player can reconstruct in the next run once they reach Gen 4 again.

### Why two layers

The blueprint is what the player earns through prestige. The construction is what the player invests in each run. The separation creates a meaningful prestige loop: the reactor grows in knowledge across Big Bangs, but the player must still do the work of building that knowledge into infrastructure each run. Neither layer trivializes the other.

---

## 5. Big Bang Interaction

**Blueprints persist.** Shards are meta-progression. Blueprints are shard purchases. They survive Big Bang unconditionally.

**Constructed modules reset.** They are per-run investments built from per-run materials. A player who constructs an Atmospheric Separator in run 3 starts run 4 with the blueprint but not the module.

**Inventory resets** as normal (existing behavior, unchanged).

**The intended prestige loop:**

```
Run N: Reach Tier 12 → Big Bang → Earn Genesis Shards
         ↓
Purchase blueprint(s) with shards
         ↓
Run N+1: Reach Gen 4 → Construct module(s) using Gen 4 materials
         Automation runs for Tier 9–12 phase
         Big Bang → Earn more shards
         ↓
Purchase additional blueprints
         ↓
Run N+2: Multiple modules constructable after Gen 4
         Infrastructure compounds across runs
```

Each Big Bang is the mechanism that earns more blueprint capacity. The player is not punished for prestiging — they are rewarded with more infrastructure potential on the next run.

**Why this is clean:**

Blueprints are shard purchases → they persist. Modules are per-run energy+materials → they reset. The behavior follows from what these things are. No split-reset complexity, no tier-gate re-unlock logic, no prestige modifier needed.

**The rebuild friction question:**

How long does it take to go from Big Bang → Gen 4 → modules reconstructed in the next run? This is the most critical balance question for the prestige loop. The correct answer depends on construction costs, which are TBD. See Part III.

---

## 6. Resource Scope

Gen 1 raw elements only. The roadmap (Constraint 6) is explicit: generators produce raw elements only. The synthesis bottleneck is raw element supply, not intermediate compound supply. Compounds are fast to synthesize; hydrogen and oxygen are the actual constraint.

**V1 scope:** hydrogen, oxygen, carbon, nitrogen, iron, sulfur, sodium, chlorine, helium, calcium.

**Excluded from V1:** water, methane, salt, ammonia, carbon dioxide, iron oxide, or any compound.

Gen 1 compounds are the natural V2 scope — after V1 is playtested and calibrated across multiple Big Bang cycles.

---

## 7. Progression Curve

Automation progression is measured in runs, not tiers. This is the fundamental difference from any midgame-unlock design.

### Run 0 — Discovery run (no automation, anywhere)
No blueprints. No shards. The player discovers the synthesis graph from first principles. Reaches Tier 12. Performs first Big Bang. Earns first Genesis Shards. This run plays exactly as the game does today. No automation at any point, ever. This is correct.

### After Run 0 — First blueprint decision
The player has shards for the first time. Which blueprint to buy first? The Atmospheric Separator addresses the highest-volume feedstock need (hydrogen + oxygen). It is the obvious first purchase. But it is still a decision — one the player makes with real information about their synthesis bottlenecks.

### Run 1 — First infrastructure run
Gen 1 through Gen 3 play exactly as Run 0: fully manual. On reaching Gen 4 (Graphene available), the player can construct the module they blueprinted. The decision of when to construct — immediately on reaching Gen 4, or after building a Gen 4 stockpile for upcoming synthesis chains — is a meaningful tactical choice. Once constructed, the module runs for the remainder of that run.

### Run 2+ — Infrastructure compounds
More shards earned. More blueprints purchasable. Each run reaches Gen 4 faster (the path is known). More modules can be constructed. The player who owns three blueprints can construct three modules after reaching Gen 4 — significant material cost upfront, sustained feedstock for the remainder.

### Gen 5+ (future)
Automation V2 territory. Reconstruction friction, module capacity, and production rates will need re-calibration at Gen 5+ timescales.

---

## 8. Economy Impact

**Construction cost as a real decision:**

Construction costs energy and Gen 4 materials. This creates a genuine tension at the moment the player first enters Gen 4: spend early Graphene on module construction (long-term feedstock) or hold it for Gen 4 synthesis chains (short-term progress). There is no obviously correct answer. This tension is the point.

**Branch 0 vs. Branch 1 shard competition:**

Under Option C (recommended in §P3), shard spending is split between Branch 0 (Reactor Efficiency — multipliers) and Branch 1 (Automation — blueprints). A player who buys an Atmospheric Separator blueprint is not buying an energy multiplier. This is intentional. The relative value of these investments should be observable to the player over multiple runs. Neither should feel obviously wrong.

**Upgrade economy:**

Module upgrades require significant materials — not trivial energy payments. The player should never accidentally max a module. Each upgrade is a deliberate decision made from a scarce Gen 4 materials budget. Specific costs are TBD (see Part III), but the design direction is: upgrade costs should feel meaningful in context of what's available at Gen 4.

**Progression pacing:**

Automation has zero impact on Gen 1–3 pacing in any run — construction requires Gen 4 materials, so it cannot activate before Gen 4. The existing Gen 1–3 economy is unaffected.

Automation affects Tier 9–12 of run 1+ only. The calibration question: how much does automation accelerate Tier 9–12 progress relative to the investment required? This is a Phase J balancing question, not a design blocker.

**Inventory inflation:**

Modules run continuously from construction through Big Bang. Per-substance storage caps are required — production pauses at cap. Cap values are TBD (see Part III).

---

## 9. UI Concepts

Two distinct UI states for automation.

**Prestige Branch Interface (shard economy view):**

The existing Upgrades panel is redesigned to present the branch architecture. Branch 0 (Reactor Efficiency) and Branch 1 (Automation Infrastructure) appear as sections within this interface. Blueprint purchases happen within the Branch 1 section: module name, what it produces, shard cost, "Purchase Blueprint" button (grayed if insufficient shards or already owned). "OWNED" chip replaces the button for purchased blueprints.

This interface is visible from the first Big Bang onward, even if the player has zero shards — it communicates the possibility space.

**Generators Panel (in-run infrastructure view):**

Visible only when at least one blueprint is owned. Collapsed by default. Shows each owned blueprint in one of two states:

- **Blueprint owned, not constructed:** module name, "Construct" button with cost breakdown (energy + materials), grayed if materials insufficient
- **Constructed:** module name, current production rate, level indicator, upgrade button with next-level cost, pause toggle, storage-capped indicator if applicable

Status indicators:
- Running: subtle green pulse
- Paused: dimmed, "paused" label
- Storage capped: amber indicator, "capped" — production stopped

**No real-time production counter.** Do not show a live accumulator. Show rate and let inventory change be the signal. The reactor is not a dashboard.

---

## 10. Offline Progress

When the player reconnects, the server calculates elapsed offline time and applies generator production for any constructed modules, capped at a maximum offline accumulation window (value TBD during balancing).

**Cap rationale:** Extended offline sessions should not trivially fill storage. The cap bounds the catch-up window. The specific value must be calibrated once production rates and storage caps are set — the cap is only meaningful relative to those values. Server-enforced from server-side timestamps, not client-reported uptime.

**Accumulation limits:** Each substance has a per-substance storage cap (TBD). Offline production cannot exceed this cap regardless of offline duration.

**On reconnect:** Brief summary notification: "While you were away — Hydrogen +X, Oxygen +X, Carbon +X." Not a modal. Single-line notice that fades, same pattern as synthesis completion.

---

## 11. Future Expansion

**Branch 1 V2 (after Phase J economy validation):**

Expand module scope to include Gen 1 compound production: a Water Synthesis Chamber, a Methane Condenser. Requires high upgrade investment to become cost-effective. Per-substance storage caps and offline accumulation cap revisited for Gen 5 timescales.

**Branch 1 V3 (if warranted):**

Module specialization at maximum upgrade level. Not designed here. Only consider after V1–V2 are playtested.

**Construction friction reduction (future shard upgrade):**

After V1 construction costs are finalized and playtested, a future shard purchase within Branch 1 could reduce the Gen 4 material cost of module reconstruction. Do not design until V1 costs are known.

Nothing in Branch 1 V2, V3, or future modifiers should be designed until V1 has been live through multiple Big Bang cycles.

---

## 12. Recommendation

**V1 automation is: reactor modules, blueprint-unlocked permanently through Genesis Shard purchases, constructed per-run using Gen 4 materials, producing Gen 1 raw elements, with blueprints persisting through Big Bang and constructed modules resetting.**

Five modules for V1:

| Module | Produces | Blueprint Cost | Construction Requires |
|--------|----------|---------------|----------------------|
| Atmospheric Separator | Hydrogen, Oxygen | TBD shards | Energy + Graphene + Lithium-Ion Cell |
| Carbon Scrubber | Carbon | TBD shards | Energy + Graphene + Doped Silicon |
| Nitrogen Condenser | Nitrogen | TBD shards | Energy + Aramid Fiber + Doped Silicon |
| Iron Smelter | Iron | TBD shards | Energy + Stainless Steel + Carbon Nanotube |
| Sulfur Extractor | Sulfur | TBD shards | Energy + Stainless Steel + Carbon Nanotube |

Per-substance storage cap and offline accumulation cap are required parameters — values TBD during balancing.

The most important constraint that must survive implementation: **automation writes to inventory only. It never touches the synthesis queue.** Every synthesis the player runs is a deliberate choice. That is the game.

---

## 13. Implementation Preview

This is not a staged plan. It is a compact map of the implementation surface for estimation purposes.

**Step 1 — User model extension**  
Add `blueprints: [{ blueprintKey: String, purchasedAt: Date }]` and `generators: [{ moduleKey: String, level: Number, constructedAt: Date, pausedAt: Date | null }]` to the User schema. Add `lastActiveAt: Date` for offline catch-up. Add `generatorStorageCap` and `generatorOfflineCap` as constants in a server config file (values TBD).

**Step 2 — Blueprint purchase and Big Bang integration**  
Route `POST /api/users/:username/blueprints/:blueprintKey`: validates shard balance against blueprint cost config, deducts shards, appends to `user.blueprints`. In the Big Bang route, reset `user.generators` to `[]`. Do not touch `user.blueprints` — blueprints survive Big Bang unconditionally.

**Step 3 — Construction and production engine**  
Route `POST /api/users/:username/generators/:moduleKey/construct`: validates blueprint ownership, deducts energy + material costs from inventory, appends to `user.generators` at Level 1. In `reactorRuntime.js`, add a production tick every 30 seconds: for each active generator, calculate yield since last tick, apply per-substance storage cap, write to inventory. In `GET /api/users/:username`, compute offline catch-up from `lastActiveAt` delta, capped at `generatorOfflineCap`, then update `lastActiveAt`.

**Step 4 — Upgrade route**  
Route `POST /api/users/:username/generators/:moduleKey/upgrade`: validates blueprint ownership and constructed status, deducts upgrade cost (energy + materials from config), increments `level`.

**Step 5 — UI: Prestige Branch Interface + Generators Panel**  
Redesign the existing Upgrades panel into a branch-organized prestige interface. Branch 0 (Reactor Efficiency, existing multipliers) and Branch 1 (Automation Infrastructure, blueprint shop) appear as sections within it. Add `GeneratorsPanel.jsx` as a collapsible sidebar panel visible when any blueprint is owned — shows per-module construct vs. running state, upgrade button, pause toggle, storage-capped indicator.

---

# Part III — Implementation Readiness Assessment

---

## Are we ready to begin implementation planning?

**Partially.** One of the three prior design blockers is now resolved. Two remain. Everything else is a balancing question that can be answered after the system is live.

---

## Design Blockers

These must be resolved before implementation scoping begins. They affect system architecture, not just numeric tuning.

**Blocker 1 — Shard economy decision — ✅ RESOLVED: Option C confirmed**

§P3's Option C is confirmed: existing multiplier upgrades become Branch 0 (Reactor Efficiency) within the branch architecture. Branch 1 (Automation Infrastructure) and all future branches operate alongside it in the same prestige interface. All shard spending is unified under the branch framework.

This is required by the specialization philosophy (§P2): players must be able to invest in any branch they choose, including the legacy multiplier path. Option B (deprecate multipliers) would remove a valid specialization path. Option A (multipliers as a separate category) would create a two-tier spending system that undermines the branch architecture.

This decision settles:
- ✅ The existing Upgrades panel is redesigned as a branch-organized prestige interface
- ✅ New shard spending on multiplier upgrades remains available as Branch 0
- ✅ No player shard investment is stranded or invalidated

**Blocker 2 — Blueprint costs (order of magnitude)**

Blueprint costs don't need final values yet, but they need an order of magnitude: are blueprints 3–8 shards, or 10–20 shards, or 25–50 shards? This determines:
- Whether automation is accessible on run 1 or run 3+
- Whether the shard earn rate from a single Big Bang is sufficient for any blueprint
- How blueprints are priced relative to multiplier upgrades

Without an order-of-magnitude decision, the blueprint purchase route cannot be configured meaningfully and the UI cannot show representative costs.

**Blocker 3 — Construction cost scope (which Gen 4 materials per module)**

The document names indicative materials (Graphene, Lithium-Ion Cell, Doped Silicon, etc.) but does not specify quantities. Before implementation:
- The exact Gen 4 substances for each module's construction must be confirmed
- The quantity of each substance must be confirmed (even as initial candidates)

This determines the construction validation logic and affects whether construction is affordable on first reaching Tier 9 or requires a Gen 4 stockpile first.

---

## Balancing Questions

These do not block implementation. They are expressed as config constants and tuned during Phase J playtesting after the system is live.

- **Production rates per module per level** — what does Level 1 produce per hour, and what does max level produce? Must not make feedstock trivially abundant.
- **Per-substance storage cap** — bounds stockpile size; pauses production at cap.
- **Offline accumulation cap** — bounds offline credit; calibrated in relation to storage cap and production rates.
- **Upgrade level count** — 3 vs. 5 levels has significant implications for how long module investment can sustain engagement.
- **Upgrade material costs per level** — must be significant enough that no upgrade is accidental.
- **Rebuild friction calibration** — target time from run start to first module construction in an experienced prestige run; calibrates Big Bang weight.

---

## What is already decided

These decisions do not require further confirmation:

**Prestige system philosophy:**
- ✅ Big Bang purpose: permanent infrastructure, frontier advancement, breaking economic walls (§P0)
- ✅ No prescribed progression path — players spend shards freely, no mandatory purchase order (§P1)
- ✅ Milestone targets (Big Bang #1, #5, #10, #20) are internal balancing references, not player objectives (§P1)
- ✅ Specialization is pressure, not lock-in — completionism is a valid long-term goal (§P2)
- ✅ Frontier progression: depth is rewarded over volume; farming the same tier repeatedly is not optimal (§P5)

**Architecture:**
- ✅ Option C confirmed: multipliers become Branch 0, all shard spending unified under branch architecture (§P3)
- ✅ Two-layer system (blueprint + construction)
- ✅ Blueprints persist through Big Bang unconditionally
- ✅ Constructed modules reset on Big Bang unconditionally

**Branch 1 (Automation Infrastructure):**
- ✅ Gen 1 elements only scope for V1
- ✅ Five V1 modules (names and outputs defined)
- ✅ Gen 4 materials required for construction (type TBD, concept confirmed)
- ✅ Automation never touches the synthesis queue
