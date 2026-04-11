function calculateGenesisShards(runTotals, unlockTier) {
    let genesisShards = unlockTier**2-1; // Base shards from unlock tier, can be adjusted as needed
    for (const entry of runTotals) {
        switch (entry.substance.name) {
            case "Water":
                genesisShards += 1;
                genesisShards += Math.log2(entry.produced+1); // Bonus shards based on quantity produced, can be adjusted as needed
                break;
            case "Fuel":
                genesisShards += 2;
                genesisShards += Math.log2(entry.produced+1);
                break;
            case "Organic Matter":
                genesisShards += 4;
                genesisShards += Math.log2(entry.produced+1);
                break;
            case "Complex Hydrocarbon":
                genesisShards += 6;
                genesisShards += Math.log2(entry.produced+1);
                break;
            default:
                break;
        }

    }
    return Math.round(genesisShards);
}

module.exports = calculateGenesisShards;