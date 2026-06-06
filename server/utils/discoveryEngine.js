const CONDITION_REGISTRY = require('../config/conditionRegistry');
const Reaction = require('../models/Reaction');

// Derived from conditionRegistry — substance-unlocked conditions only (Gen 5-6).
// Maps conditionKey → substanceKey that grants it.
// Tier-unlocked conditions (Gen 4 base: extreme_pressure, plasma_state, etc.) are
// excluded because they unlock from tier progression, not substance synthesis, and
// are always available once the player reaches their generation.
const CONDITION_GRANTS = {};
for (const entry of CONDITION_REGISTRY) {
    if (entry.unlock.type === 'substance') {
        CONDITION_GRANTS[entry.key] = entry.unlock.substanceKey;
    }
}
const UNLOCKABLE_CONDITIONS = new Set(Object.keys(CONDITION_GRANTS));

// Compute a reaction's discovery state from stored evidence on the user document.
// reaction must have reactants populated (reactants[].substance.substanceKey accessible).
//
// Returns one of:
//   { state: 'unknown' }
//   { state: 'anomaly', generationTier, totalInputCount }
//   { state: 'partial', completedSubstances, substanceSignals }
//   { state: 'near_complete', completedSubstances, completedConditions, substanceSignals, conditionSignals }
//   { state: 'understood', completedSubstances, completedConditions, substanceSignals, conditionSignals }
function computeDiscoveryState(reaction, userDoc) {
    const substanceSignals = [
        ...new Set(
            (reaction.reactants || [])
                .map(r => r.substance?.substanceKey)
                .filter(Boolean)
        )
    ];
    const conditionSignals = (reaction.conditions || []).filter(c => UNLOCKABLE_CONDITIONS.has(c));
    const totalSignals = substanceSignals.length + conditionSignals.length;

    const record = (userDoc.reactionDiscovery || []).find(r => r.reactionKey === reaction.reactionKey)
        ?? { completedSubstanceKeys: [], completedConditionKeys: [] };

    const completedSubstances = substanceSignals.filter(k =>
        (record.completedSubstanceKeys || []).includes(k)
    );
    const completedConditions = conditionSignals.filter(k =>
        (record.completedConditionKeys || []).includes(k)
    );
    const completedSignals = completedSubstances.length + completedConditions.length;

    // Understood: all signals complete
    if (completedSubstances.length === substanceSignals.length &&
        completedConditions.length === conditionSignals.length) {
        return { state: 'understood', completedSubstances, completedConditions, substanceSignals, conditionSignals };
    }

    // Near Complete: one signal away from complete, at least one substance known
    if (completedSignals >= totalSignals - 1 && completedSubstances.length >= 1) {
        return { state: 'near_complete', completedSubstances, completedConditions, substanceSignals, conditionSignals };
    }

    // Partial: at least one substance known
    if (completedSubstances.length >= 1) {
        return { state: 'partial', completedSubstances, substanceSignals };
    }

    // Anomaly: gen proximity (same or adjacent generation synthesized) AND tier reached
    const discoveredGens = userDoc.discoveredGenerations || [];
    const genProximity =
        discoveredGens.includes(reaction.generationTier) ||
        discoveredGens.includes(reaction.generationTier - 1);
    const tierReached = userDoc.unlockTier >= reaction.unlockTier;

    if (genProximity && tierReached) {
        return { state: 'anomaly', generationTier: reaction.generationTier, totalInputCount: substanceSignals.length };
    }

    return { state: 'unknown' };
}

// Called inside completeReaction after a synthesis completes.
// Updates user.discoveredGenerations and user.reactionDiscovery in-memory.
// Makes a targeted DB query for only the reactions affected by this substance.
// Returns an array of state transitions: [{ reactionKey, reactionName, generationTier, oldState, newState }]
// Non-fatal: caller should catch errors and log; synthesis must not fail due to discovery errors.
async function applyDiscoveryUpdate(userDoc, substance) {
    if (!substance?._id || !substance.substanceKey) return [];

    const productKey = substance.substanceKey;
    const genTier = substance.generationTier;
    const isNewGen = !(userDoc.discoveredGenerations || []).includes(genTier);

    // Which condition (if any) does this substance grant?
    const grantedConditionEntry = Object.entries(CONDITION_GRANTS).find(([, key]) => key === productKey);
    const grantedCondition = grantedConditionEntry?.[0] ?? null;

    // Targeted query: only reactions that list this substance as a reactant,
    // or require the condition this substance grants.
    const queryOr = [{ 'reactants.substance': substance._id }];
    if (grantedCondition) queryOr.push({ conditions: grantedCondition });

    const affectedReactions = await Reaction.find({
        discoveredByDefault: false,
        $or: queryOr
    }).populate('reactants.substance', 'substanceKey');

    if (!userDoc.reactionDiscovery) userDoc.reactionDiscovery = [];

    // Snapshot old discovery states before any mutations so transitions are accurate.
    // This must happen before discoveredGenerations is updated (gen proximity check).
    const oldStates = new Map(
        affectedReactions.map(r => [r.reactionKey, computeDiscoveryState(r, userDoc).state])
    );

    // Apply gen proximity update
    if (!userDoc.discoveredGenerations) userDoc.discoveredGenerations = [];
    if (isNewGen) userDoc.discoveredGenerations.push(genTier);

    // Apply substance and condition signal mutations
    for (const reaction of affectedReactions) {
        let record = userDoc.reactionDiscovery.find(r => r.reactionKey === reaction.reactionKey);
        if (!record) {
            record = { reactionKey: reaction.reactionKey, completedSubstanceKeys: [], completedConditionKeys: [] };
            userDoc.reactionDiscovery.push(record);
        }

        const isDirectInput = reaction.reactants.some(r => r.substance?.substanceKey === productKey);
        if (isDirectInput && !record.completedSubstanceKeys.includes(productKey)) {
            record.completedSubstanceKeys.push(productKey);
        }

        if (grantedCondition &&
            reaction.conditions.includes(grantedCondition) &&
            !record.completedConditionKeys.includes(grantedCondition)) {
            record.completedConditionKeys.push(grantedCondition);
        }
    }

    // Compute new states and collect transitions where the state changed
    const transitions = [];
    for (const reaction of affectedReactions) {
        const oldState = oldStates.get(reaction.reactionKey);
        const newDiscovery = computeDiscoveryState(reaction, userDoc);
        const newState = newDiscovery.state;
        if (newState !== oldState) {
            const completedSignals =
                (newDiscovery.completedSubstances?.length ?? 0) +
                (newDiscovery.completedConditions?.length ?? 0);
            const totalSignals =
                (newDiscovery.substanceSignals?.length ?? 0) +
                (newDiscovery.conditionSignals?.length ?? 0);
            transitions.push({
                reactionKey: reaction.reactionKey,
                reactionName: reaction.name,
                generationTier: reaction.generationTier,
                oldState,
                newState,
                completedSignals,
                totalSignals,
            });
        }
    }

    return transitions;
}

// Called once per session (in GET /reactions/available) to reflect Gen 1 atoms
// that are present in inventory but were never "synthesized" (no runTotals entry).
// Idempotent — returns true only when it actually writes new keys.
// allReactions must have reactants.substance populated with at least { substanceKey, generationTier }.
function applyGen1Discovery(userDoc, allReactions) {
    const gen1Keys = new Set(
        (userDoc.inventory || [])
            .filter(item => item.substance?.generationTier === 1 && item.quantity > 0)
            .map(item => item.substance.substanceKey)
            .filter(Boolean)
    );

    if (gen1Keys.size === 0) return false;

    if (!userDoc.reactionDiscovery) userDoc.reactionDiscovery = [];
    let changed = false;

    for (const reaction of allReactions) {
        if (reaction.discoveredByDefault) continue;

        const gen1Reactants = (reaction.reactants || [])
            .filter(r => r.substance?.generationTier === 1 && gen1Keys.has(r.substance.substanceKey))
            .map(r => r.substance.substanceKey);

        if (gen1Reactants.length === 0) continue;

        let record = userDoc.reactionDiscovery.find(r => r.reactionKey === reaction.reactionKey);
        if (!record) {
            record = { reactionKey: reaction.reactionKey, completedSubstanceKeys: [], completedConditionKeys: [] };
            userDoc.reactionDiscovery.push(record);
        }

        for (const key of gen1Reactants) {
            if (!record.completedSubstanceKeys.includes(key)) {
                record.completedSubstanceKeys.push(key);
                changed = true;
            }
        }
    }

    return changed;
}

module.exports = {
    computeDiscoveryState,
    applyDiscoveryUpdate,
    applyGen1Discovery,
    CONDITION_GRANTS,
    UNLOCKABLE_CONDITIONS,
};
