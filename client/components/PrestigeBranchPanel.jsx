import { useState } from 'react';
import './PrestigeBranchPanel.css';

const MODULES = [
    { key: 'atmospheric_separator', name: 'Atmospheric Separator', produces: ['hydrogen', 'oxygen'], cost: 1 },
    { key: 'carbon_scrubber',       name: 'Carbon Scrubber',       produces: ['carbon'],             cost: 1 },
    { key: 'nitrogen_condenser',    name: 'Nitrogen Condenser',    produces: ['nitrogen'],           cost: 1 },
    { key: 'iron_smelter',          name: 'Iron Smelter',          produces: ['iron'],               cost: 1 },
    { key: 'sulfur_extractor',      name: 'Sulfur Extractor',      produces: ['sulfur'],             cost: 1 },
];

export default function PrestigeBranchPanel({
    genesisShards,
    blueprints,
    prestigeUpgrades,
    purchaseBlueprint,
    isBusy
}) {
    const [legacyExpanded, setLegacyExpanded] = useState(false);

    const ownedKeys = new Set((blueprints || []).map(b => b.blueprintKey));

    return (
        <div className="prestige-branch-panel">
            <div className="prestige-shard-balance">
                Genesis Shards: {genesisShards ?? 0}
            </div>

            <div>
                <div className="prestige-section-title">Automation Infrastructure</div>
                {MODULES.map(mod => {
                    const owned = ownedKeys.has(mod.key);
                    const canAfford = (genesisShards ?? 0) >= mod.cost;
                    return (
                        <div key={mod.key} className={`blueprint-card${owned ? ' owned' : ''}`}>
                            <div className="blueprint-info">
                                <div className="blueprint-name">{mod.name}</div>
                                <div className="blueprint-produces">
                                    Produces: {mod.produces.join(', ')}
                                </div>
                            </div>
                            <div className="blueprint-controls">
                                {owned ? (
                                    <span className="blueprint-owned-chip">OWNED</span>
                                ) : (
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
