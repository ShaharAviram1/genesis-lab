const CONDITION_REGISTRY = require('../config/conditionRegistry');

// Called inside completeReaction after unlockTier has been updated.
// Evaluates which capabilities should now be unlocked based on the
// produced substance and the tier crossing that occurred this completion.
// Pushes new keys into user.reactorCapabilities (deduplication guaranteed).
// Returns the array of newly added capability keys (empty when none).
//
// Tier-based unlocks fire only when this completion crosses the gate tier —
// i.e. previousUnlockTier < gate <= newUnlockTier. A user already above the
// gate tier does NOT re-unlock on unrelated reactions.
function evaluateCapabilityUnlocks(user, productKey, previousUnlockTier, newUnlockTier) {
    const newCapabilities = [];
    const existing = user.reactorCapabilities || [];

    for (const entry of CONDITION_REGISTRY) {
        if (existing.includes(entry.key)) continue;

        const { type, substanceKey, tier } = entry.unlock;

        if (type === 'substance' && substanceKey === productKey) {
            user.reactorCapabilities.push(entry.key);
            newCapabilities.push(entry.key);
        } else if (type === 'unlockTier' && tier > previousUnlockTier && tier <= newUnlockTier) {
            user.reactorCapabilities.push(entry.key);
            newCapabilities.push(entry.key);
        }
    }

    return newCapabilities;
}

module.exports = evaluateCapabilityUnlocks;
