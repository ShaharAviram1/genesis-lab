import { useState } from 'react';
import './PrestigeBranchPanel.css';

const REACTOR_CAPACITY = [
    {
        key: 'expanded_reactor_bay',
        name: 'Expanded Reactor Bay',
        description: '+1 reactor slot (run 2 reactions in parallel)',
        cost: 30
    },
    {
        key: 'triple_reactor_array',
        name: 'Triple Reactor Array',
        description: '+1 reactor slot (third parallel slot)',
        cost: 150,
        requires: 'expanded_reactor_bay'
    }
];

// Mirrors server/config/prestigeConfig.js reaction_acceleration entries.
// Costs are balancing placeholders and may change after playtesting.
const REACTION_ACCELERATION = [
    {
        key: 'foundry_optimizer',
        name: 'Foundry Optimizer',
        generationLabel: 'Gen 2',
        perLevel: 0.9,
        maxLevel: 5,
        levelCosts: [5, 10, 20, 40, 80]
    },
    {
        key: 'materials_lab_optimizer',
        name: 'Materials Lab Optimizer',
        generationLabel: 'Gen 3',
        perLevel: 0.9,
        maxLevel: 5,
        levelCosts: [10, 20, 40, 80, 160]
    },
    {
        key: 'fusion_chamber_optimizer',
        name: 'Fusion Chamber Optimizer',
        generationLabel: 'Gen 4',
        perLevel: 0.9,
        maxLevel: 5,
        levelCosts: [15, 30, 60, 120, 240]
    }
];

const QUEUE_BUFFER = [
    {
        key: 'queue_buffer',
        name: 'Queue Buffer',
        description: '+1 buffer slot — queue one reaction while slots are occupied',
        cost: 60
    },
    {
        key: 'extended_buffer',
        name: 'Extended Buffer',
        description: '+2 buffer slots (total 3). Requires Queue Buffer.',
        cost: 200,
        requires: 'queue_buffer'
    }
];

// Mirrors server/config/prestigeConfig.js atom_automation entries.
// ratePerHour / cap are base (level 1) values; actual values scale by 1.5× per level.
// upgradeCosts[i] = cost to go from level i+1 → i+2 (4 entries → max level 5).
const ATOM_MODULES = [
    {
        key: 'atmospheric_separator',
        name: 'Atmospheric Separator',
        produces: ['hydrogen', 'oxygen'],
        cost: 80,
        constructionEnergy: 400,
        constructionMaterials: [
            { substanceKey: 'hydrogen_gas', name: 'Hydrogen Gas', quantity: 6 },
            { substanceKey: 'oxygen_gas',   name: 'Oxygen Gas',   quantity: 4 },
            { substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 2 },
        ],
        ratePerHour: 20,
        cap: 200,
        maxLevel: 5,
        upgradeCosts: [
            { energyCost: 600,  materialCost: [{ substanceKey: 'hydrogen_gas', name: 'Hydrogen Gas', quantity: 6  }, { substanceKey: 'oxygen_gas',    name: 'Oxygen Gas',    quantity: 4  }] },
            { energyCost: 1000, materialCost: [{ substanceKey: 'hydrogen_gas', name: 'Hydrogen Gas', quantity: 10 }, { substanceKey: 'ammonia',        name: 'Ammonia',       quantity: 4  }] },
            { energyCost: 1600, materialCost: [{ substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 8  }, { substanceKey: 'hydrogen_gas',   name: 'Hydrogen Gas',  quantity: 15 }] },
            { energyCost: 2500, materialCost: [{ substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 15 }, { substanceKey: 'oxygen_gas',     name: 'Oxygen Gas',    quantity: 12 }, { substanceKey: 'water', name: 'Water', quantity: 2 }] },
        ],
    },
    {
        key: 'carbon_scrubber',
        name: 'Carbon Scrubber',
        produces: ['carbon'],
        cost: 150,
        constructionEnergy: 800,
        constructionMaterials: [
            { substanceKey: 'carbon',         name: 'Carbon',          quantity: 15 },
            { substanceKey: 'graphene',        name: 'Graphene',        quantity: 4 },
            { substanceKey: 'carbon_nanotube', name: 'Carbon Nanotube', quantity: 1 },
        ],
        ratePerHour: 20,
        cap: 250,
        maxLevel: 5,
        upgradeCosts: [
            { energyCost: 1200, materialCost: [{ substanceKey: 'carbon',         name: 'Carbon',         quantity: 15 }, { substanceKey: 'graphene',        name: 'Graphene',        quantity: 3  }] },
            { energyCost: 2000, materialCost: [{ substanceKey: 'graphene',        name: 'Graphene',        quantity: 6  }, { substanceKey: 'carbon_nanotube', name: 'Carbon Nanotube', quantity: 1  }] },
            { energyCost: 3200, materialCost: [{ substanceKey: 'carbon_nanotube', name: 'Carbon Nanotube', quantity: 2  }, { substanceKey: 'graphene',        name: 'Graphene',        quantity: 8  }] },
            { energyCost: 5000, materialCost: [{ substanceKey: 'carbon_nanotube', name: 'Carbon Nanotube', quantity: 4  }, { substanceKey: 'graphene',        name: 'Graphene',        quantity: 12 }] },
        ],
    },
    {
        key: 'nitrogen_condenser',
        name: 'Nitrogen Condenser',
        produces: ['nitrogen'],
        cost: 100,
        constructionEnergy: 500,
        constructionMaterials: [
            { substanceKey: 'nitrogen_gas', name: 'Nitrogen Gas', quantity: 5 },
            { substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 4 },
            { substanceKey: 'aramid_fiber', name: 'Aramid Fiber', quantity: 2 },
        ],
        ratePerHour: 12,
        cap: 120,
        maxLevel: 5,
        upgradeCosts: [
            { energyCost: 750,  materialCost: [{ substanceKey: 'nitrogen_gas', name: 'Nitrogen Gas', quantity: 6  }, { substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 3  }, { substanceKey: 'nitric_acid', name: 'Nitric Acid', quantity: 1 }] },
            { energyCost: 1200, materialCost: [{ substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 8  }, { substanceKey: 'nitrogen_gas', name: 'Nitrogen Gas', quantity: 10 }] },
            { energyCost: 2000, materialCost: [{ substanceKey: 'aramid_fiber', name: 'Aramid Fiber', quantity: 2  }, { substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 12 }] },
            { energyCost: 3000, materialCost: [{ substanceKey: 'aramid_fiber', name: 'Aramid Fiber', quantity: 4  }, { substanceKey: 'ammonia',      name: 'Ammonia',      quantity: 16 }] },
        ],
    },
    {
        key: 'iron_smelter',
        name: 'Iron Smelter',
        produces: ['iron'],
        cost: 150,
        constructionEnergy: 700,
        constructionMaterials: [
            { substanceKey: 'iron_oxide',      name: 'Iron Oxide',      quantity: 6 },
            { substanceKey: 'steel',           name: 'Steel',           quantity: 2 },
            { substanceKey: 'stainless_steel', name: 'Stainless Steel', quantity: 1 },
        ],
        ratePerHour: 12,
        cap: 120,
        maxLevel: 5,
        upgradeCosts: [
            { energyCost: 1000, materialCost: [{ substanceKey: 'iron_oxide',      name: 'Iron Oxide',      quantity: 8  }, { substanceKey: 'steel',           name: 'Steel',           quantity: 2  }] },
            { energyCost: 1600, materialCost: [{ substanceKey: 'steel',           name: 'Steel',           quantity: 4  }, { substanceKey: 'stainless_steel', name: 'Stainless Steel', quantity: 1  }] },
            { energyCost: 2600, materialCost: [{ substanceKey: 'stainless_steel', name: 'Stainless Steel', quantity: 2  }, { substanceKey: 'steel',           name: 'Steel',           quantity: 6  }] },
            { energyCost: 4000, materialCost: [{ substanceKey: 'stainless_steel', name: 'Stainless Steel', quantity: 4  }, { substanceKey: 'steel',           name: 'Steel',           quantity: 10 }] },
        ],
    },
    {
        key: 'sulfur_extractor',
        name: 'Sulfur Extractor',
        produces: ['sulfur'],
        cost: 80,
        constructionEnergy: 350,
        constructionMaterials: [
            { substanceKey: 'sulfur',        name: 'Sulfur',        quantity: 5 },
            { substanceKey: 'sulfuric_acid', name: 'Sulfuric Acid', quantity: 2 },
            { substanceKey: 'chrome',        name: 'Chrome',        quantity: 1 },
        ],
        ratePerHour: 10,
        cap: 80,
        maxLevel: 5,
        upgradeCosts: [
            { energyCost: 500,  materialCost: [{ substanceKey: 'sulfur',        name: 'Sulfur',        quantity: 8  }, { substanceKey: 'sulfuric_acid', name: 'Sulfuric Acid', quantity: 3  }] },
            { energyCost: 800,  materialCost: [{ substanceKey: 'sulfuric_acid', name: 'Sulfuric Acid', quantity: 5  }, { substanceKey: 'chrome',        name: 'Chrome',        quantity: 1  }] },
            { energyCost: 1300, materialCost: [{ substanceKey: 'chrome',        name: 'Chrome',        quantity: 2  }, { substanceKey: 'sulfuric_acid', name: 'Sulfuric Acid', quantity: 8  }] },
            { energyCost: 2000, materialCost: [{ substanceKey: 'chrome',        name: 'Chrome',        quantity: 4  }, { substanceKey: 'sulfuric_acid', name: 'Sulfuric Acid', quantity: 12 }] },
        ],
    },
];

function percentReduction(perLevel, level) {
    if (level <= 0) return 0;
    return Math.round((1 - Math.pow(perLevel, level)) * 100);
}

function generatorStats(mod, level) {
    const l = Math.max(1, level || 1);
    return {
        rate: Math.floor(mod.ratePerHour * Math.pow(1.5, l - 1)),
        cap:  Math.floor(mod.cap         * Math.pow(1.5, l - 1)),
    };
}

export default function PrestigeBranchPanel({
    genesisShards,
    blueprints,
    prestigeUpgrades,
    purchaseBlueprint,
    isBusy,
    generators = [],
    constructModule,
    upgradeModule,
    userEnergy = 0,
    inventory = [],
}) {
    const [legacyExpanded, setLegacyExpanded] = useState(false);

    const ownedKeys = new Set((blueprints || []).map(b => b.blueprintKey));
    const ownedLevels = new Map((blueprints || []).map(b => [b.blueprintKey, b.level || 0]));

    return (
        <div className="prestige-branch-panel">
            <div className="prestige-shard-balance">
                Genesis Shards: {genesisShards ?? 0}
            </div>

            <div>
                <div className="prestige-section-title">Reactor Capacity</div>
                {REACTOR_CAPACITY.map(bp => {
                    const owned = ownedKeys.has(bp.key);
                    const prereqOk = !bp.requires || ownedKeys.has(bp.requires);
                    const canAfford = (genesisShards ?? 0) >= bp.cost;
                    const prereqName = bp.requires
                        ? REACTOR_CAPACITY.find(r => r.key === bp.requires)?.name
                        : null;
                    return (
                        <div key={bp.key} className={`blueprint-card${owned ? ' owned' : ''}`}>
                            <div className="blueprint-info">
                                <div className="blueprint-name">{bp.name}</div>
                                <div className="blueprint-produces">
                                    {bp.description}
                                    {!prereqOk && (
                                        <span> · Requires {prereqName}</span>
                                    )}
                                </div>
                            </div>
                            <div className="blueprint-controls">
                                {owned ? (
                                    <span className="blueprint-owned-chip">OWNED</span>
                                ) : (
                                    <>
                                        <span className="blueprint-cost">
                                            Cost: {bp.cost} shard{bp.cost !== 1 ? 's' : ''}
                                        </span>
                                        <button
                                            className={`btn blueprint-btn${(!canAfford || !prereqOk) ? ' unaffordable' : ''}`}
                                            disabled={isBusy || !canAfford || !prereqOk}
                                            onClick={() => purchaseBlueprint(bp.key)}
                                        >
                                            Purchase Blueprint
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div>
                <div className="prestige-section-title">Reaction Acceleration</div>
                {REACTION_ACCELERATION.map(bp => {
                    const level = ownedLevels.get(bp.key) || 0;
                    const atMax = level >= bp.maxLevel;
                    const nextCost = atMax ? null : bp.levelCosts[level];
                    const canAfford = !atMax && (genesisShards ?? 0) >= nextCost;
                    const currentReduction = percentReduction(bp.perLevel, level);
                    const nextReduction = atMax ? currentReduction : percentReduction(bp.perLevel, level + 1);
                    return (
                        <div key={bp.key} className={`blueprint-card${level > 0 ? ' owned' : ''}`}>
                            <div className="blueprint-info">
                                <div className="blueprint-name">{bp.name}</div>
                                <div className="blueprint-produces">
                                    {bp.generationLabel} reactions
                                    {level > 0
                                        ? ` · −${currentReduction}% time (Lv ${level}/${bp.maxLevel})`
                                        : ` · −10% per level (max ${bp.maxLevel})`}
                                </div>
                            </div>
                            <div className="blueprint-controls">
                                {atMax ? (
                                    <span className="blueprint-owned-chip">MAX</span>
                                ) : (
                                    <>
                                        <span className="blueprint-cost">
                                            {level > 0 ? `Lv ${level + 1}: ` : 'Cost: '}{nextCost} shard{nextCost !== 1 ? 's' : ''}
                                            {level > 0 && <> · −{nextReduction}%</>}
                                        </span>
                                        <button
                                            className={`btn blueprint-btn${!canAfford ? ' unaffordable' : ''}`}
                                            disabled={isBusy || !canAfford}
                                            onClick={() => purchaseBlueprint(bp.key)}
                                        >
                                            {level > 0 ? 'Upgrade' : 'Purchase Blueprint'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div>
                <div className="prestige-section-title">Queue Buffer</div>
                {QUEUE_BUFFER.map(bp => {
                    const owned = ownedKeys.has(bp.key);
                    const prereqOk = !bp.requires || ownedKeys.has(bp.requires);
                    const canAfford = (genesisShards ?? 0) >= bp.cost;
                    const prereqName = bp.requires
                        ? QUEUE_BUFFER.find(r => r.key === bp.requires)?.name
                        : null;
                    return (
                        <div key={bp.key} className={`blueprint-card${owned ? ' owned' : ''}`}>
                            <div className="blueprint-info">
                                <div className="blueprint-name">{bp.name}</div>
                                <div className="blueprint-produces">
                                    {bp.description}
                                    {!prereqOk && (
                                        <span> · Requires {prereqName}</span>
                                    )}
                                </div>
                            </div>
                            <div className="blueprint-controls">
                                {owned ? (
                                    <span className="blueprint-owned-chip">OWNED</span>
                                ) : (
                                    <>
                                        <span className="blueprint-cost">
                                            Cost: {bp.cost} shard{bp.cost !== 1 ? 's' : ''}
                                        </span>
                                        <button
                                            className={`btn blueprint-btn${(!canAfford || !prereqOk) ? ' unaffordable' : ''}`}
                                            disabled={isBusy || !canAfford || !prereqOk}
                                            onClick={() => purchaseBlueprint(bp.key)}
                                        >
                                            Purchase Blueprint
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div>
                <div className="prestige-section-title">Atom Automation</div>
                {ATOM_MODULES.map(mod => {
                    const owned = ownedKeys.has(mod.key);
                    const gen = generators.find(g => g.moduleKey === mod.key);
                    const constructed = !!gen;
                    const genLevel = gen?.level ?? 1;
                    const canAfford = (genesisShards ?? 0) >= mod.cost;

                    // Construction affordability
                    const energyOk = (userEnergy ?? 0) >= mod.constructionEnergy;
                    const materialsOk = mod.constructionMaterials.every(({ substanceKey, quantity }) => {
                        const have = inventory.find(i => i.substance?.substanceKey === substanceKey)?.quantity ?? 0;
                        return have >= quantity;
                    });
                    const canConstruct = energyOk && materialsOk;

                    // Upgrade affordability
                    const atMax = genLevel >= mod.maxLevel;
                    const upgCost = (constructed && !atMax) ? mod.upgradeCosts[genLevel - 1] : null;
                    const upgEnergyOk = !upgCost || (userEnergy ?? 0) >= upgCost.energyCost;
                    const upgMatsOk = !upgCost || (upgCost.materialCost ?? []).every(({ substanceKey, quantity }) => {
                        const have = inventory.find(i => i.substance?.substanceKey === substanceKey)?.quantity ?? 0;
                        return have >= quantity;
                    });
                    const canUpgrade = !!upgCost && upgEnergyOk && upgMatsOk;

                    const stats = generatorStats(mod, genLevel);

                    return (
                        <div key={mod.key} className={`blueprint-card${owned ? ' owned' : ''}`}>
                            <div className="blueprint-info">
                                <div className="blueprint-name">{mod.name}</div>
                                <div className="blueprint-produces">
                                    {owned
                                        ? `${mod.produces.join(' + ')} · +${stats.rate}/hr · cap ${stats.cap}`
                                        : `Produces: ${mod.produces.join(', ')}`}
                                </div>
                            </div>
                            <div className="blueprint-controls">
                                {!owned ? (
                                    <>
                                        <span className="blueprint-cost">
                                            Cost: {mod.cost} shard{mod.cost !== 1 ? 's' : ''}
                                        </span>
                                        <button
                                            className={`btn blueprint-btn${!canAfford ? ' unaffordable' : ''}`}
                                            disabled={isBusy || !canAfford}
                                            onClick={() => purchaseBlueprint(mod.key)}
                                        >
                                            Purchase Blueprint
                                        </button>
                                    </>
                                ) : constructed ? (
                                    <>
                                        <div className="generator-level-row">
                                            <span className="generator-level-chip">Lv {genLevel}</span>
                                            <span className="generator-stats">{stats.rate}/hr · cap {stats.cap}</span>
                                        </div>
                                        {atMax ? (
                                            <span className="blueprint-owned-chip">MAX</span>
                                        ) : (
                                            <>
                                                <span className="blueprint-cost">
                                                    Upgrade: {upgCost.energyCost} energy
                                                </span>
                                                <div className="blueprint-mat-list">
                                                    {(upgCost.materialCost ?? []).map(({ substanceKey, name, quantity }) => {
                                                        const have = inventory.find(i => i.substance?.substanceKey === substanceKey)?.quantity ?? 0;
                                                        return (
                                                            <span key={substanceKey} className={`blueprint-mat${have >= quantity ? '' : ' blueprint-mat--low'}`}>
                                                                {quantity}× {name}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <button
                                                    className={`btn blueprint-btn${!canUpgrade ? ' unaffordable' : ''}`}
                                                    disabled={isBusy || !canUpgrade}
                                                    onClick={() => upgradeModule(mod.key)}
                                                >
                                                    Upgrade to Lv {genLevel + 1}
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span className="blueprint-cost">
                                            Build: {mod.constructionEnergy} energy
                                        </span>
                                        <div className="blueprint-mat-list">
                                            {mod.constructionMaterials.map(({ substanceKey, name, quantity }) => {
                                                const have = inventory.find(i => i.substance?.substanceKey === substanceKey)?.quantity ?? 0;
                                                return (
                                                    <span key={substanceKey} className={`blueprint-mat${have >= quantity ? '' : ' blueprint-mat--low'}`}>
                                                        {quantity}× {name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <button
                                            className={`btn blueprint-btn${!canConstruct ? ' unaffordable' : ''}`}
                                            disabled={isBusy || !canConstruct}
                                            onClick={() => constructModule(mod.key)}
                                        >
                                            Construct
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div>
                <button
                    className="legacy-toggle"
                    onClick={() => setLegacyExpanded(e => !e)}
                >
                    <span className="legacy-toggle-label">Reactor Efficiency</span>
                    <span className="legacy-toggle-hint">
                        {legacyExpanded ? 'expanded ▴' : 'collapsed ▾'}
                    </span>
                </button>
                {legacyExpanded && (
                    <div className="legacy-section">
                        <div className="legacy-note">
                            Legacy — no further upgrades available
                        </div>
                        {['energy', 'matter', 'chemistry'].map(key => (
                            <div key={key} className="legacy-stat-row">
                                <span className="legacy-stat-label">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </span>
                                <span className="legacy-stat-value">
                                    ×{(prestigeUpgrades?.[key] ?? 0) + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
