function calculateEnergyGain(user) {
    const baseEnergy = 1;
    const energyLevel = user.prestigeUpgrades.energy || 0;

    const rawGain = baseEnergy * (1 + 0.2 * energyLevel);

    // Keep energy as natural numbers
    return Math.max(1, Math.floor(rawGain));
}

function calculateAtomCost(user, baseCost) {
    const matterLevel = user.prestigeUpgrades.matter || 0;

    const rawCost = baseCost * (1 - 0.05 * matterLevel);

    // Ensure integer cost and minimum of 1
    return Math.max(1, Math.ceil(rawCost));
}

function calculateReactionCost(user, baseCost) {
    const chemistryLevel = user.prestigeUpgrades.chemistry || 0;

    const rawCost = baseCost * (1 - 0.05 * chemistryLevel);

    // Ensure integer cost and minimum of 1
    return Math.max(1, Math.ceil(rawCost));
}

module.exports = { calculateEnergyGain, calculateAtomCost, calculateReactionCost };