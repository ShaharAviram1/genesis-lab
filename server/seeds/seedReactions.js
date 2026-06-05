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
            { key: 'iron_oxide', quantity: 2 },
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
            { key: 'iron_oxide', quantity: 2 },
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
            { key: 'ammonia', quantity: 2 }
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
            { key: 'water', quantity: 2 }
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
            { key: 'salt', quantity: 2 },
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
            { key: 'chrome', quantity: 2 },
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
            { key: 'methane', quantity: 2 }
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
            { key: 'graphene', quantity: 3 },
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
            { key: 'gold', quantity: 2 }
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
            { key: 'graphene', quantity: 2 },
            { key: 'doped_silicon', quantity: 1 }
        ],
        product: { key: 'lithium_ion_cell', quantity: 1 },
        energyCost: 70,
        reactionTime: 180,
        discoveredByDefault: false,
        hintText: 'Your most advanced materials may converge into something entirely new.',
        description: 'Lithium ions shuttling between graphene and silicon electrodes. Portable power, realized.',
        isActive: true
    },

    // ── Gen 4 Tier 9 — The Edge of Physics (Gen 4 entry wave) ────────────────
    {
        reactionKey: 'gen4_hydrogen_plasma',
        name: 'Hydrogen Plasma Ionization',
        generationTier: 4,
        unlockTier: 9,
        reactants: [
            { key: 'hydrogen', quantity: 1 }
        ],
        product: { key: 'hydrogen_plasma', quantity: 1 },
        energyCost: 100,
        reactionTime: 180,
        conditions: ['plasma_state', 'extreme_temperature'],
        discoveredByDefault: false,
        hintText: 'A plasma-state reactor can do to elements what stars do naturally.',
        description: 'Hydrogen stripped to bare protons under plasma-state conditions. The electron releases as energy. What remains is the fundamental state of stellar matter — the same phase of hydrogen that powers every star in the observable universe.',
        isActive: true
    },
    {
        reactionKey: 'gen4_ballistic_composite',
        name: 'Ballistic Composite Sintering',
        generationTier: 4,
        unlockTier: 9,
        reactants: [
            { key: 'aramid_fiber', quantity: 1 },
            { key: 'carbon_nanotube', quantity: 2 }
        ],
        product: { key: 'ballistic_composite', quantity: 1 },
        energyCost: 120,
        reactionTime: 270,
        conditions: ['extreme_temperature', 'high_pressure'],
        discoveredByDefault: false,
        hintText: 'Your strongest structural materials may combine into something greater than either alone.',
        description: 'Aramid fiber and carbon nanotube hot-pressed under extreme temperature and high pressure into a unified composite matrix. The nanotube lattice embeds within the aramid polymer structure. The result: a material with a protection-to-weight ratio no single substance achieves alone — and the structural vessel the plasma track will eventually require.',
        isActive: true
    },

    // ── Gen 4 Tier 10 ─────────────────────────────────────────────────────────
    {
        reactionKey: 'gen4_ceramic_superconductor',
        name: 'Ceramic Superconductor Formation',
        generationTier: 4,
        unlockTier: 10,
        reactants: [
            { key: 'glass', quantity: 1 },
            { key: 'doped_silicon', quantity: 2 }
        ],
        product: { key: 'ceramic_superconductor', quantity: 1 },
        energyCost: 200,
        reactionTime: 360,
        conditions: ['extreme_cold'],
        discoveredByDefault: false,
        hintText: 'The material that opened Gen 3 may carry a different property at extreme cold.',
        description: 'Glass and doped silicon cooled to cryogenic conditions until their electrical resistance collapses to zero. A high-temperature superconductor — high-temperature in the scientific sense: it superconducts at 93 Kelvin, far warmer than classical superconductors, but still requiring the extreme cold the reactor now commands. While the plasma track burns, the cold track crystallizes.',
        isActive: true
    },
    {
        reactionKey: 'gen4_metallic_hydrogen',
        name: 'Metallic Hydrogen Compression',
        generationTier: 4,
        unlockTier: 10,
        reactants: [
            { key: 'hydrogen_plasma', quantity: 1 }
        ],
        product: { key: 'metallic_hydrogen', quantity: 1 },
        energyCost: 300,
        reactionTime: 720,
        conditions: ['extreme_pressure'],
        discoveredByDefault: false,
        hintText: 'Plasma under sufficient pressure becomes something else entirely.',
        description: 'Hydrogen plasma subjected to pressures equivalent to the interior of a gas giant. Under these conditions, electrons are no longer bound to individual protons — they move freely through a solid hydrogen lattice. Metallic hydrogen is theoretically the most energetic rocket propellant ever synthesized. The reactor holds it stable. For now.',
        isActive: true
    },

    // ── Gen 4 Tier 11 ─────────────────────────────────────────────────────────
    {
        reactionKey: 'gen4_cryogenic_matrix',
        name: 'Cryogenic Matrix Assembly',
        generationTier: 4,
        unlockTier: 11,
        reactants: [
            { key: 'ceramic_superconductor', quantity: 1 },
            { key: 'carbon_nanotube', quantity: 2 }
        ],
        product: { key: 'cryogenic_matrix', quantity: 1 },
        energyCost: 250,
        reactionTime: 540,
        conditions: ['extreme_cold', 'vacuum'],
        discoveredByDefault: false,
        hintText: 'A superconductor needs structure to function as a containment field.',
        description: 'Ceramic superconductor reinforced by carbon nanotube in near-vacuum conditions. The nanotube provides the structural lattice; the superconductor provides the magnetic field. Together they form a containment scaffold capable of channeling plasma streams without direct contact. It operates correctly only near absolute zero.',
        isActive: true
    },
    {
        reactionKey: 'gen4_nuclear_fuel_pellet',
        name: 'Nuclear Fuel Pellet Fabrication',
        generationTier: 4,
        unlockTier: 11,
        reactants: [
            { key: 'metallic_hydrogen', quantity: 1 },
            { key: 'stainless_steel', quantity: 2 }
        ],
        product: { key: 'nuclear_fuel_pellet', quantity: 1 },
        energyCost: 350,
        reactionTime: 720,
        conditions: ['extreme_pressure', 'radiation_bombardment'],
        discoveredByDefault: false,
        hintText: 'Metallic hydrogen needs a casing that can survive what it contains.',
        description: 'Metallic hydrogen compressed into a stainless steel lattice under radiation bombardment. The pellet is dense, stable by the standards of what it contains, and carries energy density beyond any conventional fuel. Producing the nuclear fuel pellet is the event that opens the final tier of Gen 4 — and begins the approach to Gen 5.',
        isActive: true
    },

    // ── Gen 4 Tier 12 — Capstones ─────────────────────────────────────────────
    {
        reactionKey: 'gen4_reactive_plasma_core',
        name: 'Reactive Plasma Core Assembly',
        generationTier: 4,
        unlockTier: 12,
        reactants: [
            { key: 'hydrogen_plasma', quantity: 1 },
            { key: 'cryogenic_matrix', quantity: 1 },
            { key: 'ballistic_composite', quantity: 2 }
        ],
        product: { key: 'reactive_plasma_core', quantity: 1 },
        energyCost: 500,
        reactionTime: 900,
        conditions: ['plasma_state'],
        discoveredByDefault: false,
        hintText: 'Three separate tracks converge into something none of them could be alone.',
        description: 'Three parallel tracks converge: the plasma track (hydrogen plasma), the cold track (cryogenic matrix), and the structural track (ballistic composite). The resulting assembly is an embryonic fusion reactor — not manufactured by the reactor but built by it. The plasma is contained. The containment is structured. The structure survives the plasma. The reactor built a reactor inside itself.',
        isActive: true
    },
    {
        reactionKey: 'gen4_quantum_substrate',
        name: 'Quantum Substrate Lattice Formation',
        generationTier: 4,
        unlockTier: 12,
        reactants: [
            { key: 'metallic_hydrogen', quantity: 1 },
            { key: 'ceramic_superconductor', quantity: 2 }
        ],
        product: { key: 'quantum_substrate', quantity: 1 },
        energyCost: 450,
        reactionTime: 900,
        conditions: ['extreme_pressure', 'extreme_cold'],
        discoveredByDefault: false,
        hintText: 'Two extreme-state materials subjected simultaneously to their opposing conditions.',
        description: 'Metallic hydrogen and ceramic superconductor merged under simultaneous extreme pressure and extreme cold. The resulting lattice operates at the boundary between classical and quantum material behavior: electrons in the superconducting state, protons in the metallic lattice, the whole structure held in a phase with no stable analog at normal conditions. The quantum substrate is where Gen 5 physics begins to be legible.',
        isActive: true
    },

    // ── Gen 5 Track A — T13 ───────────────────────────────────────────────────
    {
        reactionKey: 'gen5_topological_insulator',
        name: 'Topological Insulator Formation',
        generationTier: 5,
        unlockTier: 13,
        reactants: [
            { key: 'quantum_substrate', quantity: 1 },
            { key: 'metallic_hydrogen', quantity: 1 }
        ],
        product: { key: 'topological_insulator', quantity: 1 },
        energyCost: 600,
        reactionTime: 28800,
        conditions: ['extreme_pressure', 'extreme_cold'],
        discoveredByDefault: false,
        hintText: 'Two quantum materials pressed into simultaneous contradiction — insulating everywhere except its own skin.',
        description: 'Quantum substrate and metallic hydrogen forced into mutual phase tension under extreme pressure and cold. The result is not a compound but a topological phase: bulk electrons freeze while surface electrons remain free. Conducting on every exterior face, insulating through every interior path. The topological insulator is the first Gen 5 substance and the first material whose behavior is defined by its geometry rather than its chemistry. Producing it unlocks quantum coherence.',
        isActive: true
    },

    // ── Gen 5 Track B — T13 ───────────────────────────────────────────────────
    {
        reactionKey: 'gen5_photonic_crystal',
        name: 'Photonic Crystal Growth',
        generationTier: 5,
        unlockTier: 13,
        reactants: [
            { key: 'reactive_plasma_core', quantity: 1 },
            { key: 'carbon', quantity: 3 }
        ],
        product: { key: 'photonic_crystal', quantity: 1 },
        energyCost: 650,
        reactionTime: 28800,
        conditions: ['plasma_state', 'vacuum'],
        discoveredByDefault: false,
        hintText: 'Carbon ordered by plasma into a lattice that controls light the way silicon controls current.',
        description: 'A reactive plasma core used as a deposition field drives three units of carbon into a periodic lattice at light-wavelength spacing — under vacuum, so no contamination interrupts the pattern. The resulting photonic crystal does not absorb or emit light: it controls which photon frequencies can propagate through it. A semiconductor for photons. Photonic crystal is consumed in two separate Gen 5 reactions, so the infrastructure that produces it will be worked hard.',
        isActive: true
    },

    // ── Gen 5 Track A — T14 ───────────────────────────────────────────────────
    {
        reactionKey: 'gen5_superfluid_condensate',
        name: 'Superfluid Condensate Formation',
        generationTier: 5,
        unlockTier: 14,
        reactants: [
            { key: 'topological_insulator', quantity: 1 },
            { key: 'cryogenic_matrix', quantity: 2 }
        ],
        product: { key: 'superfluid_condensate', quantity: 1 },
        energyCost: 900,
        reactionTime: 43200,
        conditions: ['extreme_cold', 'quantum_coherence'],
        discoveredByDefault: false,
        hintText: 'Topological surface states cooled past the point where individual atoms give up their identities.',
        description: 'A topological insulator held inside a double cryogenic matrix under sustained quantum coherence. At the required temperature, the surface conduction states collapse into a single macroscopic quantum state — a superfluid. The condensate has no viscosity. It flows without losing energy. Every atom in the substance obeys the same quantum equation. The superfluid condensate is consumed twice in Gen 5 and grants the zero-point field condition.',
        isActive: true
    },

    // ── Gen 5 Track B — T14 ───────────────────────────────────────────────────
    {
        reactionKey: 'gen5_chromodynamic_fiber',
        name: 'Chromodynamic Fiber Weaving',
        generationTier: 5,
        unlockTier: 14,
        reactants: [
            { key: 'photonic_crystal', quantity: 1 },
            { key: 'nuclear_fuel_pellet', quantity: 2 },
            { key: 'sulfur', quantity: 4 }
        ],
        product: { key: 'chromodynamic_fiber', quantity: 1 },
        energyCost: 950,
        reactionTime: 43200,
        conditions: ['plasma_state', 'extreme_pressure'],
        discoveredByDefault: false,
        hintText: 'Nuclear fuel forced into quark-density compression. What comes out is not a molecule — it is a thread of strong force.',
        description: 'Two nuclear fuel pellets driven to quark-gluon densities by extreme pressure, with sulfur acting as a binding medium and the photonic crystal providing a resonance scaffold. At sufficient compression, the proton-neutron structure dissolves. What threads out is a chromodynamic fiber: a filament where the strong nuclear force is the structural element, not merely a consequence of atomic proximity. Producing chromodynamic fiber unlocks nucleon compression and gates T15 synthesis.',
        isActive: true
    },

    // ── Gen 5 Track A — T15 ───────────────────────────────────────────────────
    {
        reactionKey: 'gen5_bose_nova_remnant',
        name: 'Bose-Nova Remnant Crystallization',
        generationTier: 5,
        unlockTier: 15,
        reactants: [
            { key: 'superfluid_condensate', quantity: 1 },
            { key: 'photonic_crystal', quantity: 1 },
            { key: 'quantum_substrate', quantity: 1 }
        ],
        product: { key: 'bose_nova_remnant', quantity: 1 },
        energyCost: 1100,
        reactionTime: 86400,
        conditions: ['extreme_cold', 'zero_point_field'],
        discoveredByDefault: false,
        hintText: 'A superfluid driven past its stability limit. The collapse is the product.',
        description: 'A superfluid condensate destabilized by a photonic crystal resonance field and a quantum substrate lattice under zero-point field conditions. The condensate collapses inward in a Bose-nova — not a destruction but a phase transition through instability. What crystallizes from the collapse is the remnant: a material with the coherence of the superfluid compressed into the density of the substrate. The Bose-nova remnant gates T16 synthesis.',
        isActive: true
    },

    // ── Gen 5 Track B — T15 ───────────────────────────────────────────────────
    {
        reactionKey: 'gen5_magnetar_filament',
        name: 'Magnetar Filament Braiding',
        generationTier: 5,
        unlockTier: 15,
        reactants: [
            { key: 'chromodynamic_fiber', quantity: 1 },
            { key: 'nuclear_fuel_pellet', quantity: 1 },
            { key: 'iron', quantity: 8 }
        ],
        product: { key: 'magnetar_filament', quantity: 1 },
        energyCost: 1200,
        reactionTime: 86400,
        conditions: ['extreme_pressure', 'nucleon_compression'],
        discoveredByDefault: false,
        hintText: 'Iron compressed past neutron density around a chromodynamic core. The result is a thread of magnetar-grade field.',
        description: 'Eight units of iron driven to neutron-star densities around a chromodynamic fiber core under nucleon compression and extreme pressure — with one nuclear fuel pellet providing the ignition energy required to sustain the compression. The iron does not melt: it is compressed past nuclear density, and in that state, the magnetic moment of every nucleon aligns. The resulting filament carries a field density that would be lethal at macro scales. Contained inside the reactor, it is a structural element.',
        isActive: true
    },

    // ── Gen 5 Track A — T16 (Convergence A) ──────────────────────────────────
    {
        reactionKey: 'gen5_quantum_vacuum_lattice',
        name: 'Quantum Vacuum Lattice Stabilization',
        generationTier: 5,
        unlockTier: 16,
        reactants: [
            { key: 'bose_nova_remnant', quantity: 1 },
            { key: 'superfluid_condensate', quantity: 1 },
            { key: 'quantum_substrate', quantity: 1 }
        ],
        product: { key: 'quantum_vacuum_lattice', quantity: 1 },
        energyCost: 1500,
        reactionTime: 172800,
        conditions: ['quantum_coherence', 'zero_point_field'],
        discoveredByDefault: false,
        hintText: 'Three quantum materials forced into coherence with the vacuum itself.',
        description: 'A Bose-nova remnant, a superfluid condensate, and a quantum substrate converged under simultaneous quantum coherence and zero-point field conditions. The vacuum between the three materials is not empty — it fluctuates at zero-point energy. Under these conditions, those fluctuations become the bonding medium. The resulting lattice is not held together by chemical bonds or electromagnetic force — it is held together by the geometry of spacetime at small scales. The quantum vacuum lattice is the capstone of Track A and gates the final synthesis.',
        isActive: true
    },

    // ── Gen 5 Track B — T16 (Convergence B) ──────────────────────────────────
    {
        reactionKey: 'gen5_strangeon_matter',
        name: 'Strangeon Matter Compression',
        generationTier: 5,
        unlockTier: 16,
        reactants: [
            { key: 'magnetar_filament', quantity: 1 },
            { key: 'reactive_plasma_core', quantity: 1 },
            { key: 'nitrogen', quantity: 6 }
        ],
        product: { key: 'strangeon_matter', quantity: 1 },
        energyCost: 1400,
        reactionTime: 172800,
        conditions: ['plasma_state', 'nucleon_compression'],
        discoveredByDefault: false,
        hintText: 'A reactive plasma core collapsed into a magnetar filament until the quarks rearrange.',
        description: 'A magnetar filament used as a compression scaffold, a reactive plasma core providing the energy density required, and six units of nitrogen as a quark-flavour mediator — driven under nucleon compression and plasma conditions. At sufficient density, the distinction between protons and neutrons ceases to hold. Up, down, and strange quarks reach equilibrium. The result is strangeon matter: bulk strange quark matter compressed into a stable form. The capstone of Track B.',
        isActive: true
    },

    // ── Gen 5 — T17 Capstone ─────────────────────────────────────────────────
    {
        reactionKey: 'gen5_axionic_condensate',
        name: 'Axionic Condensate Emergence',
        generationTier: 5,
        unlockTier: 17,
        reactants: [
            { key: 'quantum_vacuum_lattice', quantity: 1 },
            { key: 'strangeon_matter', quantity: 1 },
            { key: 'reactive_plasma_core', quantity: 1 },
            { key: 'quantum_substrate', quantity: 1 }
        ],
        product: { key: 'axionic_condensate', quantity: 1 },
        energyCost: 2000,
        reactionTime: 172800,
        conditions: ['quantum_coherence', 'zero_point_field', 'nucleon_compression'],
        discoveredByDefault: false,
        hintText: 'All three Gen 5 conditions active simultaneously. Both convergence tracks unified. What emerges is not matter as understood — it is dark matter, crystallized.',
        description: 'The two convergence outputs of Gen 5 — quantum vacuum lattice from Track A and strangeon matter from Track B — combined with a reactive plasma core for ignition energy and a quantum substrate as a phase anchor. All three Gen 5 conditions active simultaneously. The quantum vacuum lattice provides the geometric scaffold. The strangeon matter provides the quark-density medium. The reactive plasma core drives the phase transition. What condenses is an axionic state — a macroscopic coherent crystal of axions, dark matter candidates made momentarily tangible. The reactor has synthesized a piece of what the universe is mostly made of. Gen 5 is complete.',
        isActive: true
    },

    // ── Gen 6 — Entropic Horizons ─────────────────────────────────────────────
    // Three seeds (unlockTier=18), three mids (unlockTier=19), three outputs,
    // one capstone. All three tracks must complete before the capstone can start.

    // ── Gen 6 Seeds — T18 ────────────────────────────────────────────────────
    {
        reactionKey: 'gen6_vacuum_crystallite',
        name: 'Vacuum Crystallite Formation',
        generationTier: 6,
        unlockTier: 18,
        reactants: [
            { key: 'quantum_vacuum_lattice', quantity: 1 },
            { key: 'quantum_substrate',      quantity: 2 },
            { key: 'sulfur',                 quantity: 8 }
        ],
        product: { key: 'vacuum_crystallite', quantity: 1 },
        energyCost: 2200,
        reactionTime: 172800,
        conditions: ['quantum_coherence', 'zero_point_field'],
        discoveredByDefault: false,
        hintText: 'The quantum vacuum lattice, pressed against its own substrate until the space between them takes on structure.',
        description: 'A quantum vacuum lattice and two quantum substrate units brought into precise resonance under quantum coherence and zero-point field conditions, with sulfur acting as a phase-binding medium. The zero-point fluctuations between the two lattices lock into a periodic pattern — a crystal whose unit cell is a geometry of vacuum fluctuation rather than atomic position. The vacuum crystallite is the entry point of Gen 6: a material defined not by what it contains but by the structure of the vacuum around it. Producing it unlocks T19 and gates all three mid-tier Gen 6 reactions.',
        isActive: true
    },
    {
        reactionKey: 'gen6_causal_diamond_fiber',
        name: 'Causal Diamond Fiber Threading',
        generationTier: 6,
        unlockTier: 18,
        reactants: [
            { key: 'strangeon_matter',   quantity: 1 },
            { key: 'quantum_substrate',  quantity: 1 },
            { key: 'carbon',             quantity: 8 }
        ],
        product: { key: 'causal_diamond_fiber', quantity: 1 },
        energyCost: 2300,
        reactionTime: 172800,
        conditions: ['quantum_coherence', 'nucleon_compression'],
        discoveredByDefault: false,
        hintText: 'Quark-density matter forced into a one-dimensional configuration aligned with local light-cone geometry.',
        description: 'Strangeon matter and quantum substrate converged under quantum coherence and nucleon compression, with carbon providing topological anchoring for the fiber geometry. At quark densities, the reaction forces matter into a one-dimensional configuration aligned with the causal structure of the local spacetime — the boundary between regions that can and cannot influence each other. The result is a filament whose mechanical properties are determined not by atomic bonding but by the causal geometry of spacetime itself. Required for both mid-tier Track B and Track C reactions.',
        isActive: true
    },
    {
        reactionKey: 'gen6_cosmic_string_fragment',
        name: 'Cosmic String Stabilization',
        generationTier: 6,
        unlockTier: 18,
        reactants: [
            { key: 'bose_nova_remnant',    quantity: 1 },
            { key: 'reactive_plasma_core', quantity: 1 },
            { key: 'iron',                 quantity: 12 }
        ],
        product: { key: 'cosmic_string_fragment', quantity: 1 },
        energyCost: 2400,
        reactionTime: 172800,
        conditions: ['zero_point_field', 'nucleon_compression'],
        discoveredByDefault: false,
        hintText: 'A topological defect seeded from Bose-nova geometry. The reactor holds a fragment of a structure that should be millions of lightyears long.',
        description: 'Bose-nova remnant provides the topological seed geometry; reactive plasma core supplies the energy density required to sustain the defect; twelve units of iron provide the nuclear density needed to anchor the string against quantum decoherence. Under zero-point field and nucleon compression, the topological defect geometry of the Bose-nova remnant is extended into a one-dimensional cosmic string configuration. At cosmological scales, such strings span astronomical distances. The reactor holds a fragment smaller than a wavelength of light — but the physics are identical. Required for Track C mid-tier synthesis.',
        isActive: true
    },

    // ── Gen 6 Mids — T19 ─────────────────────────────────────────────────────
    {
        reactionKey: 'gen6_holographic_substrate',
        name: 'Holographic Substrate Encoding',
        generationTier: 6,
        unlockTier: 19,
        reactants: [
            { key: 'vacuum_crystallite',  quantity: 1 },
            { key: 'axionic_condensate',  quantity: 1 },
            { key: 'quantum_substrate',   quantity: 2 }
        ],
        product: { key: 'holographic_substrate', quantity: 1 },
        energyCost: 2800,
        reactionTime: 259200,
        conditions: ['quantum_coherence', 'zero_point_field'],
        discoveredByDefault: false,
        hintText: 'Three-dimensional physics encoded on a two-dimensional boundary. The bulk is a derived consequence of the surface.',
        description: 'Vacuum crystallite brought into resonance with an axionic condensate and two quantum substrate units under quantum coherence and zero-point field conditions. The axionic condensate provides the dark-matter scalar field that enforces the holographic correspondence; the vacuum crystallite provides the boundary geometry; the quantum substrates anchor the bulk-to-boundary mapping. What forms is a matter state that encodes three-dimensional physical information on a two-dimensional surface in accordance with the holographic principle. The holographic substrate has no volume in the conventional sense: its bulk properties are entirely derived from its boundary. Producing it grants the holographic encoding condition. Gates T20.',
        isActive: true
    },
    {
        reactionKey: 'gen6_planck_lattice',
        name: 'Planck Lattice Crystallization',
        generationTier: 6,
        unlockTier: 19,
        reactants: [
            { key: 'vacuum_crystallite',   quantity: 1 },
            { key: 'causal_diamond_fiber', quantity: 1 },
            { key: 'metallic_hydrogen',    quantity: 3 },
            { key: 'quantum_substrate',    quantity: 1 }
        ],
        product: { key: 'planck_lattice', quantity: 1 },
        energyCost: 2900,
        reactionTime: 259200,
        conditions: ['zero_point_field', 'nucleon_compression'],
        discoveredByDefault: false,
        hintText: 'A crystal whose unit cell is the Planck length. The spacetime metric curves around the lattice rather than through it.',
        description: 'Vacuum crystallite and causal diamond fiber converged under zero-point field and nucleon compression, with metallic hydrogen providing mass-energy density and quantum substrate as a phase anchor. The causal diamond fiber provides the geometric frame; the vacuum crystallite provides the minimum-length spacing mechanism. At the resulting density, the lattice unit cell reaches Planck scale — the length below which space itself ceases to be continuous. The local spacetime metric curves around the lattice mass-energy. Proximity to planck lattice sustains this curvature stress in the local metric, granting the metric tension condition. Gates T21.',
        isActive: true
    },
    {
        reactionKey: 'gen6_brane_filament',
        name: 'Brane Filament Extrusion',
        generationTier: 6,
        unlockTier: 19,
        reactants: [
            { key: 'causal_diamond_fiber', quantity: 1 },
            { key: 'cosmic_string_fragment', quantity: 1 },
            { key: 'reactive_plasma_core', quantity: 1 },
            { key: 'nitrogen',             quantity: 10 }
        ],
        product: { key: 'brane_filament', quantity: 1 },
        energyCost: 3000,
        reactionTime: 259200,
        conditions: ['quantum_coherence', 'nucleon_compression'],
        discoveredByDefault: false,
        hintText: 'A compactified spatial dimension, partially unrolled. The filament is under tension that is not electromagnetic.',
        description: 'Causal diamond fiber and cosmic string fragment driven under quantum coherence and nucleon compression, with reactive plasma core providing dimensional decompactification energy and nitrogen as a field mediator. The cosmic string geometry provides the dimensional defect seed; the causal diamond fiber provides the directionality; the plasma energy partially unrolls a compactified extra dimension along the fiber axis. The resulting filament is under tension that is not electromagnetic but dimensional — the tension of a spatial dimension resisting extension. Within its vicinity, reactions can be shielded from external light-cone interactions: the brane filament grants the causal isolation condition.',
        isActive: true
    },

    // ── Gen 6 Outputs ─────────────────────────────────────────────────────────
    {
        reactionKey: 'gen6_entropic_foam',
        name: 'Entropic Foam Condensation',
        generationTier: 6,
        unlockTier: 20,
        reactants: [
            { key: 'holographic_substrate', quantity: 1 },
            { key: 'cryogenic_matrix',      quantity: 2 },
            { key: 'quantum_substrate',     quantity: 1 }
        ],
        product: { key: 'entropic_foam', quantity: 1 },
        energyCost: 3500,
        reactionTime: 345600,
        conditions: ['quantum_coherence', 'zero_point_field', 'holographic_encoding'],
        discoveredByDefault: false,
        hintText: 'Near absolute zero, the geometry of spacetime begins to fluctuate. The holographic substrate encodes those fluctuations into something stable enough to examine.',
        description: 'Holographic substrate under double cryogenic matrix damping and quantum substrate anchoring, driven by quantum coherence, zero-point field, and holographic encoding. The cryogenic matrix suppresses thermal noise to the point where quantum geometry fluctuations become the dominant source of disorder. The holographic substrate allows the resulting microstate superposition to be specified as a boundary condition rather than a volumetric chaos. What condenses is a controlled pocket of spacetime near its ground state: a region where the distinction between geometry and matter begins to dissolve. The entropic foam is not a material in the conventional sense — it is a bounded spacetime fluctuation, stable while contained. Gates T22.',
        isActive: true
    },
    {
        reactionKey: 'gen6_graviton_condensate',
        name: 'Graviton Condensate Assembly',
        generationTier: 6,
        unlockTier: 21,
        reactants: [
            { key: 'planck_lattice',    quantity: 1 },
            { key: 'metallic_hydrogen', quantity: 4 },
            { key: 'quantum_substrate', quantity: 1 }
        ],
        product: { key: 'graviton_condensate', quantity: 1 },
        energyCost: 3800,
        reactionTime: 345600,
        conditions: ['nucleon_compression', 'metric_tension'],
        discoveredByDefault: false,
        hintText: 'At Planck-density curvature, gravitons scatter often enough to reach thermal equilibrium. The metric tension condition holds the curvature. What condenses is gravity itself.',
        description: 'Planck lattice under metallic hydrogen mass-energy loading and quantum substrate phase stabilization, driven by nucleon compression and metric tension. The planck lattice sustains the curvature stress required; metallic hydrogen provides the mass-energy density that drives graviton scattering to thermal equilibrium rates; quantum substrate anchors the condensate against decoherence. At sufficient curvature, gravitons — the quanta of the gravitational field — scatter frequently enough to reach a condensed state: gravity behaving as bulk matter. The reactor has synthesized a piece of what holds the universe together. Gates T23.',
        isActive: true
    },
    {
        reactionKey: 'gen6_moduli_condensate',
        name: 'Moduli Condensate Stabilization',
        generationTier: 6,
        unlockTier: 21,
        reactants: [
            { key: 'brane_filament',       quantity: 1 },
            { key: 'planck_lattice',       quantity: 1 },
            { key: 'reactive_plasma_core', quantity: 2 },
            { key: 'nitrogen',             quantity: 8 }
        ],
        product: { key: 'moduli_condensate', quantity: 1 },
        energyCost: 3600,
        reactionTime: 345600,
        conditions: ['zero_point_field', 'causal_isolation'],
        discoveredByDefault: false,
        hintText: 'The scalar fields that govern the shape of hidden dimensions, driven into condensation by the causal isolation the brane filament provides.',
        description: 'Brane filament and planck lattice combined under reactive plasma excitation and nitrogen as a field mediator, driven by zero-point field and causal isolation. The brane filament\'s causal isolation prevents the moduli field from coupling to the external metric and dissipating; the planck lattice provides the density required for moduli field condensation; the two reactive plasma cores drive the field excitation. Without causal isolation, the moduli field would immediately couple to macroscopic gravity and detach from the reactor. Contained, it is a scalar condensate encoding the geometry of dimensions that normal matter never encounters. The moduli condensate is the capstone of Track C.',
        isActive: true
    },

    // ── Gen 6 — T22 Capstone ──────────────────────────────────────────────────
    {
        reactionKey: 'gen6_spacetime_nexus',
        name: 'Spacetime Nexus Convergence',
        generationTier: 6,
        unlockTier: 22,
        reactants: [
            { key: 'entropic_foam',        quantity: 1 },
            { key: 'graviton_condensate',  quantity: 1 },
            { key: 'moduli_condensate',    quantity: 1 },
            { key: 'axionic_condensate',   quantity: 1 },
            { key: 'reactive_plasma_core', quantity: 2 }
        ],
        product: { key: 'spacetime_nexus', quantity: 1 },
        energyCost: 5000,
        reactionTime: 432000,
        conditions: ['holographic_encoding', 'metric_tension', 'causal_isolation'],
        discoveredByDefault: false,
        hintText: 'Three Gen 6 conditions. Three track outputs. The axionic condensate as foundation. What forms is not composed of matter — it is a region of spacetime whose interior geometry differs from everything outside it.',
        description: 'The three Gen 6 track outputs converge: entropic foam from Track A, graviton condensate from Track B, moduli condensate from Track C. Anchored by axionic condensate as the Gen 5 foundation and driven by two reactive plasma cores as ignition energy. All three Gen 6 conditions active simultaneously — holographic encoding specifies the boundary geometry, metric tension maintains the curvature scaffold, causal isolation prevents the structure from coupling to the external spacetime and unraveling. The three matter types provide mutual support for each other\'s stability conditions: the entropic foam\'s fluctuation is structured by the graviton condensate\'s curvature; the graviton condensate is shielded from decoherence by the moduli condensate\'s causal boundary; the moduli condensate\'s extra-dimensional geometry is anchored by the entropic foam\'s vacuum structure. What forms is a spacetime nexus: a bounded region whose interior geometry differs from its surroundings, self-sustaining against collapse. The reactor has synthesized a piece of the fabric of the universe itself. Gen 6 is complete.',
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
