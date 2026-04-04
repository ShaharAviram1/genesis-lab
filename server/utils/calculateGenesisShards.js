function calculateGenesisShards(runTotals){
    let genesisShards = 0;
    for (const entry of runTotals) {
        switch (entry.substance.name) {
            case "Water":
                genesisShards += 1;
                break;
            case "Fuel":
                genesisShards += 2;
                break;
            case "Organic Matter":
                genesisShards += 4;
                break;
            case "Complex Hydrocarbon":
                genesisShards += 6;
                break;
            default:
                break;
        }

    }
    return genesisShards;
}

module.exports = calculateGenesisShards;