function PrestigePanel({ prestigeUpgrades, upgradePrestige, genesisShards, upgrading, isBusy }) {
    return (
    <>
        {Object.entries(prestigeUpgrades).map(([key, value]) => (
            <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)} Prestige Upgrades: {value}
                <button onClick={() => upgradePrestige(key)} disabled={upgrading === key || genesisShards < ((prestigeUpgrades[key] + 1) * 2) || isBusy}>
                    {`Upgrade ${key.charAt(0).toUpperCase() + key.slice(1)} (cost: ${(prestigeUpgrades[key] + 1) * 2} Genesis Shards)`}
                </button></p>
            ))
        }
    </>
    );
}
export default PrestigePanel;