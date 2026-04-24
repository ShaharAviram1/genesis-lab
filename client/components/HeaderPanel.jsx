import './HeaderPanel.css';

const TIER_NAMES = {
    0: 'Primordial',
    1: 'Atomic',
    2: 'Basic Chemistry',
    3: 'Combustion',
    4: 'Organic',
    5: 'Complex Systems',
};

function HeaderPanel({ unlockTier, bigBangs, genesisShards, getCurrentGoal }) {
    const tierName = TIER_NAMES[unlockTier] || `Tier ${unlockTier}`;
    return (
        <header className="header-panel">
            <div className="header-title">Genesis Lab</div>
            <div className="header-stats">
                <div className="stat-chip">
                    <span className="stat-label">Tier</span>
                    <span className="stat-value">{unlockTier} <span className="stat-tier-name">— {tierName}</span></span>
                </div>
                <div className="stat-chip">
                    <span className="stat-label">Big Bangs</span>
                    <span className="stat-value">{bigBangs}</span>
                </div>
                <div className="stat-chip shard">
                    <span className="stat-label">Shards</span>
                    <span className="stat-value">{genesisShards} ◈</span>
                </div>
            </div>
            <div className="header-divider" />
            <div className="header-goal">
                <span className="goal-label">Objective</span>
                <span className="goal-text">{getCurrentGoal()}</span>
            </div>
        </header>
    );
}

export default HeaderPanel;
