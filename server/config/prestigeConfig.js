// Global constants for atom automation (R2).
// maxOfflineHours caps catch-up ticks so offline players don't receive
// unbounded stockpiles. minTickIntervalSec prevents micro-ticks on rapid
// request bursts (e.g. page load + WS connect firing within milliseconds).
const AUTOMATION_CONFIG = {
    maxOfflineHours:       24,
    minTickIntervalSec:    30,
    maxGeneratorLevel:     5,
    upgradeRateMultiplier: 1.5,
    upgradeCapMultiplier:  1.1,
};

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
            blueprintCost: 60
        },
        extended_buffer: {
            name: 'Extended Buffer',
            category: 'queue_buffer',
            description: 'Adds 2 more buffer slots (total 3). Requires Queue Buffer.',
            grantsBuffer: 2,
            requires: 'queue_buffer',
            blueprintCost: 200
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

        // ── R2 — Atom Automation ──────────────────────────────────────────────────
        // Blueprint is permanent (survives Big Bang).
        // Constructed module (user.generators[]) is per-run — reset on Big Bang.
        // constructionMaterialCost: inventory substances consumed at build time.
        // productionRatePerHour: units produced per listed substance per hour.
        // productionCap: stops producing once inventory for that substance reaches
        //   this level (from any source). Incentivises using materials.
        atmospheric_separator: {
            name: 'Atmospheric Separator',
            category: 'atom_automation',
            produces: ['hydrogen', 'oxygen'],
            blueprintCost: 80,
            constructionEnergyCost: 400,
            constructionMaterialCost: [
                { substanceKey: 'hydrogen_gas', quantity: 6 },
                { substanceKey: 'oxygen_gas',   quantity: 4 },
                { substanceKey: 'ammonia',       quantity: 2 },
            ],
            productionRatePerHour: 20,
            productionCap: 200,
            // upgradeCosts[i] = cost to go from level i+1 → i+2 (4 entries → max level 5)
            upgradeCosts: [
                { energyCost: 600,  materialCost: [{ substanceKey: 'hydrogen_gas', quantity: 6  }, { substanceKey: 'oxygen_gas',    quantity: 4  }] },
                { energyCost: 1000, materialCost: [{ substanceKey: 'hydrogen_gas', quantity: 10 }, { substanceKey: 'ammonia',        quantity: 4  }] },
                { energyCost: 1600, materialCost: [{ substanceKey: 'ammonia',      quantity: 8  }, { substanceKey: 'hydrogen_gas',   quantity: 15 }] },
                { energyCost: 2500, materialCost: [{ substanceKey: 'ammonia',      quantity: 15 }, { substanceKey: 'oxygen_gas',     quantity: 12 }, { substanceKey: 'water', quantity: 2 }] },
            ],
        },
        carbon_scrubber: {
            name: 'Carbon Scrubber',
            category: 'atom_automation',
            produces: ['carbon'],
            blueprintCost: 150,
            constructionEnergyCost: 800,
            constructionMaterialCost: [
                { substanceKey: 'carbon',         quantity: 15 },
                { substanceKey: 'graphene',        quantity: 4 },
                { substanceKey: 'carbon_nanotube', quantity: 1 },
            ],
            productionRatePerHour: 20,
            productionCap: 250,
            upgradeCosts: [
                { energyCost: 1200, materialCost: [{ substanceKey: 'carbon',         quantity: 15 }, { substanceKey: 'graphene',        quantity: 3  }] },
                { energyCost: 2000, materialCost: [{ substanceKey: 'graphene',        quantity: 6  }, { substanceKey: 'carbon_nanotube', quantity: 1  }] },
                { energyCost: 3200, materialCost: [{ substanceKey: 'carbon_nanotube', quantity: 2  }, { substanceKey: 'graphene',        quantity: 8  }] },
                { energyCost: 5000, materialCost: [{ substanceKey: 'carbon_nanotube', quantity: 4  }, { substanceKey: 'graphene',        quantity: 12 }] },
            ],
        },
        nitrogen_condenser: {
            name: 'Nitrogen Condenser',
            category: 'atom_automation',
            produces: ['nitrogen'],
            blueprintCost: 100,
            constructionEnergyCost: 500,
            constructionMaterialCost: [
                { substanceKey: 'nitrogen_gas', quantity: 5 },
                { substanceKey: 'ammonia',      quantity: 4 },
                { substanceKey: 'aramid_fiber', quantity: 2 },
            ],
            productionRatePerHour: 12,
            productionCap: 120,
            upgradeCosts: [
                { energyCost: 750,  materialCost: [{ substanceKey: 'nitrogen_gas', quantity: 6  }, { substanceKey: 'ammonia',      quantity: 3  }, { substanceKey: 'nitric_acid', quantity: 1 }] },
                { energyCost: 1200, materialCost: [{ substanceKey: 'ammonia',      quantity: 8  }, { substanceKey: 'nitrogen_gas', quantity: 10 }] },
                { energyCost: 2000, materialCost: [{ substanceKey: 'aramid_fiber', quantity: 2  }, { substanceKey: 'ammonia',      quantity: 12 }] },
                { energyCost: 3000, materialCost: [{ substanceKey: 'aramid_fiber', quantity: 4  }, { substanceKey: 'ammonia',      quantity: 16 }] },
            ],
        },
        iron_smelter: {
            name: 'Iron Smelter',
            category: 'atom_automation',
            produces: ['iron'],
            blueprintCost: 150,
            constructionEnergyCost: 700,
            constructionMaterialCost: [
                { substanceKey: 'iron_oxide',      quantity: 6 },
                { substanceKey: 'steel',           quantity: 2 },
                { substanceKey: 'stainless_steel', quantity: 1 },
            ],
            productionRatePerHour: 12,
            productionCap: 120,
            upgradeCosts: [
                { energyCost: 1000, materialCost: [{ substanceKey: 'iron_oxide',      quantity: 8  }, { substanceKey: 'steel',           quantity: 2  }] },
                { energyCost: 1600, materialCost: [{ substanceKey: 'steel',           quantity: 4  }, { substanceKey: 'stainless_steel', quantity: 1  }] },
                { energyCost: 2600, materialCost: [{ substanceKey: 'stainless_steel', quantity: 2  }, { substanceKey: 'steel',           quantity: 6  }] },
                { energyCost: 4000, materialCost: [{ substanceKey: 'stainless_steel', quantity: 4  }, { substanceKey: 'steel',           quantity: 10 }] },
            ],
        },
        sulfur_extractor: {
            name: 'Sulfur Extractor',
            category: 'atom_automation',
            produces: ['sulfur'],
            blueprintCost: 80,
            constructionEnergyCost: 350,
            constructionMaterialCost: [
                { substanceKey: 'sulfur',        quantity: 5 },
                { substanceKey: 'sulfuric_acid', quantity: 2 },
                { substanceKey: 'chrome',        quantity: 1 },
            ],
            productionRatePerHour: 10,
            productionCap: 80,
            upgradeCosts: [
                { energyCost: 500,  materialCost: [{ substanceKey: 'sulfur',        quantity: 8  }, { substanceKey: 'sulfuric_acid', quantity: 3  }] },
                { energyCost: 800,  materialCost: [{ substanceKey: 'sulfuric_acid', quantity: 5  }, { substanceKey: 'chrome',        quantity: 1  }] },
                { energyCost: 1300, materialCost: [{ substanceKey: 'chrome',        quantity: 2  }, { substanceKey: 'sulfuric_acid', quantity: 8  }] },
                { energyCost: 2000, materialCost: [{ substanceKey: 'chrome',        quantity: 4  }, { substanceKey: 'sulfuric_acid', quantity: 12 }] },
            ],
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

// Returns the effective rate and cap for a generator at the given level.
// Rate and cap scale multiplicatively per level using AUTOMATION_CONFIG multipliers.
function getGeneratorStats(moduleKey, level) {
    const cfg = PRESTIGE_CONFIG.modules[moduleKey];
    if (!cfg) return { productionRatePerHour: 0, productionCap: 0 };
    const maxLevel = (cfg.upgradeCosts?.length ?? 0) + 1;
    const l = Math.max(1, Math.min(level || 1, maxLevel));
    const rMult = Math.pow(AUTOMATION_CONFIG.upgradeRateMultiplier, l - 1);
    const cMult = Math.pow(AUTOMATION_CONFIG.upgradeCapMultiplier,  l - 1);
    return {
        productionRatePerHour: Math.floor(cfg.productionRatePerHour * rMult),
        productionCap:         Math.floor(cfg.productionCap         * cMult),
    };
}

module.exports = PRESTIGE_CONFIG;
module.exports.AUTOMATION_CONFIG = AUTOMATION_CONFIG;
module.exports.getGeneratorStats = getGeneratorStats;
module.exports.getMaxSlots = getMaxSlots;
module.exports.getMaxBufferSlots = getMaxBufferSlots;
module.exports.getReactionTimeMultiplier = getReactionTimeMultiplier;
