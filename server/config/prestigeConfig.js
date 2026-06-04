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

        // ── R1 — Queue Buffer (buffered-slot expansion) ────────────────────
        queue_buffer: {
            name: 'Queue Buffer',
            category: 'queue_buffer',
            description: 'Adds 1 buffer slot. Queue one reaction while slots are occupied.',
            grantsBuffer: 1,
            blueprintCost: 20
        },
        extended_buffer: {
            name: 'Extended Buffer',
            category: 'queue_buffer',
            description: 'Adds 2 more buffer slots (total 3). Requires Queue Buffer.',
            grantsBuffer: 2,
            requires: 'queue_buffer',
            blueprintCost: 60
        },

        // ── R1 — Reaction Acceleration (per-generation time multiplier) ─────
        // Cost values below are balancing placeholders and may change after
        // playtesting. Multiplier is multiplicative compounding per level:
        // effectiveTime = baseTime × (reactionTimeMultiplierPerLevel)^level.
        // At maxLevel=5 with 0.9 per level → 0.59049× (≈ -41% per blueprint).
        foundry_optimizer: {
            name: 'Foundry Optimizer',
            category: 'reaction_acceleration',
            generationTier: 2,
            description: 'Reduces Gen 2 reaction time by 10% per level (max 5 levels).',
            maxLevel: 5,
            effect: { reactionTimeMultiplierPerLevel: 0.9 },
            levelCosts: [5, 10, 20, 40, 80]
        },
        materials_lab_optimizer: {
            name: 'Materials Lab Optimizer',
            category: 'reaction_acceleration',
            generationTier: 3,
            description: 'Reduces Gen 3 reaction time by 10% per level (max 5 levels).',
            maxLevel: 5,
            effect: { reactionTimeMultiplierPerLevel: 0.9 },
            levelCosts: [10, 20, 40, 80, 160]
        },
        fusion_chamber_optimizer: {
            name: 'Fusion Chamber Optimizer',
            category: 'reaction_acceleration',
            generationTier: 4,
            description: 'Reduces Gen 4 reaction time by 10% per level (max 5 levels).',
            maxLevel: 5,
            effect: { reactionTimeMultiplierPerLevel: 0.9 },
            levelCosts: [15, 30, 60, 120, 240]
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

// Returns the multiplier applied to reactionTime for the given generationTier.
// Iterates all owned blueprints tagged 'reaction_acceleration' that match the
// generation, composing their per-level contributions multiplicatively. Future
// branches can add new categories; each contributes a factor to the product.
function getReactionTimeMultiplier(user, generationTier) {
    let multiplier = 1;
    for (const bp of user.blueprints || []) {
        const cfg = PRESTIGE_CONFIG.modules[bp.blueprintKey];
        if (!cfg) continue;
        if (cfg.category !== 'reaction_acceleration') continue;
        if (cfg.generationTier !== generationTier) continue;
        const perLevel = cfg.effect?.reactionTimeMultiplierPerLevel ?? 1;
        multiplier *= Math.pow(perLevel, bp.level || 0);
    }
    return multiplier;
}

// Returns the maximum number of entries that can sit in the queue buffer
// (status 'queued', awaiting a free processing slot).
// Base = 0. Each owned blueprint with category 'queue_buffer' contributes its grantsBuffer value.
function getMaxBufferSlots(user) {
    const owned = new Set((user.blueprints || []).map(b => b.blueprintKey));
    let buffer = 0;
    for (const [key, cfg] of Object.entries(PRESTIGE_CONFIG.modules)) {
        if (cfg.category === 'queue_buffer' && owned.has(key)) {
            buffer += cfg.grantsBuffer || 0;
        }
    }
    return buffer;
}

module.exports = PRESTIGE_CONFIG;
module.exports.getMaxSlots = getMaxSlots;
module.exports.getMaxBufferSlots = getMaxBufferSlots;
module.exports.getReactionTimeMultiplier = getReactionTimeMultiplier;
