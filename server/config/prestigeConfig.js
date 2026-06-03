const PRESTIGE_CONFIG = {
    modules: {
        // ── R1 — Reactor Capacity (queue slot expansion) ────────────────────
        expanded_reactor_bay: {
            name: 'Expanded Reactor Bay',
            category: 'reactor_capacity',
            description: 'Unlocks a second reactor slot. Two reactions can run in parallel.',
            grantsSlots: 1,
            blueprintCost: 30
        },
        triple_reactor_array: {
            name: 'Triple Reactor Array',
            category: 'reactor_capacity',
            description: 'Adds a third reactor slot. Requires Expanded Reactor Bay.',
            grantsSlots: 1,
            requires: 'expanded_reactor_bay',
            blueprintCost: 150
        },

        // ── R2 — Atom Automation (placeholder; production engine not yet built) ──
        atmospheric_separator: {
            name: 'Atmospheric Separator',
            category: 'atom_automation',
            produces: ['hydrogen', 'oxygen'],
            blueprintCost: 1
        },
        carbon_scrubber: {
            name: 'Carbon Scrubber',
            category: 'atom_automation',
            produces: ['carbon'],
            blueprintCost: 1
        },
        nitrogen_condenser: {
            name: 'Nitrogen Condenser',
            category: 'atom_automation',
            produces: ['nitrogen'],
            blueprintCost: 1
        },
        iron_smelter: {
            name: 'Iron Smelter',
            category: 'atom_automation',
            produces: ['iron'],
            blueprintCost: 1
        },
        sulfur_extractor: {
            name: 'Sulfur Extractor',
            category: 'atom_automation',
            produces: ['sulfur'],
            blueprintCost: 1
        }
    }
};

// Returns the maximum number of concurrent reactor slots for this user.
// Base = 1 (the hardcoded starting slot). Each owned blueprint with
// category 'reactor_capacity' contributes its grantsSlots value.
function getMaxSlots(user) {
    const owned = new Set((user.blueprints || []).map(b => b.blueprintKey));
    let slots = 1;
    for (const [key, cfg] of Object.entries(PRESTIGE_CONFIG.modules)) {
        if (cfg.category === 'reactor_capacity' && owned.has(key)) {
            slots += cfg.grantsSlots || 0;
        }
    }
    return slots;
}

module.exports = PRESTIGE_CONFIG;
module.exports.getMaxSlots = getMaxSlots;
