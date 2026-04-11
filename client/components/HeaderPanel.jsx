function HeaderPanel({ unlockTier, bigBangs, genesisShards, getCurrentGoal }) { 
    return (
        <>
            <h3>Unlock Tier: {unlockTier} --- Big Bangs: {bigBangs}</h3>
            <h4>Genesis Shards: {genesisShards}</h4>
            <p>Current Goal: {getCurrentGoal()}</p>
        </>
    );
}
export default HeaderPanel;