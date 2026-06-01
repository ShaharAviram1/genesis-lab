# Q-G — Prestige Pressure Validation

**Phase:** Q-G (Integration validation + prestige pressure check)
**Status:** Analysis only. No code changes.
**Date:** 2026-06-01
**Inputs:** Post-Q-D economy state, current shard formula, current prestige UI/data layer

This document evaluates whether the post-Q-D state has produced a real reason to Big Bang. It is intentionally honest: design intent is not treated as evidence.

---

## 1. The standard the design set

From `economy-implementation-strategy.md`:
> Prestige pressure (the "I should Big Bang" signal) requires that the player encounters a wall they cannot overcome in the current run. If no wall exists economically, Big Bang provides no economic relief.

Two things must be true together:
- **A wall.** The current run hits a point that hurts to push through.
- **A relief mechanism.** Big Bang produces something the player can spend to make next run materially easier.

Q-D delivered the wall. The relief mechanism (Phase R blueprints) is **not yet implemented**. That asymmetry shapes every answer below.

---

## 2. Evaluation by pressure axis

### 2.1 Economic pressure — does Gen 3–4 create real accumulation friction?

**Yes. Strongly. This is the most successful Q-D outcome.**

Concrete evidence from the post-Q-D audit:

- A single **Reactive Plasma Core** demands `1 HP + 1 CryM + 2 BC`. Tracing this down:
  - 2 BC → 4 CNT + 2 ARF
  - 1 CryM → 1 CeSC + 2 CNT
  - **Total CNT required: 6.** Each CNT now needs `3 graphene + 1 carbon`. That's **18 graphenes** stockpiled for one RPC.
  - Each graphene needs `3 carbon + 2 methane`. So `36 methane` synth events sit upstream of one RPC.

- A single **Quantum Substrate** demands `1 MH + 2 CeSC`. Each CeSC now needs `1 glass + 2 doped_silicon`. Each doped_silicon needs `2 silicon + 2 gold`. Each gold needs `1 iron + 2 water`. For one QSub the player produces: **6 doped_silicon → 12 gold → 24 water**.

Both capstones now have **distinct chokepoint profiles** (RPC = CNT chain dominant; QSub = doped_silicon/gold chain dominant). The player who plans ahead by stockpiling the right intermediate before queuing the cap pays much less wall-clock time than one who queues naively. This is the exact dynamic Q-D was designed to create.

The bonus risk flag from `qb-quantity-retrofit-plan.md` — that quantity changes might collapse into pure time waiting — did not materialize. Players have actual planning decisions to make about which intermediate to over-produce.

**Verdict: economic pressure exists, and it is the strongest source of pressure currently in the game.**

---

### 2.2 Time pressure — are chains long enough to make automation attractive?

**Yes, decisively. Possibly too aggressively.**

Post-Q-D serial chain times:

| Capstone | Serial time | What that feels like |
|----------|-------------|----------------------|
| Lithium Ion Cell (Gen 3 deep) | ~10 min | Tolerable single-session goal |
| Ceramic Superconductor | ~15 min | Per-piece grind |
| Metallic Hydrogen | ~15 min | Mostly idle wait |
| Ballistic Composite | ~19 min | First "this is long" reaction |
| Nuclear Fuel Pellet | ~38 min | Multi-session commitment |
| Cryogenic Matrix | ~37 min | Multi-session commitment |
| Quantum Substrate | ~60 min | Borderline burnout territory |
| Reactive Plasma Core | ~94 min | One reaction per evening |

`MAX_SLOTS = 1` means none of this parallelizes. A player aiming for RPC commits to ~94 minutes of mostly idle time during which they earn ~22,000 unused energy (no cap).

This is "future infrastructure becomes attractive" with no asterisks. The player will *want* automation to compress these chains. The question is whether automation actually exists — which is §2.3.

**Verdict: time pressure exists at Gen 4. Some risk that 94 min RPC is past the burnout threshold for a casual player without offline progress, but that's a Phase R concern, not a Q-G one.**

---

### 2.3 Prestige value — would blueprint ownership actually help future runs?

**Conceptually yes, in practice no — because the blueprint system is a placeholder.**

What's currently shipped (`PrestigeBranchPanel.jsx`, lines 4–10):
- 5 automation modules (`atmospheric_separator`, `carbon_scrubber`, `nitrogen_condenser`, `iron_smelter`, `sulfur_extractor`)
- Each priced at `1 shard` (placeholder)
- Each labeled as "Produces: hydrogen / oxygen / carbon / nitrogen / iron / sulfur"

What's not shipped:
- **No production engine.** Owning a blueprint adds a row to `user.blueprints` but does not generate atoms over time. There is no offline accumulation, no per-tick production, no consumption integration.
- **No time-reduction blueprints.** The blueprints in scope produce base atoms — they would shave seconds off Gen 1 click reactions, which were never a bottleneck. They do nothing about the 94-minute RPC chain.
- **No queue-slot expansion blueprint.** The single-slot constraint is the root cause of Gen 4 wall-clock time. Adding parallel slots would massively change the loop. Not currently designed.

A Big Bang today nets the player 100+ shards (or 25 shards post Q-F recalibration), enough to buy all 5 placeholder blueprints in their first run — which then do nothing.

**Verdict: prestige value is currently theoretical. The walls created by Q-D are real; the relief mechanism is a stub. Phase R is the missing piece.**

---

### 2.4 Frontier motivation — would a player naturally want to push beyond previous runs?

**Yes, but only because of curiosity, not yet because of mechanical incentive.**

The current frontier signals:
- Reaching tier 12 (NFP) unlocks the RPC and QSub reaction gates — the only way to see those substances at all.
- The content bible's lore around RPC ("the reactor built a reactor") and QSub ("boundary between classical and quantum") provides narrative draw.
- Substance hint text and visual variety (color, formula) reward exploration.

What's missing for true frontier *mechanical* pull:
- No new gameplay tier unlocked beyond Gen 4 (Gen 5 is unbuilt by design).
- No "second run is qualitatively different" effect because blueprints don't function. A player who completes RPC, Big Bangs, and starts over restarts identically — only with some extra shards they can't spend on anything useful.

The frontier pull during a first ramp is strong (new substances, new colors, new walls). On the second ramp, without Phase R, the pull collapses.

**Verdict: first-run frontier motivation is healthy. Second-run motivation is missing because the prestige loop has no payoff path.**

---

## 3. Answers to the seven validation questions

### 3.1 Does a natural Big Bang moment now exist?

**Partially.** A natural *exhaustion* moment exists — after a 60-94 minute Gen 4 capstone, the player feels "I don't want to do that again the same way." That is the precursor to a Big Bang impulse.

But Big Bang itself is not yet a satisfying answer to that exhaustion, because the prestige loop has no functional relief mechanism. The player will Big Bang once out of curiosity, see that blueprints do nothing useful, and have no second reason to Big Bang again.

So: the *signal* exists. The *resolution* does not. This is the Phase R gap.

### 3.2 Where does it occur?

**Between completing the first Gen 4 capstone (NFP, ~38 min) and starting the second.**

The CNT/dSi stockpile decisions during the first RPC or QSub attempt are where the player learns the chain. The exhaustion hits when contemplating the second one — "do I really want to do another 94 minutes of this?" That is the natural Big Bang prompt.

Specifically: after producing NFP for the first time (the tier-12 gate), the path forks to either QSub (60 min) or RPC (94 min). The player who completes one and looks at the other is the candidate Big Banger.

### 3.3 What is currently the strongest wall?

**The Carbon Nanotube bottleneck inside the RPC chain.**

RPC requires 6 CNTs (via 2 BC + 1 CryM). Each CNT is now 3 graphenes (post Q-C). Each graphene is 2 methanes + 3 carbons. That's 18 graphenes / 36 methanes serialized through a single queue slot.

Just the graphene-and-CNT layer of an RPC chain is ~25 minutes of pure queue time before any Gen 4 work begins. This is the genuine wall — economic (volume), time (serialization), and structural (single slot).

The QSub equivalent (Doped Silicon path) is also a wall but smaller — 6 dSi → 12 gold → 24 water is a shorter intermediate ladder than CNT's three-tier chain.

### 3.4 What is currently the weakest prestige incentive?

**Legacy reactor efficiency upgrades** (`energy`, `matter`, `chemistry`).

These exist in the prestige panel under a collapsed "Reactor Efficiency" section labeled "Legacy — no further upgrades available". They solve problems that are no longer the binding constraints:
- `chemistry` reduces reaction energyCost by 5%/level. Reaction energyCost is not the wall.
- `matter` reduces atom cost. Atoms are still free.
- `energy` boosts energy income. Energy income is already unbounded passively over long chains.

Even if the player invested every shard into these, they would shave minutes off a 94-minute chain only via the energy multiplier (irrelevant because energy isn't a wall) — total practical benefit ≈ none.

**The placeholder automation blueprints would be the strongest if they functioned, and the weakest as currently shipped (they functionally do nothing).**

### 3.5 Is Phase R justified now?

**Yes. Unambiguously. Phase R is the bottleneck for the entire prestige loop being meaningful.**

Concretely:
- The Gen 4 walls created by Q-D are real and load-bearing.
- The shard payouts (even after Q-F recalibration) will exceed any reasonable spend target until blueprints have real functionality and real cost.
- No further Q-phase work can validate prestige pressure end-to-end until automation provides a relief mechanism.

Phase R should begin immediately after Q-F implementation. The decisions Phase R must make:
- Blueprint production rate per unit time
- Blueprint cost (in shards) — calibrated against post-Q-F shard payouts
- Offline accumulation behavior (does production continue while logged out?)
- Whether to add time-reduction or slot-expansion blueprints (the design currently only has atom-producer blueprints, which are the wrong lever for the actual walls)

### 3.6 Is Gen 5 design still blocked?

**Yes. Hard block. No movement possible until Phase R completes and a full Big Bang cycle is playtested with functional blueprints.**

The Gen 5 gate question — "what stops the player at the top of Gen 4 and forces them through a prestige loop to get further?" — cannot be answered until the prestige loop itself produces a measurable, felt benefit. Without Phase R, "Big Bang" is a cosmetic reset.

A second hidden block: Gen 5 will need a new currency / new mechanic. The strategy doc identifies "new currency scarcity" as a Phase R / Gen 5 lever. Choosing that mechanic depends on what Phase R actually exposes (offline production? automation queues? blueprint stacking?). Those are design choices Phase R must make first.

### 3.7 What remains before Gen 5 work can begin?

In strict dependency order:

1. **Resolve the lingering Q-E copper edit.** Revert `gen2_copper.energyCost` from 20 back to 14, or commit to a tracked Q-E mini-pass that includes only that change. This is a 30-second cleanup but it's blocking honest baselines.
2. **Implement Q-F.** Apply the formula change and shardValue trim from `qf-shard-recalibration-report.md`. Re-run the audit. Verify Run A/B/C payouts land in target windows.
3. **Phase R — automation infrastructure** (the big one). Three sub-pieces:
   - Production engine: blueprints generate atoms over time (online + offline).
   - Blueprint cost calibration: priced against post-Q-F shard payouts.
   - Blueprint inventory integration: produced atoms flow into `user.inventory`, consumed by reactions normally.
4. **Q-E re-run** (deferred, optional). With Phase R energy sinks in place, revisit whether reaction energyCost rebalancing actually changes pacing. May still come up empty — that's fine.
5. **Phase R integration validation.** Playtest a Big Bang → blueprint purchase → next run cycle. Confirm next run is materially easier *because* of the blueprint, not just because of the prior knowledge.
6. **Then Gen 5 design.** Start with the gate mechanism (what does the new currency look like? how is it gained?) and work outward into substance design.

Items 1–2 are < 1 day of work. Item 3 is the work. Items 4–6 follow.

---

## 4. Honest summary

**What Q-D got right:** Real walls now exist in Gen 4. CNT bottleneck and QSub depth are economic friction, not just timer friction. Players who plan ahead are rewarded. Players who queue naively pay extra time.

**What is still wrong:** The relief mechanism is a stub. Shards are produced but cannot be spent meaningfully. Big Bang is currently a one-way trip out of curiosity.

**Net pressure assessment:** the "I should Big Bang" feeling will appear *once* after the first RPC or QSub completion. It will not recur after the second run because the player will see that prestige bought nothing useful.

**Phase R is what closes this loop.** Until then, Q-D's walls exist but accomplish nothing in the prestige economy.

---

*End of Q-G validation. No code changes in this document.*
