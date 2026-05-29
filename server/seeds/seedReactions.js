const mongoose = require('mongoose');
const Reaction = require('./../models/Reaction');
const Substance = require('../models/Substance');
require('dotenv').config({ path: __dirname + '/../.env' });

// Reactions reference substances by substanceKey for clarity.
// The seed script resolves substanceKey → ObjectId before inserting.

const reactions = [

    // ── Gen 1 Tier 0 — Element Pairing (discoveredByDefault) ─────────────────
    {
        reactionKey: 'gen1_hydrogen_gas',
        name: 'Hydrogen Gas Synthesis',
        generationTier: 1,
        unlockTier: 0,
        reactants: [{ key: 'hydrogen', quantity: 2 }],
        product:   { key: 'hydrogen_gas', quantity: 1 },
        energyCost: 1,
        reactionTime: 0,
        discoveredByDefault: true,
        isActive: true
    },
    {
        reactionKey: 'gen1_oxygen_gas',
        name: 'Oxygen Gas Synthesis',
        generationTier: 1,
        unlockTier: 0,
        reactants: [{ key: 'oxygen', quantity: 2 }],
        product:   { key: 'oxygen_gas', quantity: 1 },
        energyCost: 1,
        reactionTime: 0,
        discoveredByDefault: true,
        isActive: true
    },
    {
        reactionKey: 'gen1_nitrogen_gas',
        name: 'Nitrogen Gas Synthesis',
        generationTier: 1,
        unlockTier: 0,
        reactants: [{ key: 'nitrogen', quantity: 2 }],
        product:   { key: 'nitrogen_gas', quantity: 1 },
        energyCost: 1,
        reactionTime: 0,
        discoveredByDefault: true,
        isActive: true
    },

    // ── Gen 1 Tier 1 — Basic Synthesis ───────────────────────────────────────
    {
        reactionKey: 'gen1_water',
        name: 'Water Synthesis',
        generationTier: 1,
        unlockTier: 0,
        reactants: [
            { key: 'hydrogen_gas', quantity: 1 },
            { key: 'oxygen', quantity: 1 }
        ],
        product: { key: 'water', quantity: 1 },
        energyCost: 5,
        reactionTime: 0,
        discoveredByDefault: false,
        hintText: 'A gas and a raw element can form a stable compound.',
        description: 'Two gases combine into the first stable liquid.',
        isActive: true
    },
    {
        reactionKey: 'gen1_salt',
        name: 'Salt Crystallization',
        generationTier: 1,
        unlockTier: 1,
        reactants: [
            { key: 'sodium', quantity: 1 },
            { key: 'chlorine', quantity: 1 }
        ],
        product: { key: 'salt', quantity: 1 },
        energyCost: 4,
        reactionTime: 0,
        discoveredByDefault: true,
        description: 'An alkali metal and a halogen bond into the most ancient mineral.',
        isActive: true
    },
    {
        reactionKey: 'gen1_iron_oxide',
        name: 'Iron Oxidation',
        generationTier: 1,
        unlockTier: 2,
        reactants: [
            { key: 'iron', quantity: 2 },
            { key: 'oxygen_gas', quantity: 1 }
        ],
        product: { key: 'iron_oxide', quantity: 1 },
        energyCost: 5,
        reactionTime: 3,
        discoveredByDefault: false,
        hintText: 'Some elements react when combined with a gas.',
        description: 'Iron meets oxygen and rusts into ore.',
        isActive: true
    },
    {
        reactionKey: 'gen1_carbon_dioxide',
        name: 'Carbon Dioxide Synthesis',
        generationTier: 1,
        unlockTier: 1,
        reactants: [
            { key: 'carbon', quantity: 1 },
            { key: 'oxygen_gas', quantity: 1 }
        ],
        product: { key: 'carbon_dioxide', quantity: 1 },
        energyCost: 6,
        reactionTime: 2,
        discoveredByDefault: false,
        hintText: 'Raw elements bond with gases in different ways.',
        isActive: true
    },
    {
        reactionKey: 'gen1_methane',
        name: 'Methane Synthesis',
        generationTier: 1,
        unlockTier: 1,
        reactants: [
            { key: 'carbon', quantity: 1 },
            { key: 'hydrogen_gas', quantity: 1 }
        ],
        product: { key: 'methane', quantity: 1 },
        energyCost: 8,
        reactionTime: 2,
        discoveredByDefault: false,
        hintText: 'Some raw elements produce different results with different gases.',
        isActive: true
    },
    {
        reactionKey: 'gen1_ammonia',
        name: 'Ammonia Synthesis',
        generationTier: 1,
        unlockTier: 2,
        reactants: [
            { key: 'nitrogen_gas', quantity: 1 },
            { key: 'hydrogen_gas', quantity: 1 }
        ],
        product: { key: 'ammonia', quantity: 1 },
        energyCost: 8,
        reactionTime: 3,
        discoveredByDefault: false,
        hintText: 'Two different gases can sometimes combine into something new.',
        description: 'Nitrogen and hydrogen forced together under pressure.',
        isActive: true
    },

    // ── Gen 2 Tier 2 — The Foundry ────────────────────────────────────────────
    {
        reactionKey: 'gen2_copper',
        name: 'Copper Smelting',
        generationTier: 2,
        unlockTier: 3,
        reactants: [
            { key: 'iron_oxide', quantity: 1 },
            { key: 'sulfur', quantity: 1 }
        ],
        product: { key: 'copper', quantity: 1 },
        energyCost: 14,
        reactionTime: 8,
        discoveredByDefault: false,
        hintText: 'An ore compound can be broken down into a metal with the right element.',
        description: 'Sulfur-rich ore reduction yields the first workable metal.',
        isActive: true
    },
    {
        reactionKey: 'gen2_tin',
        name: 'Tin Reduction',
        generationTier: 2,
        unlockTier: 3,
        reactants: [
            { key: 'iron_oxide', quantity: 1 },
            { key: 'carbon', quantity: 1 }
        ],
        product: { key: 'tin', quantity: 1 },
        energyCost: 14,
        reactionTime: 8,
        discoveredByDefault: false,
        hintText: 'Ore compounds can be reduced in more than one way.',
        description: 'Carbon reduces oxide ore into soft, pliable tin.',
        isActive: true
    },
    {
        reactionKey: 'gen2_nickel',
        name: 'Nickel Extraction',
        generationTier: 2,
        unlockTier: 5,
        reactants: [
            { key: 'iron_oxide', quantity: 1 },
            { key: 'ammonia', quantity: 1 }
        ],
        product: { key: 'nickel', quantity: 1 },
        energyCost: 16,
        reactionTime: 20,
        discoveredByDefault: false,
        hintText: 'A gas can sometimes extract new metals from an ore compound.',
        description: 'Ammonia leaching pulls nickel from mixed-metal ore.',
        isActive: true
    },
    {
        reactionKey: 'gen2_gold',
        name: 'Gold Precipitation',
        generationTier: 2,
        unlockTier: 6,
        reactants: [
            { key: 'iron', quantity: 1 },
            { key: 'water', quantity: 1 }
        ],
        product: { key: 'gold', quantity: 1 },
        energyCost: 22,
        reactionTime: 25,
        discoveredByDefault: false,
        hintText: 'Unexpected combinations of basic substances can yield rare results.',
        description: 'High-energy precipitation isolates the most unreactive metal.',
        isActive: true
    },
    {
        reactionKey: 'gen2_bronze',
        name: 'Bronze Alloying',
        generationTier: 2,
        unlockTier: 4,
        reactants: [
            { key: 'copper', quantity: 2 },
            { key: 'tin', quantity: 1 }
        ],
        product: { key: 'bronze', quantity: 1 },
        energyCost: 18,
        reactionTime: 12,
        discoveredByDefault: false,
        hintText: 'Some refined metals work better when combined.',
        description: 'Two metals fused in the forge. The first engineered material.',
        isActive: true
    },

    // ── Gen 2 Tier 2 — Chemical Works ─────────────────────────────────────────
    {
        reactionKey: 'gen2_sulfuric_acid',
        name: 'Sulfuric Acid Synthesis',
        generationTier: 2,
        unlockTier: 3,
        reactants: [
            { key: 'sulfur', quantity: 1 },
            { key: 'water', quantity: 1 },
            { key: 'oxygen_gas', quantity: 1 }
        ],
        product: { key: 'sulfuric_acid', quantity: 1 },
        energyCost: 20,
        reactionTime: 15,
        discoveredByDefault: false,
        hintText: 'Some reactions require a gas, a liquid, and a raw element together.',
        description: 'Sulfur trioxide dissolved in water. The king of industrial chemicals.',
        isActive: true
    },
    {
        reactionKey: 'gen2_nitric_acid',
        name: 'Nitric Acid Synthesis',
        generationTier: 2,
        unlockTier: 4,
        reactants: [
            { key: 'ammonia', quantity: 1 },
            { key: 'oxygen_gas', quantity: 1 }
        ],
        product: { key: 'nitric_acid', quantity: 1 },
        energyCost: 18,
        reactionTime: 15,
        discoveredByDefault: false,
        hintText: 'Two gases combined can produce reactive results.',
        description: 'Catalytic oxidation of ammonia — the Ostwald process abstracted.',
        isActive: true
    },
    {
        reactionKey: 'gen2_calcium',
        name: 'Calcium Extraction',
        generationTier: 2,
        unlockTier: 4,
        reactants: [
            { key: 'salt', quantity: 1 },
            { key: 'water', quantity: 1 }
        ],
        product: { key: 'calcium', quantity: 1 },
        energyCost: 14,
        reactionTime: 10,
        discoveredByDefault: false,
        hintText: 'A liquid can break down a mineral compound into something new.',
        description: 'Electrolytic reduction of brine yields reactive alkaline earth metal.',
        isActive: true
    },
    {
        reactionKey: 'gen2_quicklime',
        name: 'Quicklime Synthesis',
        generationTier: 2,
        unlockTier: 5,
        reactants: [
            { key: 'calcium', quantity: 1 },
            { key: 'oxygen_gas', quantity: 1 }
        ],
        product: { key: 'quicklime', quantity: 1 },
        energyCost: 12,
        reactionTime: 10,
        discoveredByDefault: false,
        hintText: 'Some metals are transformed by combining them with a gas.',
        description: 'Calcium burned in oxygen. The precursor to concrete and glass.',
        isActive: true
    },

    // ── Gen 2 Tier 2 — Materials Bench ────────────────────────────────────────
    {
        reactionKey: 'gen2_silicon',
        name: 'Silicon Reduction',
        generationTier: 2,
        unlockTier: 5,
        reactants: [
            { key: 'carbon', quantity: 2 },
            { key: 'iron_oxide', quantity: 1 }
        ],
        product: { key: 'silicon', quantity: 1 },
        energyCost: 20,
        reactionTime: 20,
        discoveredByDefault: false,
        hintText: 'The same materials can sometimes produce different results in different amounts.',
        description: 'Carbothermic reduction pulls silicon from silicate-rich ore.',
        isActive: true
    },
    {
        reactionKey: 'gen2_quartz',
        name: 'Quartz Formation',
        generationTier: 2,
        unlockTier: 6,
        reactants: [
            { key: 'silicon', quantity: 1 },
            { key: 'oxygen_gas', quantity: 1 }
        ],
        product: { key: 'quartz', quantity: 1 },
        energyCost: 15,
        reactionTime: 15,
        discoveredByDefault: false,
        hintText: 'Some materials take on new forms when combined with a basic gas.',
        description: 'Silicon dioxide crystallizes into the most abundant mineral.',
        isActive: true
    },
    {
        reactionKey: 'gen2_soda_ash',
        name: 'Soda Ash Synthesis',
        generationTier: 2,
        unlockTier: 2,
        reactants: [
            { key: 'sodium', quantity: 2 },
            { key: 'carbon_dioxide', quantity: 1 }
        ],
        product: { key: 'soda_ash', quantity: 1 },
        energyCost: 14,
        reactionTime: 8,
        discoveredByDefault: false,
        hintText: 'Some base elements combine with gases to form useful minerals.',
        description: 'Sodium carbonate — the flux that lowers glass melting point.',
        isActive: true
    },
    {
        reactionKey: 'gen2_lithium',
        name: 'Lithium Isolation',
        generationTier: 2,
        unlockTier: 7,
        reactants: [
            { key: 'salt', quantity: 1 },
            { key: 'hydrogen_gas', quantity: 1 }
        ],
        product: { key: 'lithium', quantity: 1 },
        energyCost: 18,
        reactionTime: 30,
        discoveredByDefault: false,
        hintText: 'Some common minerals contain hidden metals waiting to be extracted.',
        description: 'Electrolytic reduction of molten lithium salt yields the lightest metal.',
        isActive: true
    },

    // ── Gen 3 Tier 3 — The Materials Lab ──────────────────────────────────────
    {
        reactionKey: 'gen3_glass',
        name: 'Glass Fusion',
        generationTier: 3,
        unlockTier: 7,
        reactants: [
            { key: 'quartz', quantity: 2 },
            { key: 'soda_ash', quantity: 1 },
            { key: 'quicklime', quantity: 1 }
        ],
        product: { key: 'glass', quantity: 1 },
        energyCost: 30,
        reactionTime: 60,
        discoveredByDefault: false,
        hintText: 'Multiple mineral compounds fused together can produce something transparent.',
        description: 'Three minerals fused at extreme heat into transparent amorphous solid.',
        isActive: true
    },
    {
        reactionKey: 'gen3_steel',
        name: 'Steel Smelting',
        generationTier: 3,
        unlockTier: 6,
        reactants: [
            { key: 'iron', quantity: 3 },
            { key: 'carbon', quantity: 1 }
        ],
        product: { key: 'steel', quantity: 1 },
        energyCost: 35,
        reactionTime: 45,
        discoveredByDefault: false,
        hintText: 'Basic elements sometimes yield stronger materials than expected.',
        description: 'Iron alloyed with controlled carbon becomes harder, stronger, better.',
        isActive: true
    },
    {
        reactionKey: 'gen3_chrome',
        name: 'Chrome Refining',
        generationTier: 3,
        unlockTier: 7,
        reactants: [
            { key: 'iron_oxide', quantity: 2 },
            { key: 'sulfuric_acid', quantity: 1 }
        ],
        product: { key: 'chrome', quantity: 1 },
        energyCost: 32,
        reactionTime: 45,
        discoveredByDefault: false,
        hintText: 'A reactive substance can extract rare metals from ore.',
        description: 'Acid leaching and reduction isolates chromium from ore.',
        isActive: true
    },
    {
        reactionKey: 'gen3_stainless_steel',
        name: 'Stainless Steel Alloying',
        generationTier: 3,
        unlockTier: 8,
        reactants: [
            { key: 'steel', quantity: 2 },
            { key: 'chrome', quantity: 1 },
            { key: 'nickel', quantity: 1 }
        ],
        product: { key: 'stainless_steel', quantity: 1 },
        energyCost: 40,
        reactionTime: 90,
        discoveredByDefault: false,
        hintText: 'A structural material can be made more resistant by adding other metals.',
        description: 'Chrome and nickel woven into steel. The result does not rust.',
        isActive: true
    },
    {
        reactionKey: 'gen3_graphene',
        name: 'Graphene Deposition',
        generationTier: 3,
        unlockTier: 8,
        reactants: [
            { key: 'carbon', quantity: 3 },
            { key: 'methane', quantity: 1 }
        ],
        product: { key: 'graphene', quantity: 1 },
        energyCost: 50,
        reactionTime: 90,
        discoveredByDefault: false,
        hintText: 'Try pushing carbon further with the help of a gas you have already discovered.',
        description: 'Chemical vapor deposition lays down a single atom-thick carbon lattice.',
        isActive: true
    },
    {
        reactionKey: 'gen3_carbon_nanotube',
        name: 'Carbon Nanotube Growth',
        generationTier: 3,
        unlockTier: 9,
        reactants: [
            { key: 'graphene', quantity: 2 },
            { key: 'carbon', quantity: 1 }
        ],
        product: { key: 'carbon_nanotube', quantity: 1 },
        energyCost: 60,
        reactionTime: 120,
        discoveredByDefault: false,
        hintText: 'A carbon material can sometimes be refined further using its base element.',
        description: 'Graphene sheets rolled and sealed into hollow cylinders at the nanoscale.',
        isActive: true
    },
    {
        reactionKey: 'gen3_aramid_fiber',
        name: 'Aramid Fiber Synthesis',
        generationTier: 3,
        unlockTier: 8,
        reactants: [
            { key: 'ammonia', quantity: 2 },
            { key: 'carbon', quantity: 2 },
            { key: 'nitrogen', quantity: 1 }
        ],
        product: { key: 'aramid_fiber', quantity: 1 },
        energyCost: 45,
        reactionTime: 90,
        discoveredByDefault: false,
        hintText: 'Gases and raw elements in the right combination can produce something surprisingly tough.',
        description: 'Aromatic polyamide chains spun into high-tensile fiber.',
        isActive: true
    },
    {
        reactionKey: 'gen3_doped_silicon',
        name: 'Silicon Doping',
        generationTier: 3,
        unlockTier: 9,
        reactants: [
            { key: 'silicon', quantity: 2 },
            { key: 'gold', quantity: 1 }
        ],
        product: { key: 'doped_silicon', quantity: 1 },
        energyCost: 42,
        reactionTime: 90,
        discoveredByDefault: false,
        hintText: 'Some materials become more useful when combined with a rare metal.',
        description: 'Gold atoms threaded into a silicon lattice at reactor temperature. Rewires conductivity beyond standard doping.',
        isActive: true
    },
    {
        reactionKey: 'gen3_lithium_ion_cell',
        name: 'Lithium Ion Cell Assembly',
        generationTier: 3,
        unlockTier: 9,
        reactants: [
            { key: 'lithium', quantity: 2 },
            { key: 'graphene', quantity: 1 },
            { key: 'doped_silicon', quantity: 1 }
        ],
        product: { key: 'lithium_ion_cell', quantity: 1 },
        energyCost: 70,
        reactionTime: 180,
        discoveredByDefault: false,
        hintText: 'Your most advanced materials may converge into something entirely new.',
        description: 'Lithium ions shuttling between graphene and silicon electrodes. Portable power, realized.',
        isActive: true
    }
];

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Build substanceKey → ObjectId map — substances must be seeded first
        const allSubstances = await Substance.find();
        const keyMap = {};
        allSubstances.forEach(s => { keyMap[s.substanceKey] = s._id; });

        const missing = [];
        const formatted = reactions.map(r => {
            const reactants = r.reactants.map(item => {
                const id = keyMap[item.key];
                if (!id) missing.push(`reactant substanceKey not found: '${item.key}'`);
                return { substance: id, quantity: item.quantity };
            });
            const productId = keyMap[r.product.key];
            if (!productId) missing.push(`product substanceKey not found: '${r.product.key}'`);

            return {
                reactionKey:         r.reactionKey,
                name:                r.name,
                generationTier:      r.generationTier,
                unlockTier:          r.unlockTier,
                reactants,
                product:             { substance: productId, quantity: r.product.quantity },
                energyCost:          r.energyCost,
                reactionTime:        r.reactionTime,
                conditions:          r.conditions || [],
                discoveredByDefault: r.discoveredByDefault,
                description:         r.description || undefined,
                hintText:            r.hintText || undefined,
                isActive:            r.isActive
            };
        });

        if (missing.length > 0) {
            console.error('Seed aborted — missing substance keys (run seedSubstances first):');
            missing.forEach(m => console.error(' ', m));
            process.exit(1);
        }

        let inserted = 0, updated = 0;
        for (const r of formatted) {
            const result = await Reaction.updateOne(
                { reactionKey: r.reactionKey },
                { $set: r },
                { upsert: true }
            );
            if (result.upsertedCount) inserted++;
            else if (result.modifiedCount) updated++;
        }

        // Stale-content report — does NOT delete anything
        const seededKeys = formatted.map(r => r.reactionKey);
        const stale = await Reaction.find({ reactionKey: { $nin: seededKeys } }, 'reactionKey _id');
        if (stale.length > 0) {
            console.warn(`Stale reactions not in seed (${stale.length}) — not deleted:`);
            stale.forEach(r => console.warn(`  reactionKey: '${r.reactionKey}'  _id: ${r._id}`));
        }

        console.log(`Reactions: ${inserted} inserted, ${updated} updated, ${formatted.length - inserted - updated} unchanged.`);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        mongoose.disconnect();
    }
})();
