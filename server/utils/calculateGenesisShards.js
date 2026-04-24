function calculateGenesisShards(runTotals, unlockTier) {
    let genesisShards = unlockTier ** 2 - 1;
    for (const entry of runTotals) {
        const base = entry.substance.shardValue || 0;
        if (base > 0) {
            genesisShards += base;
            genesisShards += Math.log2(entry.produced + 1);
        }
    }
    return Math.round(genesisShards);
}

module.exports = calculateGenesisShards;