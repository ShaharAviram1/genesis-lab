import './PrestigePanel.css';

const UPGRADE_META = {
    energy:    { label: 'Energy',    desc: '+20% energy gain' },
    matter:    { label: 'Matter',    desc: '-5% atom cost'    },
    chemistry: { label: 'Chemistry', desc: '-5% reaction cost' },
};

function PrestigePanel({ prestigeUpgrades, upgradePrestige, genesisShards, upgrading, isBusy }) {
    return (
        <div className="prestige-panel">
            {Object.entries(prestigeUpgrades).map(([key, value]) => {
                const cost = (value + 1) * 2;
                const canAfford = genesisShards >= cost;
                const isUpgrading = upgrading === key;
                const isDisabled = isUpgrading || !canAfford || isBusy;
                const meta = UPGRADE_META[key] || { label: key, desc: '' };
                return (
                    <div key={key} className="upgrade-card">
                        <div className="upgrade-info">
                            <span className="upgrade-name">{meta.label}</span>
                            <span className="upgrade-desc">{meta.desc}</span>
                        </div>
                        <div className="upgrade-controls">
                            <span className="upgrade-level">{value > 0 ? `Lv. ${value}` : 'Unupgraded'}</span>
                            <button
                                className={`upgrade-btn ${!canAfford ? 'unaffordable' : ''}`}
                                onClick={() => upgradePrestige(key)}
                                disabled={isDisabled}
                            >
                                {isUpgrading ? 'Upgrading...' : `↑ ${cost} ◈`}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PrestigePanel;
