#!/usr/bin/env node
/**
 * Economy Audit — Phase Q-A baseline measurement tool.
 *
 * Reads Gen 1–4 seed data and reports:
 *   - Intrinsic Value (IV) per substance
 *   - Generation summaries
 *   - Full reaction audit table
 *   - Economic anomalies and warnings
 *   - Energy income baseline (vs. reaction costs)
 *   - Shard payout baseline
 *
 * No database connection. No mutations. Rerun freely after any seed change.
 * Usage: node server/dev-auditEconomy.js
 *
 * Data below mirrors server/seeds/seedSubstances.js and server/seeds/seedReactions.js.
 * When seed values change, update the data arrays here to match.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// RUNTIME CONSTANTS  (mirrors server/realtime/reactorRuntime.js)
// Duplicated here to avoid requiring mongoose-coupled modules.
// ─────────────────────────────────────────────────────────────────────────────
const TICK_RATE              = 10;   // ticks per second
const ENERGY_MULTIPLIER      = 0.1;  // activity → energy/sec: energy/sec = activityLevel × ENERGY_MULTIPLIER × prestigeMultiplier
const CLICK_ACTIVITY_GAIN    = 5;    // activity added per core click
const MAX_ACTIVITY_LEVEL     = 100;  // activity cap
const ACTIVITY_DECAY_PER_SEC = 1;    // exponential decay constant per second

// Prestige energy multiplier formula: 1 + 0.2 × level (mirrors gameEconomy.js)
function prestigeEnergyMultiplier(level) { return 1 + 0.2 * level; }


// ─────────────────────────────────────────────────────────────────────────────
// SUBSTANCE DATA  (mirrors seedSubstances.js — economic fields only)
// ─────────────────────────────────────────────────────────────────────────────
// Fields: key, name, gen, isBase (→ IV = 0), shardValue
const SUBSTANCES = [
    // ── Gen 1: Base Elements (9) — IV = 0 by definition ─────────────────────
    { key: 'hydrogen',       name: 'Hydrogen',       gen: 1, isBase: true,  shard: 0 },
    { key: 'oxygen',         name: 'Oxygen',         gen: 1, isBase: true,  shard: 0 },
    { key: 'carbon',         name: 'Carbon',         gen: 1, isBase: true,  shard: 0 },
    { key: 'nitrogen',       name: 'Nitrogen',       gen: 1, isBase: true,  shard: 0 },
    { key: 'helium',         name: 'Helium',         gen: 1, isBase: true,  shard: 0 },
    { key: 'sodium',         name: 'Sodium',         gen: 1, isBase: true,  shard: 0 },
    { key: 'chlorine',       name: 'Chlorine',       gen: 1, isBase: true,  shard: 0 },
    { key: 'iron',           name: 'Iron',           gen: 1, isBase: true,  shard: 0 },
    { key: 'sulfur',         name: 'Sulfur',         gen: 1, isBase: true,  shard: 0 },
    // ── Gen 1: Synthesized (9) ────────────────────────────────────────────────
    { key: 'hydrogen_gas',   name: 'Hydrogen Gas',   gen: 1, isBase: false, shard: 0 },
    { key: 'oxygen_gas',     name: 'Oxygen Gas',     gen: 1, isBase: false, shard: 0 },
    { key: 'nitrogen_gas',   name: 'Nitrogen Gas',   gen: 1, isBase: false, shard: 0 },
    { key: 'water',          name: 'Water',          gen: 1, isBase: false, shard: 1 },
    { key: 'salt',           name: 'Salt',           gen: 1, isBase: false, shard: 1 },
    { key: 'iron_oxide',     name: 'Iron Oxide',     gen: 1, isBase: false, shard: 0 },
    { key: 'methane',        name: 'Methane',        gen: 1, isBase: false, shard: 0 },
    { key: 'ammonia',        name: 'Ammonia',        gen: 1, isBase: false, shard: 0 },
    { key: 'carbon_dioxide', name: 'Carbon Dioxide', gen: 1, isBase: false, shard: 0 },
    // ── Gen 2 (13) ────────────────────────────────────────────────────────────
    { key: 'copper',         name: 'Copper',         gen: 2, isBase: false, shard: 0 },
    { key: 'tin',            name: 'Tin',            gen: 2, isBase: false, shard: 0 },
    { key: 'nickel',         name: 'Nickel',         gen: 2, isBase: false, shard: 0 },
    { key: 'gold',           name: 'Gold',           gen: 2, isBase: false, shard: 3 },
    { key: 'bronze',         name: 'Bronze',         gen: 2, isBase: false, shard: 2 },
    { key: 'sulfuric_acid',  name: 'Sulfuric Acid',  gen: 2, isBase: false, shard: 2 },
    { key: 'nitric_acid',    name: 'Nitric Acid',    gen: 2, isBase: false, shard: 0 },
    { key: 'calcium',        name: 'Calcium',        gen: 2, isBase: false, shard: 0 },
    { key: 'quicklime',      name: 'Quicklime',      gen: 2, isBase: false, shard: 0 },
    { key: 'silicon',        name: 'Silicon',        gen: 2, isBase: false, shard: 0 },
    { key: 'quartz',         name: 'Quartz',         gen: 2, isBase: false, shard: 0 },
    { key: 'soda_ash',       name: 'Soda Ash',       gen: 2, isBase: false, shard: 0 },
    { key: 'lithium',        name: 'Lithium',        gen: 2, isBase: false, shard: 0 },
    // ── Gen 3 (9) ─────────────────────────────────────────────────────────────
    { key: 'glass',           name: 'Glass',           gen: 3, isBase: false, shard: 3 },
    { key: 'steel',           name: 'Steel',           gen: 3, isBase: false, shard: 4 },
    { key: 'stainless_steel', name: 'Stainless Steel', gen: 3, isBase: false, shard: 4 },
    { key: 'chrome',          name: 'Chrome',          gen: 3, isBase: false, shard: 0 },
    { key: 'graphene',        name: 'Graphene',        gen: 3, isBase: false, shard: 5 },
    { key: 'carbon_nanotube', name: 'Carbon Nanotube', gen: 3, isBase: false, shard: 5 },
    { key: 'aramid_fiber',    name: 'Aramid Fiber',    gen: 3, isBase: false, shard: 4 },
    { key: 'doped_silicon',   name: 'Doped Silicon',   gen: 3, isBase: false, shard: 4 },
    { key: 'lithium_ion_cell',name: 'Lithium Ion Cell',gen: 3, isBase: false, shard: 6 },
    // ── Gen 4 (8) ─────────────────────────────────────────────────────────────
    { key: 'hydrogen_plasma',       name: 'Hydrogen Plasma',       gen: 4, isBase: false, shard: 8  },
    { key: 'ballistic_composite',   name: 'Ballistic Composite',   gen: 4, isBase: false, shard: 8  },
    { key: 'ceramic_superconductor',name: 'Ceramic Superconductor',gen: 4, isBase: false, shard: 10 },
    { key: 'metallic_hydrogen',     name: 'Metallic Hydrogen',     gen: 4, isBase: false, shard: 12 },
    { key: 'cryogenic_matrix',      name: 'Cryogenic Matrix',      gen: 4, isBase: false, shard: 11 },
    { key: 'nuclear_fuel_pellet',   name: 'Nuclear Fuel Pellet',   gen: 4, isBase: false, shard: 14 },
    { key: 'reactive_plasma_core',  name: 'Reactive Plasma Core',  gen: 4, isBase: false, shard: 16 },
    { key: 'quantum_substrate',     name: 'Quantum Substrate',     gen: 4, isBase: false, shard: 15 },
];

const substanceMap = {};
for (const s of SUBSTANCES) substanceMap[s.key] = s;


// ─────────────────────────────────────────────────────────────────────────────
// REACTION DATA  (mirrors seedReactions.js — economic fields only)
// ─────────────────────────────────────────────────────────────────────────────
// Fields: key, name, gen, unlockTier, energyCost, time (seconds),
//         reactants [{key, qty}], product {key, qty}, conditions []
const REACTIONS = [
    // ── Gen 1: Element Pairing ────────────────────────────────────────────────
    { key:'gen1_hydrogen_gas', name:'Hydrogen Gas Synthesis',  gen:1, unlockTier:0, energyCost:1,   time:0,
      reactants:[{key:'hydrogen',qty:2}],                               product:{key:'hydrogen_gas',qty:1},   conditions:[] },
    { key:'gen1_oxygen_gas',   name:'Oxygen Gas Synthesis',    gen:1, unlockTier:0, energyCost:1,   time:0,
      reactants:[{key:'oxygen',qty:2}],                                 product:{key:'oxygen_gas',qty:1},     conditions:[] },
    { key:'gen1_nitrogen_gas', name:'Nitrogen Gas Synthesis',  gen:1, unlockTier:0, energyCost:1,   time:0,
      reactants:[{key:'nitrogen',qty:2}],                               product:{key:'nitrogen_gas',qty:1},   conditions:[] },

    // ── Gen 1: Basic Synthesis ────────────────────────────────────────────────
    { key:'gen1_water',          name:'Water Synthesis',          gen:1, unlockTier:0, energyCost:5,  time:0,
      reactants:[{key:'hydrogen_gas',qty:1},{key:'oxygen',qty:1}],      product:{key:'water',qty:1},          conditions:[] },
    { key:'gen1_salt',           name:'Salt Crystallization',     gen:1, unlockTier:1, energyCost:4,  time:0,
      reactants:[{key:'sodium',qty:1},{key:'chlorine',qty:1}],          product:{key:'salt',qty:1},           conditions:[] },
    { key:'gen1_iron_oxide',     name:'Iron Oxidation',           gen:1, unlockTier:2, energyCost:5,  time:3,
      reactants:[{key:'iron',qty:2},{key:'oxygen_gas',qty:1}],          product:{key:'iron_oxide',qty:1},     conditions:[] },
    { key:'gen1_carbon_dioxide', name:'Carbon Dioxide Synthesis', gen:1, unlockTier:1, energyCost:6,  time:2,
      reactants:[{key:'carbon',qty:1},{key:'oxygen_gas',qty:1}],        product:{key:'carbon_dioxide',qty:1}, conditions:[] },
    { key:'gen1_methane',        name:'Methane Synthesis',        gen:1, unlockTier:1, energyCost:8,  time:2,
      reactants:[{key:'carbon',qty:1},{key:'hydrogen_gas',qty:1}],      product:{key:'methane',qty:1},        conditions:[] },
    { key:'gen1_ammonia',        name:'Ammonia Synthesis',        gen:1, unlockTier:2, energyCost:8,  time:3,
      reactants:[{key:'nitrogen_gas',qty:1},{key:'hydrogen_gas',qty:1}],product:{key:'ammonia',qty:1},        conditions:[] },

    // ── Gen 2: The Foundry ────────────────────────────────────────────────────
    { key:'gen2_copper',     name:'Copper Smelting',    gen:2, unlockTier:3, energyCost:14, time:8,
      reactants:[{key:'iron_oxide',qty:2},{key:'sulfur',qty:1}],        product:{key:'copper',qty:1},         conditions:[] },
    { key:'gen2_tin',        name:'Tin Reduction',      gen:2, unlockTier:3, energyCost:14, time:8,
      reactants:[{key:'iron_oxide',qty:2},{key:'carbon',qty:1}],        product:{key:'tin',qty:1},            conditions:[] },
    { key:'gen2_nickel',     name:'Nickel Extraction',  gen:2, unlockTier:5, energyCost:16, time:20,
      reactants:[{key:'iron_oxide',qty:1},{key:'ammonia',qty:2}],       product:{key:'nickel',qty:1},         conditions:[] },
    { key:'gen2_gold',       name:'Gold Precipitation', gen:2, unlockTier:6, energyCost:22, time:25,
      reactants:[{key:'iron',qty:1},{key:'water',qty:2}],               product:{key:'gold',qty:1},           conditions:[] },
    { key:'gen2_bronze',     name:'Bronze Alloying',    gen:2, unlockTier:4, energyCost:18, time:12,
      reactants:[{key:'copper',qty:2},{key:'tin',qty:1}],               product:{key:'bronze',qty:1},         conditions:[] },

    // ── Gen 2: Chemical Works ─────────────────────────────────────────────────
    { key:'gen2_sulfuric_acid',name:'Sulfuric Acid Synthesis', gen:2, unlockTier:3, energyCost:20, time:15,
      reactants:[{key:'sulfur',qty:1},{key:'water',qty:1},{key:'oxygen_gas',qty:1}], product:{key:'sulfuric_acid',qty:1}, conditions:[] },
    { key:'gen2_nitric_acid',  name:'Nitric Acid Synthesis',   gen:2, unlockTier:4, energyCost:18, time:15,
      reactants:[{key:'ammonia',qty:1},{key:'oxygen_gas',qty:1}],       product:{key:'nitric_acid',qty:1},    conditions:[] },
    { key:'gen2_calcium',      name:'Calcium Extraction',      gen:2, unlockTier:4, energyCost:14, time:10,
      reactants:[{key:'salt',qty:1},{key:'water',qty:1}],               product:{key:'calcium',qty:1},        conditions:[] },
    { key:'gen2_quicklime',    name:'Quicklime Synthesis',     gen:2, unlockTier:5, energyCost:12, time:10,
      reactants:[{key:'calcium',qty:1},{key:'oxygen_gas',qty:1}],       product:{key:'quicklime',qty:1},      conditions:[] },

    // ── Gen 2: Materials Bench ────────────────────────────────────────────────
    { key:'gen2_silicon',   name:'Silicon Reduction', gen:2, unlockTier:5, energyCost:20, time:20,
      reactants:[{key:'carbon',qty:2},{key:'iron_oxide',qty:1}],        product:{key:'silicon',qty:1},        conditions:[] },
    { key:'gen2_quartz',    name:'Quartz Formation',  gen:2, unlockTier:6, energyCost:15, time:15,
      reactants:[{key:'silicon',qty:1},{key:'oxygen_gas',qty:1}],       product:{key:'quartz',qty:1},         conditions:[] },
    { key:'gen2_soda_ash',  name:'Soda Ash Synthesis',gen:2, unlockTier:2, energyCost:14, time:8,
      reactants:[{key:'sodium',qty:2},{key:'carbon_dioxide',qty:1}],    product:{key:'soda_ash',qty:1},       conditions:[] },
    { key:'gen2_lithium',   name:'Lithium Isolation', gen:2, unlockTier:7, energyCost:18, time:30,
      reactants:[{key:'salt',qty:2},{key:'hydrogen_gas',qty:1}],        product:{key:'lithium',qty:1},        conditions:[] },

    // ── Gen 3: The Materials Lab ──────────────────────────────────────────────
    { key:'gen3_glass',           name:'Glass Fusion',              gen:3, unlockTier:7, energyCost:30, time:60,
      reactants:[{key:'quartz',qty:2},{key:'soda_ash',qty:1},{key:'quicklime',qty:1}], product:{key:'glass',qty:1}, conditions:[] },
    { key:'gen3_steel',           name:'Steel Smelting',            gen:3, unlockTier:6, energyCost:35, time:45,
      reactants:[{key:'iron',qty:3},{key:'carbon',qty:1}],              product:{key:'steel',qty:1},          conditions:[] },
    { key:'gen3_chrome',          name:'Chrome Refining',           gen:3, unlockTier:7, energyCost:32, time:45,
      reactants:[{key:'iron_oxide',qty:2},{key:'sulfuric_acid',qty:1}], product:{key:'chrome',qty:1},         conditions:[] },
    { key:'gen3_stainless_steel', name:'Stainless Steel Alloying',  gen:3, unlockTier:8, energyCost:40, time:90,
      reactants:[{key:'steel',qty:2},{key:'chrome',qty:2},{key:'nickel',qty:1}], product:{key:'stainless_steel',qty:1}, conditions:[] },
    { key:'gen3_graphene',        name:'Graphene Deposition',       gen:3, unlockTier:8, energyCost:50, time:90,
      reactants:[{key:'carbon',qty:3},{key:'methane',qty:2}],           product:{key:'graphene',qty:1},       conditions:[] },
    { key:'gen3_carbon_nanotube', name:'Carbon Nanotube Growth',    gen:3, unlockTier:9, energyCost:60, time:120,
      reactants:[{key:'graphene',qty:3},{key:'carbon',qty:1}],          product:{key:'carbon_nanotube',qty:1},conditions:[] },
    { key:'gen3_aramid_fiber',    name:'Aramid Fiber Synthesis',    gen:3, unlockTier:8, energyCost:45, time:90,
      reactants:[{key:'ammonia',qty:2},{key:'carbon',qty:2},{key:'nitrogen',qty:1}], product:{key:'aramid_fiber',qty:1}, conditions:[] },
    { key:'gen3_doped_silicon',   name:'Silicon Doping',            gen:3, unlockTier:9, energyCost:42, time:90,
      reactants:[{key:'silicon',qty:2},{key:'gold',qty:2}],             product:{key:'doped_silicon',qty:1},  conditions:[] },
    { key:'gen3_lithium_ion_cell',name:'Lithium Ion Cell Assembly', gen:3, unlockTier:9, energyCost:70, time:180,
      reactants:[{key:'lithium',qty:2},{key:'graphene',qty:2},{key:'doped_silicon',qty:1}], product:{key:'lithium_ion_cell',qty:1}, conditions:[] },

    // ── Gen 4: Tier 9 entry ───────────────────────────────────────────────────
    { key:'gen4_hydrogen_plasma',     name:'Hydrogen Plasma Ionization',   gen:4, unlockTier:9,  energyCost:100, time:180,
      reactants:[{key:'hydrogen',qty:1}],                                  product:{key:'hydrogen_plasma',qty:1},     conditions:['plasma_state','extreme_temperature'] },
    { key:'gen4_ballistic_composite', name:'Ballistic Composite Sintering',gen:4, unlockTier:9,  energyCost:120, time:270,
      reactants:[{key:'aramid_fiber',qty:1},{key:'carbon_nanotube',qty:2}],product:{key:'ballistic_composite',qty:1}, conditions:['extreme_temperature','high_pressure'] },

    // ── Gen 4: Tier 10 ────────────────────────────────────────────────────────
    { key:'gen4_ceramic_superconductor',name:'Ceramic Superconductor Formation',gen:4, unlockTier:10, energyCost:200, time:360,
      reactants:[{key:'glass',qty:1},{key:'doped_silicon',qty:2}],        product:{key:'ceramic_superconductor',qty:1}, conditions:['extreme_cold'] },
    { key:'gen4_metallic_hydrogen',     name:'Metallic Hydrogen Compression', gen:4, unlockTier:10, energyCost:300, time:720,
      reactants:[{key:'hydrogen_plasma',qty:1}],                           product:{key:'metallic_hydrogen',qty:1},    conditions:['extreme_pressure'] },

    // ── Gen 4: Tier 11 ────────────────────────────────────────────────────────
    { key:'gen4_cryogenic_matrix',   name:'Cryogenic Matrix Assembly',       gen:4, unlockTier:11, energyCost:250, time:540,
      reactants:[{key:'ceramic_superconductor',qty:1},{key:'carbon_nanotube',qty:2}], product:{key:'cryogenic_matrix',qty:1}, conditions:['extreme_cold','vacuum'] },
    { key:'gen4_nuclear_fuel_pellet',name:'Nuclear Fuel Pellet Fabrication', gen:4, unlockTier:11, energyCost:350, time:720,
      reactants:[{key:'metallic_hydrogen',qty:1},{key:'stainless_steel',qty:2}],      product:{key:'nuclear_fuel_pellet',qty:1}, conditions:['extreme_pressure','radiation_bombardment'] },

    // ── Gen 4: Tier 12 capstones ──────────────────────────────────────────────
    { key:'gen4_reactive_plasma_core',name:'Reactive Plasma Core Assembly',  gen:4, unlockTier:12, energyCost:500, time:900,
      reactants:[{key:'hydrogen_plasma',qty:1},{key:'cryogenic_matrix',qty:1},{key:'ballistic_composite',qty:2}], product:{key:'reactive_plasma_core',qty:1}, conditions:['plasma_state'] },
    { key:'gen4_quantum_substrate',   name:'Quantum Substrate Lattice',      gen:4, unlockTier:12, energyCost:450, time:900,
      reactants:[{key:'metallic_hydrogen',qty:1},{key:'ceramic_superconductor',qty:2}], product:{key:'quantum_substrate',qty:1}, conditions:['extreme_pressure','extreme_cold'] },
];

// Build: productKey → [reactions that produce it]  (for multi-path detection)
const producerMap = {};
for (const r of REACTIONS) {
    const pk = r.product.key;
    if (!producerMap[pk]) producerMap[pk] = [];
    producerMap[pk].push(r);
}


// ─────────────────────────────────────────────────────────────────────────────
// IV CALCULATION
// IV(substance) = energyCost + Σ(IV(reactant) × quantity)
// Base elements: IV = 0.
// Multiple reactions: lowest IV path chosen.
// ─────────────────────────────────────────────────────────────────────────────
const ivCache = {};
const ivVisiting = new Set(); // cycle guard (shouldn't occur, but defensive)

function computeIV(substanceKey) {
    if (ivCache[substanceKey] !== undefined) return ivCache[substanceKey];

    const sub = substanceMap[substanceKey];
    if (!sub) {
        console.warn(`  [WARN] Unknown substance key in reaction: '${substanceKey}' — treating IV as 0`);
        return 0;
    }

    // Base elements are the economic floor — clicking generates energy, not consumes it
    if (sub.isBase) {
        ivCache[substanceKey] = 0;
        return 0;
    }

    const producers = producerMap[substanceKey];
    if (!producers || producers.length === 0) {
        // No known reaction produces this — fallback to 0 with warning
        console.warn(`  [WARN] No reaction produces '${substanceKey}' — IV set to 0`);
        ivCache[substanceKey] = 0;
        return 0;
    }

    if (ivVisiting.has(substanceKey)) {
        console.warn(`  [WARN] Cycle detected for '${substanceKey}' — breaking with IV=0`);
        return 0;
    }
    ivVisiting.add(substanceKey);

    let lowestIV = Infinity;
    for (const reaction of producers) {
        let iv = reaction.energyCost;
        for (const r of reaction.reactants) {
            iv += computeIV(r.key) * r.qty;
        }
        if (iv < lowestIV) lowestIV = iv;
    }

    ivVisiting.delete(substanceKey);
    ivCache[substanceKey] = lowestIV;
    return lowestIV;
}

// Pre-compute all IVs
for (const s of SUBSTANCES) computeIV(s.key);


// ─────────────────────────────────────────────────────────────────────────────
// STATISTICAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function median(arr) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
function fmt(n) { return typeof n === 'number' ? n.toFixed(1) : String(n); }
function pad(str, w, right = false) {
    const s = String(str);
    if (right) return s.padStart(w);
    return s.padEnd(w);
}
function hr(char = '─', width = 80) { return char.repeat(width); }
function fmtTime(seconds) {
    if (seconds === 0) return 'instant';
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s ? `${m}m ${s}s` : `${m}m`;
}


// ─────────────────────────────────────────────────────────────────────────────
// CHAIN ANALYSIS: minimum serial synthesis time for a substance
// ─────────────────────────────────────────────────────────────────────────────
const chainTimeCache = {};
function chainTime(substanceKey) {
    if (chainTimeCache[substanceKey] !== undefined) return chainTimeCache[substanceKey];
    const sub = substanceMap[substanceKey];
    if (!sub || sub.isBase) { chainTimeCache[substanceKey] = 0; return 0; }
    const producers = producerMap[substanceKey];
    if (!producers || !producers.length) { chainTimeCache[substanceKey] = 0; return 0; }
    // Use lowest-IV path's reaction for time (same reaction as IV winner)
    let bestTime = Infinity;
    let bestIV = Infinity;
    for (const r of producers) {
        let iv = r.energyCost;
        for (const rr of r.reactants) iv += computeIV(rr.key) * rr.qty;
        if (iv < bestIV) {
            bestIV = iv;
            // Serial chain time: this reaction's time + max of reactant chain times
            // (assumes single queue slot — fully serialized)
            let t = r.time;
            for (const rr of r.reactants) t += chainTime(rr.key) * rr.qty;
            bestTime = t;
        }
    }
    chainTimeCache[substanceKey] = bestTime;
    return bestTime;
}


// ─────────────────────────────────────────────────────────────────────────────
// TOTAL ATOM CLICKS for a substance (base element uses = 1 click each)
// ─────────────────────────────────────────────────────────────────────────────
const atomClickCache = {};
function totalAtomClicks(substanceKey) {
    if (atomClickCache[substanceKey] !== undefined) return atomClickCache[substanceKey];
    const sub = substanceMap[substanceKey];
    if (!sub || sub.isBase) { atomClickCache[substanceKey] = 1; return 1; }
    const producers = producerMap[substanceKey];
    if (!producers || !producers.length) { atomClickCache[substanceKey] = 0; return 0; }
    let bestClicks = Infinity;
    let bestIV = Infinity;
    for (const r of producers) {
        let iv = r.energyCost;
        for (const rr of r.reactants) iv += computeIV(rr.key) * rr.qty;
        if (iv < bestIV) {
            bestIV = iv;
            let clicks = 0;
            for (const rr of r.reactants) clicks += totalAtomClicks(rr.key) * rr.qty;
            bestClicks = clicks;
        }
    }
    atomClickCache[substanceKey] = bestClicks;
    return bestClicks;
}


// ─────────────────────────────────────────────────────────────────────────────
// SHARD FORMULA  (mirrors server/utils/calculateGenesisShards.js)
// genesisShards = unlockTier² - 1 + Σ(shardValue + log₂(produced+1))
// Only substances with shardValue > 0 contribute.
// ─────────────────────────────────────────────────────────────────────────────
function estimateShards(unlockTier, produced) {
    // produced: Map<substanceKey, count>
    let shards = Math.pow(unlockTier, 2) - 1;
    for (const [key, count] of produced.entries()) {
        const sub = substanceMap[key];
        if (sub && sub.shard > 0) {
            shards += sub.shard + Math.log2(count + 1);
        }
    }
    return Math.round(shards);
}


// ─────────────────────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n' + hr('═'));
console.log('  GENESIS LAB — ECONOMY AUDIT REPORT  (Post Q-B/C/D quantities)');
console.log('  Generated: ' + new Date().toISOString());
console.log(hr('═'));


// ── Section 1: IV Verification — Base Values ──────────────────────────────────
console.log('\n' + hr());
console.log('  1. BASE VALUES (Base Elements — IV = 0 by definition)');
console.log(hr());
const baseEls = SUBSTANCES.filter(s => s.isBase);
console.log(`  ${baseEls.map(s => s.name).join(', ')}`);
console.log(`  Count: ${baseEls.length}   All IV = 0 (clicking generates energy, not consumes it)`);

const missingShardable = SUBSTANCES.filter(s => !s.isBase && s.shard === 0 && ivCache[s.key] > 50);
if (missingShardable.length) {
    console.log(`\n  Substances with IV > 50 but no shard value (potential missing shardValue):`);
    for (const s of missingShardable) {
        console.log(`    ⚠  ${pad(s.name, 24)} Gen${s.gen}  IV=${fmt(ivCache[s.key])}`);
    }
}


// ── Section 2: Reaction IV Table ──────────────────────────────────────────────
console.log('\n' + hr());
console.log('  2. REACTION IV TABLE (all reactions, sorted by generationTier then IV)');
console.log(hr());
console.log(`  ${'Reaction Key'.padEnd(35)} ${'Gen'.padEnd(4)} ${'Unlock'.padEnd(7)} ${'ECost'.padEnd(6)} ${'Time'.padEnd(8)} ${'Reactants (qty×sub)'.padEnd(34)} ${'Product IV'}`);
console.log('  ' + hr('─', 78));

const sortedReactions = [...REACTIONS].sort((a, b) =>
    a.gen !== b.gen ? a.gen - b.gen : ivCache[a.product.key] - ivCache[b.product.key]
);

let lastGen = 0;
for (const r of sortedReactions) {
    if (r.gen !== lastGen) {
        if (lastGen !== 0) console.log('  ' + hr('┄', 78));
        console.log(`  ${'── Gen ' + r.gen + ' '}${hr('─', 71 - 7)}`);
        lastGen = r.gen;
    }
    const reactantStr = r.reactants.map(rr => `${rr.qty}×${rr.key}`).join(', ');
    const productIV = ivCache[r.product.key];
    const reactantIVSum = r.reactants.reduce((acc, rr) => acc + computeIV(rr.key) * rr.qty, 0);
    const energyShare = r.energyCost / productIV * 100;
    const warning = productIV < 1 ? '⚠ IV=0' : '';
    console.log(
        `  ${pad(r.key, 35)} ${pad('G'+r.gen, 4)} ${pad('T'+r.unlockTier, 7)} ${pad(r.energyCost, 6)} ${pad(fmtTime(r.time), 8)} ` +
        `${pad(reactantStr.length > 33 ? reactantStr.slice(0, 31) + '..' : reactantStr, 34)} ` +
        `IV=${pad(fmt(productIV), 7)} ${warning}`
    );
}


// ── Section 3: Generation Summary ─────────────────────────────────────────────
console.log('\n' + hr());
console.log('  3. GENERATION SUMMARY');
console.log(hr());
console.log(`  ${'Gen'.padEnd(5)} ${'Count'.padEnd(7)} ${'AvgIV'.padEnd(9)} ${'MedianIV'.padEnd(10)} ${'MaxIV'.padEnd(9)} ${'Capstone'.padEnd(26)} ${'AvgTime'.padEnd(9)} ${'MaxTime'}`);
console.log('  ' + hr('─', 78));

const generationMultipliers = [];
let prevAvgIV = null;

for (let g = 1; g <= 4; g++) {
    const genSubs = SUBSTANCES.filter(s => s.gen === g && !s.isBase);
    const genReactions = REACTIONS.filter(r => r.gen === g);

    const ivs = genSubs.map(s => ivCache[s.key]);
    const times = genReactions.map(r => r.time);

    const avgIV    = avg(ivs);
    const medianIV = median(ivs);
    const maxIV    = Math.max(...ivs);
    const capstone = genSubs.find(s => ivCache[s.key] === maxIV);
    const avgTime  = avg(times);
    const maxTime  = Math.max(...times);

    if (prevAvgIV !== null) {
        generationMultipliers.push({ from: g - 1, to: g, mult: avgIV / prevAvgIV });
    }
    prevAvgIV = avgIV;

    console.log(
        `  ${pad('Gen '+g, 5)} ${pad(genSubs.length, 7)} ${pad(fmt(avgIV), 9)} ${pad(fmt(medianIV), 10)} ` +
        `${pad(fmt(maxIV), 9)} ${pad(capstone ? capstone.name.slice(0, 24) : '?', 26)} ` +
        `${pad(fmtTime(Math.round(avgTime)), 9)} ${fmtTime(maxTime)}`
    );
}

console.log('\n  Generation-to-generation IV multipliers:');
for (const m of generationMultipliers) {
    console.log(`    Gen ${m.from} → Gen ${m.to}: ${m.mult.toFixed(2)}×`);
}

console.log('\n  Intra-generation spread (max/min IV, excluding base elements):');
for (let g = 1; g <= 4; g++) {
    const ivs = SUBSTANCES.filter(s => s.gen === g && !s.isBase).map(s => ivCache[s.key]).filter(v => v > 0);
    const spread = ivs.length >= 2 ? Math.max(...ivs) / Math.min(...ivs) : 0;
    console.log(`    Gen ${g}: ${spread.toFixed(1)}×  (min=${fmt(Math.min(...ivs))}, max=${fmt(Math.max(...ivs))})`);
}


// ── Section 4: Chain Depth Analysis ──────────────────────────────────────────
console.log('\n' + hr());
console.log('  4. SYNTHESIS CHAIN DEPTH  (minimum serial time, single queue slot)');
console.log(hr());
console.log(`  ${'Substance'.padEnd(26)} ${'Gen'.padEnd(5)} ${'IV'.padEnd(8)} ${'Serial Time'.padEnd(14)} ${'Atom Clicks'}`);
console.log('  ' + hr('─', 65));

const capstoneCandidates = [
    'lithium_ion_cell', 'reactive_plasma_core', 'quantum_substrate',
    'nuclear_fuel_pellet', 'cryogenic_matrix', 'metallic_hydrogen',
    'graphene', 'stainless_steel', 'bronze', 'doped_silicon',
    'ceramic_superconductor', 'ballistic_composite',
];
for (const key of capstoneCandidates) {
    const sub = substanceMap[key];
    if (!sub) continue;
    const t = chainTime(key);
    const clicks = totalAtomClicks(key);
    console.log(
        `  ${pad(sub.name, 26)} ${pad('Gen'+sub.gen, 5)} ${pad(fmt(ivCache[key]), 8)} ` +
        `${pad(fmtTime(t), 14)} ${clicks} clicks`
    );
}


// ── Section 5: Energy Income Baseline ─────────────────────────────────────────
console.log('\n' + hr());
console.log('  5. ENERGY INCOME BASELINE  (from reactorRuntime.js constants)');
console.log(hr());
console.log(`  Constants:`);
console.log(`    ENERGY_MULTIPLIER      = ${ENERGY_MULTIPLIER}`);
console.log(`    CLICK_ACTIVITY_GAIN    = ${CLICK_ACTIVITY_GAIN}  (activity gained per core click)`);
console.log(`    MAX_ACTIVITY_LEVEL     = ${MAX_ACTIVITY_LEVEL}`);
console.log(`    ACTIVITY_DECAY_PER_SEC = ${ACTIVITY_DECAY_PER_SEC}  (exponential decay constant)`);
console.log(`    TICK_RATE              = ${TICK_RATE} ticks/sec`);

console.log(`\n  Formula: energy/sec = activityLevel × ENERGY_MULTIPLIER × prestigeMultiplier`);
console.log(`  (dt-based integration — tick rate cancels out; rate = activity × 0.1 × multiplier)`);

const activityScenarios = [
    { label: 'Idle (no clicks)',         activity: 0  },
    { label: 'Low activity (10)',        activity: 10 },
    { label: 'Moderate activity (40)',   activity: 40 },
    { label: 'Max activity (100)',       activity: 100 },
];

console.log(`\n  ${'Scenario'.padEnd(30)} ${'Energy/sec'.padEnd(12)} ${'Energy/min'.padEnd(12)} ${'Prestige×2 /sec'}`);
console.log('  ' + hr('─', 60));
for (const sc of activityScenarios) {
    const eps  = sc.activity * ENERGY_MULTIPLIER;
    const epm  = eps * 60;
    const eps2 = eps * prestigeEnergyMultiplier(5); // level 5 = 2.0×
    console.log(`  ${pad(sc.label, 30)} ${pad(fmt(eps), 12)} ${pad(fmt(epm), 12)} ${fmt(eps2)}`);
}

console.log('\n  Time to accumulate capstone energyCost from zero (moderate activity=40, no prestige):');
const energyPerSec40 = 40 * ENERGY_MULTIPLIER;
const capstones = [
    { name: 'Gen 1 max (Ammonia)',           cost: 8   },
    { name: 'Gen 2 max (Bronze)',             cost: 18  },
    { name: 'Gen 3 max (Lithium Ion Cell)',   cost: 70  },
    { name: 'Gen 4 entry (H Plasma)',         cost: 100 },
    { name: 'Gen 4 cap (RPC 500)',            cost: 500 },
];
console.log(`\n  ${'Reaction'.padEnd(38)} ${'EnergyCost'.padEnd(12)} ${'Seconds to afford'}`);
console.log('  ' + hr('─', 60));
for (const c of capstones) {
    const sec = c.cost / energyPerSec40;
    console.log(`  ${pad(c.name, 38)} ${pad(c.cost, 12)} ${sec.toFixed(1)}s`);
}

console.log('\n  Income vs. demand ratio (income rate / energy spend rate during synthesis):');
const rpcReaction = REACTIONS.find(r => r.key === 'gen4_reactive_plasma_core');
const rpcSpendRate = rpcReaction.energyCost / rpcReaction.time;
const rpcRatioMod = energyPerSec40 / rpcSpendRate;
const rpcRatioMax = (MAX_ACTIVITY_LEVEL * ENERGY_MULTIPLIER) / rpcSpendRate;
console.log(`    RPC (500 energy / 900s = ${rpcSpendRate.toFixed(2)} energy/sec spend rate)`);
console.log(`    At activity 40 (${energyPerSec40} energy/sec income): ratio = ${rpcRatioMod.toFixed(0)}:1`);
console.log(`    At max activity (${MAX_ACTIVITY_LEVEL * ENERGY_MULTIPLIER} energy/sec income): ratio = ${rpcRatioMax.toFixed(0)}:1`);
console.log('\n  ⚠ NOTE: economic-progression-analysis.md reported 40 energy/sec at activity 40.');
console.log('    Actual formula (activity × 0.1 × dt, dt in seconds) gives 4 energy/sec.');
console.log('    The analysis doc overestimated income by 10×. Income/demand ratio is ~7:1, not 70:1.');
console.log('    Conclusion unchanged: energy is not a meaningful wall. But the margin is smaller.');


// ── Section 6: Shard Baseline ─────────────────────────────────────────────────
console.log('\n' + hr());
console.log('  6. SHARD BASELINE  (formula: unlockTier² - 1 + Σ(shardValue + log₂(produced+1)))');
console.log(hr());

// Scenario A: Shallow Gen 1 run — just water and salt
const scenA = new Map([['water', 1], ['salt', 1]]);
const shardsA = estimateShards(2, scenA);

// Scenario B: Gen 3 complete run — 1 of each Gen 1–3 substance with shard > 0
const scenB = new Map([
    ['water', 1], ['salt', 1],
    ['gold', 1], ['bronze', 1], ['sulfuric_acid', 1],
    ['glass', 1], ['steel', 1], ['stainless_steel', 1],
    ['graphene', 1], ['carbon_nanotube', 1], ['aramid_fiber', 1],
    ['doped_silicon', 1], ['lithium_ion_cell', 1],
]);
const shardsB = estimateShards(10, scenB);

// Scenario C: Gen 4 deep run — 1 of each Gen 1–4 shard substance
const scenC = new Map([
    ['water', 1], ['salt', 1],
    ['gold', 1], ['bronze', 1], ['sulfuric_acid', 1],
    ['glass', 1], ['steel', 1], ['stainless_steel', 1],
    ['graphene', 1], ['carbon_nanotube', 1], ['aramid_fiber', 1],
    ['doped_silicon', 1], ['lithium_ion_cell', 1],
    ['hydrogen_plasma', 1], ['ballistic_composite', 1],
    ['ceramic_superconductor', 1], ['metallic_hydrogen', 1],
    ['cryogenic_matrix', 1], ['nuclear_fuel_pellet', 1],
    ['reactive_plasma_core', 1], ['quantum_substrate', 1],
]);
const shardsC = estimateShards(12, scenC);

console.log('  Substance shard values by generation:');
for (let g = 1; g <= 4; g++) {
    const shardSubs = SUBSTANCES.filter(s => s.gen === g && s.shard > 0);
    if (!shardSubs.length) { console.log(`  Gen ${g}: (no shard-valued substances)`); continue; }
    console.log(`  Gen ${g}: ` + shardSubs.map(s => `${s.name}(${s.shard})`).join(', '));
}

console.log('\n  Estimated shard payouts (approximate — assumes 1 unit produced of each):');
console.log(`    Shallow Gen 1 run (water×1, salt×1,    unlockTier=2):  ~${shardsA} shards`);
console.log(`    Gen 3 complete   (Gen1-3 shard subs×1, unlockTier=10): ~${shardsB} shards`);
console.log(`    Gen 4 deep       (Gen1-4 shard subs×1, unlockTier=12): ~${shardsC} shards`);

const unlockTierDominance = Math.pow(10, 2) - 1;
const shardContribB = shardsB - unlockTierDominance;
console.log(`\n  unlockTier² term at T=10: ${unlockTierDominance} shards (${Math.round(unlockTierDominance/shardsB*100)}% of Gen3 total)`);
console.log(`  Substance shard contribution in Gen3 run: ${shardContribB} shards`);
console.log(`  ⚠ unlockTier² dominates payout — depth of run drives shards more than production volume.`);

console.log('\n  Strategy targets from economy-implementation-strategy.md:');
console.log('    Gen 3 run target:   15–30 shards');
console.log('    Gen 4 deep target:  40–80 shards');
console.log(`    Current Gen 3 estimate: ~${shardsB}  ${shardsB > 30 ? '⚠ ABOVE TARGET' : '✓ in range'}`);
console.log(`    Current Gen 4 estimate: ~${shardsC}  ${shardsC > 80 ? '⚠ ABOVE TARGET' : '✓ in range'}`);
console.log('    ⚠ unlockTier² must be revisited in Q-F shard recalibration.');


// ── Section 7: Anomalies and Warnings ────────────────────────────────────────
console.log('\n' + hr());
console.log('  7. ANOMALIES / WARNINGS');
console.log(hr());

const anomalies = [];

// A. Later-gen substance with lower IV than earlier-gen average
const genAvgIVs = {};
for (let g = 1; g <= 4; g++) {
    const ivs = SUBSTANCES.filter(s => s.gen === g && !s.isBase).map(s => ivCache[s.key]);
    genAvgIVs[g] = avg(ivs);
}
for (const s of SUBSTANCES.filter(s => !s.isBase)) {
    for (let earlier = 1; earlier < s.gen; earlier++) {
        if (ivCache[s.key] < genAvgIVs[earlier]) {
            anomalies.push({
                severity: '⚠ ',
                msg: `${s.name} (Gen${s.gen}) has IV=${fmt(ivCache[s.key])} — BELOW Gen${earlier} avg IV=${fmt(genAvgIVs[earlier])}`
            });
        }
    }
}

// B. energyCost tiny relative to reactant IV sum (energy contribution < 10%)
for (const r of REACTIONS) {
    const reactantIVTotal = r.reactants.reduce((acc, rr) => acc + computeIV(rr.key) * rr.qty, 0);
    if (reactantIVTotal > 0 && r.energyCost / reactantIVTotal < 0.1) {
        anomalies.push({
            severity: 'ℹ ',
            msg: `${r.key}: energyCost ${r.energyCost} is only ${(r.energyCost/reactantIVTotal*100).toFixed(1)}% of reactant IV (${fmt(reactantIVTotal)}) — energy cost is nearly decorative`
        });
    }
}

// C. All-quantity-1 reactions in Gen 3–4
for (const r of REACTIONS.filter(r => r.gen >= 3)) {
    const allOne = r.reactants.every(rr => rr.qty === 1);
    if (allOne && r.reactants.length < 3) {
        anomalies.push({
            severity: 'ℹ ',
            msg: `${r.key} (Gen${r.gen}): all reactant quantities are 1 — no quantity scarcity`
        });
    }
}

// D. Substance with shardValue=0 but expected to have one (Gen 3+ high IV)
const expectedShardThreshold = 100;
for (const s of SUBSTANCES.filter(s => s.gen >= 3 && !s.isBase && s.shard === 0)) {
    if (ivCache[s.key] >= expectedShardThreshold) {
        anomalies.push({
            severity: '⚠ ',
            msg: `${s.name} (Gen${s.gen}, IV=${fmt(ivCache[s.key])}) has shardValue=0 — consider assigning a shard value`
        });
    }
}

// E. Extreme reactionTime outliers (Gen-relative)
const genMaxTimes = { 1: 10, 2: 60, 3: 240, 4: 1200 };
for (const r of REACTIONS) {
    if (r.time > genMaxTimes[r.gen]) {
        anomalies.push({
            severity: 'ℹ ',
            msg: `${r.key}: reactionTime ${r.time}s exceeds Gen${r.gen} expected ceiling (${genMaxTimes[r.gen]}s)`
        });
    }
}

// F. Gen 4 substances with all qty=1 reactants (specific scan)
for (const r of REACTIONS.filter(r => r.gen === 4)) {
    if (r.reactants.every(rr => rr.qty === 1)) {
        anomalies.push({
            severity: 'ℹ ',
            msg: `${r.key}: all Gen 4 reactant quantities are 1 — Q-B/C/D target`
        });
    }
}

if (!anomalies.length) {
    console.log('  No anomalies detected.');
} else {
    for (const a of anomalies) {
        console.log(`  ${a.severity} ${a.msg}`);
    }
}


// ── Section 8: Recommended Next Measurements ──────────────────────────────────
console.log('\n' + hr());
console.log('  8. RECOMMENDED NEXT MEASUREMENTS  (post Q-B/C/D — before Q-E)');
console.log(hr());
console.log('  1. Playtest a Gen 3 LiCell run with new quantities. Verify:');
console.log('     - LiCell chain time ≈ ' + fmtTime(chainTime('lithium_ion_cell')) + ' (serial minimum)');
console.log('     - CNT chain time ≈ ' + fmtTime(chainTime('carbon_nanotube')));
console.log('     - Doped silicon chain time ≈ ' + fmtTime(chainTime('doped_silicon')));
console.log('  2. Playtest Gen 4 entry (CeSC, MH) with new doped_silicon×2 in CeSC. Verify:');
console.log('     - CeSC chain time ≈ ' + fmtTime(chainTime('ceramic_superconductor')));
console.log('  3. Verify Gen 4 Tier 12 capstone chain times match plan targets:');
console.log('     - RPC chain time ≈ ' + fmtTime(chainTime('reactive_plasma_core')) + ' (plan target: 5662s)');
console.log('     - QSub chain time ≈ ' + fmtTime(chainTime('quantum_substrate')) + ' (plan target: 3596s)');
console.log('     - NFP chain time ≈ ' + fmtTime(chainTime('nuclear_fuel_pellet')) + ' (plan target: 2296s)');
console.log('  4. Shard formula recalibration (Q-F) still required — unlockTier² dominance not addressed.');
console.log('  5. Energy cost review (Q-E) still required — energy costs unchanged in this pass.');
console.log('');
console.log(hr('═'));
console.log('  END OF REPORT');
console.log(hr('═') + '\n');
