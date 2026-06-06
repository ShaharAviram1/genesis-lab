const Substance = require('../models/Substance');
const evaluateCapabilityUnlocks = require('./evaluateCapabilityUnlocks');
const { applyDiscoveryUpdate } = require('./discoveryEngine');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// pruneAfter = completedAt + max(24h, effectiveReactionTime)
// Keeps long-duration entries visible long enough for offline players to see them.
function calcPruneWindow(effectiveReactionTimeSec) {
    return Math.max(ONE_DAY_MS, (effectiveReactionTimeSec || 0) * 1000);
}

function addReactionLogEntry(user, entry) {
    user.reactionLog.unshift(entry);
    if (user.reactionLog.length > 20) user.reactionLog.length = 20;
}

// Completes a synthesis on the user document (in memory — caller is responsible for saving).
//
// entry shape:
// {
//   source: 'perform' | 'experiment'         — determines reactionLog type and message wording
//   _substance: SubstanceDocument (optional) — pre-resolved from thin adapter; skips DB lookup
//   status: String (optional)                — present on real queue entries; set to 'completed' on success
//   snapshot: {
//     reactionName:           String
//     productKey:             String          — used for DB lookup when _substance is absent
//     productName:            String
//     productQuantity:        Number
//     productUnlocksUserTier: Number | null
//     reactants: [{ name: String, quantity: Number }]
//   }
// }
//
// Returns: { wasDiscovery, prevUnlockTier, newUnlockTier }
async function completeReaction(user, entry) {
    const { snapshot } = entry;

    // Resolve the product substance. The thin adapter provides _substance directly to avoid
    // an extra DB query (it already has the populated document). The queue resolver omits it
    // and looks up by key, which is resilient to stale ObjectId refs after content edits.
    const substance = entry._substance
        || await Substance.findOne({ substanceKey: snapshot.productKey });

    if (!substance) {
        if (entry.status !== undefined) {
            const now = new Date();
            entry.status = 'failed';
            entry.completedAt = now;
            entry.pruneAfter = new Date(now.getTime() + calcPruneWindow(snapshot.effectiveReactionTime));
        }
        console.error(`completeReaction: substance not found for key '${snapshot.productKey}'`);
        return { wasDiscovery: false, prevUnlockTier: user.unlockTier, newUnlockTier: user.unlockTier, newCapabilities: [] };
    }

    const substanceId = substance._id.toString();

    // Add product to inventory
    const existing = user.inventory.find(inv =>
        (inv.substance._id || inv.substance).toString() === substanceId
    );
    if (existing) {
        existing.quantity += snapshot.productQuantity;
    } else {
        user.inventory.push({ substance: substance._id, quantity: snapshot.productQuantity });
    }

    // Determine wasDiscovery before touching runTotals
    const prevTotal = user.runTotals.find(rt =>
        (rt.substance._id || rt.substance).toString() === substanceId
    );
    const wasDiscovery = !prevTotal;

    // Update runTotals
    if (prevTotal) {
        prevTotal.produced += snapshot.productQuantity;
    } else {
        user.runTotals.push({ substance: substance._id, produced: snapshot.productQuantity });
    }

    // Advance unlockTier on first production of a gate substance
    const prevUnlockTier = user.unlockTier;
    if (wasDiscovery && snapshot.productUnlocksUserTier && snapshot.productUnlocksUserTier > user.unlockTier) {
        user.unlockTier = snapshot.productUnlocksUserTier;
    }

    // Evaluate capability unlocks after unlockTier is updated — order matters.
    // Pass both tier values so tier-based unlocks fire only on the crossing, not on every completion.
    const newCapabilities = evaluateCapabilityUnlocks(user, snapshot.productKey, prevUnlockTier, user.unlockTier);

    // Update discovery evidence — non-fatal; discovery state must not block synthesis delivery.
    let discoveryTransitions = [];
    try {
        discoveryTransitions = await applyDiscoveryUpdate(user, substance);
    } catch (discoveryErr) {
        console.error(`completeReaction: discovery update failed for '${snapshot.productKey}':`, discoveryErr);
    }

    // Write reactionLog entry
    const successMessage = entry.source === 'experiment'
        ? `Experiment created ${snapshot.productName}`
        : `Created ${snapshot.productName}`;
    addReactionLogEntry(user, {
        type: entry.source || 'perform',
        outcome: wasDiscovery ? 'discovery' : 'success',
        substances: snapshot.reactants.map(r => r.name),
        product: snapshot.productName,
        message: wasDiscovery ? `Discovered ${snapshot.productName}` : successMessage
    });

    // Update queue entry fields when this is a real queue entry (has a status field)
    if (entry.status !== undefined) {
        const now = new Date();
        entry.wasDiscovery = wasDiscovery;
        entry.status = 'completed';
        entry.completedAt = now;
        entry.pruneAfter = new Date(now.getTime() + calcPruneWindow(snapshot.effectiveReactionTime));
    }

    return { wasDiscovery, prevUnlockTier, newUnlockTier: user.unlockTier, newCapabilities, discoveryTransitions };
}

module.exports = completeReaction;
