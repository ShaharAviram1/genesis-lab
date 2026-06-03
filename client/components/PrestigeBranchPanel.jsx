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

const ATOM_MODULES = [
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
                <div className="prestige-section-title">Atom Automation <span className="section-subtitle">— R2 (in development)</span></div>
                {ATOM_MODULES.map(mod => {
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
