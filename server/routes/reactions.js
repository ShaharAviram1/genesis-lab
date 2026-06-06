const express = require('express');
const Reaction = require('./../models/Reaction');
const User = require('../models/User');
const checkReactionEligibility = require('../utils/checkReactionEligibility');
const Substance = require('../models/Substance');
const { calculateReactionCost } = require('./../utils/gameEconomy');
const { flushPendingMongoEnergyForUser, updateSessionPersistedEnergyBaseForUser, emitToUser, emitQueueCompletions, emitQueuePromotions, isUserConnected } = require('./../realtime/reactorRuntime');
const completeReaction = require('../utils/completeReaction');
const { resolveQueue, resolveAndPruneUserQueue, addPendingNotifications } = require('../utils/resolveQueue');
const validateConditions = require('../utils/validateConditions');
const { getMaxSlots, getMaxBufferSlots, getReactionTimeMultiplier } = require('./../config/prestigeConfig');
const { computeDiscoveryState, applyGen1Discovery } = require('../utils/discoveryEngine');

const router = express.Router();

const BASE_EXPERIMENTAL_REACTION_COST = 20;

// True if the reaction's product has been produced before (runTotals) or is default-discovered.
// Used only for queue-entry revealOnCompletion — product identity in a running queue entry.
function wasProductPreviouslyProduced(user, reaction) {
    if (reaction.discoveredByDefault) return true;
    const productId = (reaction.product?.substance?._id || reaction.product?.substance)?.toString();
    return user.runTotals.some(rt => (rt.substance._id || rt.substance).toString() === productId);
}

// True if this reaction is in 'understood' discovery state (can be queued and shows full recipe).
function isReactionUnderstood(user, reaction) {
    if (reaction.discoveredByDefault) return true;
    return computeDiscoveryState(reaction, user).state === 'understood';
}

// Builds a partial reaction payload shaped for the client based on discovery state.
// reaction must have reactants.substance and product.substance populated.
function buildDiscoveryReaction(reaction, discovery) {
    const base = {
        _id: reaction._id,
        reactionKey: reaction.reactionKey,
        unknown: true,
        discoveryState: discovery.state,
        generationTier: reaction.generationTier,
        unlockTier: reaction.unlockTier,
    };

    if (discovery.state === 'anomaly') {
        return { ...base, totalInputCount: discovery.totalInputCount };
    }

    // Deduplicated list of revealed substance slots (name + key, no quantities)
    const revealedInputs = [
        ...new Map(
            (reaction.reactants || [])
                .filter(r => discovery.completedSubstances.includes(r.substance?.substanceKey))
                .map(r => [r.substance.substanceKey, { name: r.substance.name, substanceKey: r.substance.substanceKey }])
        ).values()
    ];

    if (discovery.state === 'partial') {
        return {
            ...base,
            totalInputCount: discovery.substanceSignals.length,
            revealedInputs,
        };
    }

    // near_complete — one signal away; compute hints for remaining unknown slots
    const unknownSubstanceKeys = discovery.substanceSignals.filter(k => !discovery.completedSubstances.includes(k));
    const missingHints = unknownSubstanceKeys.map(unknownKey => {
        const reactant = (reaction.reactants || []).find(r => r.substance?.substanceKey === unknownKey);
        const sub = reactant?.substance;
        return { type: 'substance', hint: sub ? `Gen ${sub.generationTier} ${sub.category || 'material'}` : 'Unknown material' };
    });

    const unknownConditions = (discovery.conditionSignals || []).filter(c => !(discovery.completedConditions || []).includes(c));
    for (const _ of unknownConditions) {
        missingHints.push({ type: 'condition', hint: 'Unlockable reactor condition' });
    }

    return {
        ...base,
        totalInputCount: discovery.substanceSignals.length,
        revealedInputs,
        missingHints,
    };
}

function getSubstanceId(substance) {
    return (substance._id || substance).toString();
}

function hasRequiredReactants(user, reactants) {
    return reactants.every(({ substance, quantity }) => {
        const requiredSubstanceId = getSubstanceId(substance);
        const inventoryItem = user.inventory.find((inv) => getSubstanceId(inv.substance) === requiredSubstanceId);
        return inventoryItem && inventoryItem.quantity >= quantity;
    });
}

function hasOneOfEachSelectedSubstance(user, substanceIds) {
    return substanceIds.every((substanceId) => {
        const inventoryItem = user.inventory.find((inv) => getSubstanceId(inv.substance) === substanceId);
        return inventoryItem && inventoryItem.quantity >= 1;
    });
}

function consumeOneOfEachSelectedSubstance(user, substanceIds) {
    substanceIds.forEach((substanceId) => {
        const inventoryItem = user.inventory.find((inv) => getSubstanceId(inv.substance) === substanceId);
        if (inventoryItem) {
            inventoryItem.quantity -= 1;
        }
    });
    user.inventory = user.inventory.filter(item => item.quantity > 0);
}

function selectedSubstancesMatchReaction(selectedSubstanceIds, reaction) {
    const reactionSubstanceIds = reaction.reactants.map(({ substance }) => getSubstanceId(substance));
    if (reactionSubstanceIds.length !== selectedSubstanceIds.length) return false;
    return reactionSubstanceIds.every((substanceId) => selectedSubstanceIds.includes(substanceId));
}

const STATE_WORDS = new Set(['gas', 'liquid', 'solid', 'steam', 'ice', 'vapor', 'aqueous', 'molten']);

function normalizeSubstanceName(name) {
    return name
        .toLowerCase()
        .split(/\s+/)
        .filter(word => !STATE_WORDS.has(word))
        .join(' ')
        .trim();
}

function substancesLookRelated(selectedSubstances, reaction) {
    if (reaction.reactants.length !== selectedSubstances.length) return false;
    const normalizedSelected = selectedSubstances.map(s => normalizeSubstanceName(s.name)).sort();
    const normalizedReactants = reaction.reactants.map(r => normalizeSubstanceName(r.substance.name)).sort();
    return normalizedSelected.every((sel, i) => sel === normalizedReactants[i]);
}

function addReactionLogEntry(user, entry) {
    user.reactionLog.unshift(entry);
    if (user.reactionLog.length > 20) user.reactionLog.length = 20;
}

// Builds a thin adapter entry from a populated live reaction object so that the
// current perform/experiment routes can call completeReaction without a real queue entry.
// _substance is provided directly to avoid a redundant Substance DB lookup.
function buildAdapterEntry(reaction, source) {
    const product = reaction.product.substance;
    return {
        source,
        _substance: product,
        snapshot: {
            reactionName:           reaction.name,
            energyCost:             reaction.energyCost,
            productKey:             product.substanceKey,
            productName:            product.name,
            productQuantity:        reaction.product.quantity,
            productUnlocksUserTier: product.unlocksUserTier || null,
            reactants: reaction.reactants.map(r => ({
                substanceKey: r.substance.substanceKey,
                name:         r.substance.name,
                quantity:     r.quantity
            }))
        }
    };
}

// Deducts reactants and energy, then delegates completion to the shared helper.
// Returns { wasDiscovery, prevUnlockTier, newUnlockTier }.
// Legacy path — still used by POST /perform/:reactionKey until that route is migrated.
async function performReaction(user, reaction, energyCost, source = 'perform') {
    reaction.reactants.forEach(({ substance, quantity }) => {
        const inventoryItem = user.inventory.find(inv => getSubstanceId(inv.substance) === getSubstanceId(substance));
        if (inventoryItem) inventoryItem.quantity -= quantity;
    });
    user.energy -= energyCost;
    user.inventory = user.inventory.filter(item => item.quantity > 0);

    return completeReaction(user, buildAdapterEntry(reaction, source));
}

// Strips product identity fields from a queue entry when the synthesis is undiscovered,
// so the client never receives the product name/key before the reveal moment.
function sanitizeQueueEntry(entry) {
    if (!entry.revealOnCompletion) return entry;
    const safe = { ...entry };
    if (safe.snapshot) {
        const { productKey, productName, productQuantity, productUnlocksUserTier, ...safeSnapshot } = safe.snapshot;
        safe.snapshot = safeSnapshot;
    }
    return safe;
}

// ── Shared queue-start core ───────────────────────────────────────────────────
// Called by both POST /reactions/queue/:reactionKey and POST /reactions/experiment.
// Assumes: user is populated, resolveAndPruneUserQueue has already run on user,
//          reaction is a populated Mongoose document.
//
// options.energyCost — caller-computed; perform path uses calculateReactionCost,
//                      experiment path uses BASE_EXPERIMENTAL_REACTION_COST.
// options.source     — 'perform' | 'experiment' (for snapshot/log labelling).
//
// Returns on error:  { ok: false, status, error }
// Returns on queued: { ok: true, queued: true, completed: false, reactionKey,
//                      expectedCompletion, revealOnCompletion, entry }
// Returns on instant:{ ok: true, queued: false, completed: true, reactionKey,
//                      wasDiscovery, prevUnlockTier, newUnlockTier }
//
// Callers are responsible for populating user.inventory after calling this if
// they need serializable inventory data in the HTTP response.
async function startQueueSynthesis(user, reaction, { energyCost, source }) {
    // Discovery guard — Gen 4-6 reactions must be in 'understood' state before queuing.
    if (!reaction.discoveredByDefault && !isReactionUnderstood(user, reaction)) {
        return { ok: false, status: 403, error: 'Reaction pathway not yet understood' };
    }

    // Conditions are the hardest gate — check first before any deduction or slot validation.
    const { passed, missing } = validateConditions(reaction, user);
    if (!passed) {
        return { ok: false, status: 400, error: 'Reactor lacks required capabilities', missingConditions: missing };
    }

    const maxSlots = getMaxSlots(user);
    const occupiedEntries = user.activeQueue.filter(e => e.status === 'processing' || e.status === 'resolving');
    const ownedBlueprintKeys = (user.blueprints || []).map(b => b.blueprintKey);
    const diagMultiplier = getReactionTimeMultiplier(user, reaction.generationTier).toFixed(4);

    const allSlotsFull = occupiedEntries.length >= maxSlots;
    let assignedSlot = null;
    let entryStatus = 'processing';

    if (!allSlotsFull) {
        // Slot available — assign the lowest unused index in [0, maxSlots)
        const usedSlots = new Set(occupiedEntries.map(e => e.slot));
        assignedSlot = 0;
        while (usedSlots.has(assignedSlot)) assignedSlot++;
        console.log(`[slot-check] user=${user.username} owned=[${ownedBlueprintKeys.join(',')}] maxSlots=${maxSlots} occupied=${occupiedEntries.length} gen=${reaction.generationTier} timeMultiplier=${diagMultiplier} → ACCEPT slot=${assignedSlot}`);
    } else {
        // All slots occupied — try the buffer
        const maxBuffer = getMaxBufferSlots(user);
        const queuedCount = user.activeQueue.filter(e => e.status === 'queued').length;
        if (queuedCount >= maxBuffer) {
            console.log(`[slot-check] user=${user.username} owned=[${ownedBlueprintKeys.join(',')}] maxSlots=${maxSlots} occupied=${occupiedEntries.length} queued=${queuedCount} maxBuffer=${maxBuffer} → REJECT (queue full)`);
            return { ok: false, status: 400, error: 'Reactor queue is full' };
        }
        entryStatus = 'queued';
        console.log(`[slot-check] user=${user.username} owned=[${ownedBlueprintKeys.join(',')}] maxSlots=${maxSlots} occupied=${occupiedEntries.length} queued=${queuedCount}/${maxBuffer} gen=${reaction.generationTier} timeMultiplier=${diagMultiplier} → BUFFER`);
    }

    // Under the capability detection system, only 'understood' reactions reach the queue.
    // The product is already visible on the reaction card at understood state, so there
    // is nothing to withhold from the queue display. revealOnCompletion is always false.
    const revealOnCompletion = false;
    const reactionObj = reaction.toObject ? reaction.toObject() : reaction;

    if (user.energy < energyCost) {
        return { ok: false, status: 400, error: 'Not enough energy' };
    }
    if (!hasRequiredReactants(user, reactionObj.reactants)) {
        return { ok: false, status: 400, error: 'Missing required reactants' };
    }

    // Deduct in memory — committed atomically in user.save() below
    user.energy -= energyCost;
    reactionObj.reactants.forEach(({ substance, quantity }) => {
        const inv = user.inventory.find(i => getSubstanceId(i.substance) === getSubstanceId(substance));
        if (inv) inv.quantity -= quantity;
    });
    user.inventory = user.inventory.filter(item => item.quantity > 0);

    // Build queue entry — snapshot is the authoritative source for reward delivery
    const now = new Date();
    const product = reactionObj.product.substance;
    // Apply reaction-acceleration multiplier (Math.max guards against 0/negative
    // configurations; current optimizer config can only reduce times, not invert them).
    const timeMultiplier = getReactionTimeMultiplier(user, reactionObj.generationTier);
    const effectiveTime  = Math.max(0, reactionObj.reactionTime * timeMultiplier);

    // For 'processing' entries slot/timing are assigned now.
    // For 'queued' (buffered) entries slot/timing are null — set at promotion time.
    const queueEntry = {
        reactionKey:        reactionObj.reactionKey,
        slot:               assignedSlot,                 // null when queued
        startTime:          entryStatus === 'processing' ? now : null,
        expectedCompletion: entryStatus === 'processing'
            ? new Date(now.getTime() + effectiveTime * 1000)
            : null,
        status:             entryStatus,
        reactantsConsumed:  true,
        revealOnCompletion,
        wasDiscovery:       false,
        snapshot: {
            reactionName:           reactionObj.name,
            energyCost,
            productKey:             product.substanceKey,
            productName:            product.name,
            productQuantity:        reactionObj.product.quantity,
            productUnlocksUserTier: product.unlocksUserTier || null,
            effectiveReactionTime:  effectiveTime,
            reactants: reactionObj.reactants.map(r => ({
                substanceKey: r.substance.substanceKey,
                name:         r.substance.name,
                quantity:     r.quantity
            }))
        }
    };

    user.activeQueue.push(queueEntry);
    // Mongoose assigns _id to the subdocument synchronously on push.
    // Read it back from the array so the WS payload can carry per-entry identity.
    const insertedEntry = user.activeQueue[user.activeQueue.length - 1];
    const queueEntryId = insertedEntry._id != null ? insertedEntry._id.toString() : undefined;
    await user.save();
    updateSessionPersistedEnergyBaseForUser(user.username, user.energy);

    emitToUser(user.username, 'synthesis_queued', {
        queueEntryId,
        reactionKey:        reactionObj.reactionKey,
        status:             entryStatus,
        slot:               assignedSlot,
        startTime:          queueEntry.startTime,
        expectedCompletion: queueEntry.expectedCompletion,
        revealOnCompletion,
        ...(revealOnCompletion ? {} : { reactionName: reactionObj.name })
    });

    // Zero-duration immediate synthesis: complete within the same request via the full queue lifecycle.
    // Only applies to 'processing' entries (queued entries are promoted later).
    if (entryStatus === 'processing' && reactionObj.reactionTime === 0) {
        const { completions, promotions } = await resolveQueue(user);
        const connected = isUserConnected(user.username);
        if (completions.length > 0 && !connected) addPendingNotifications(user, completions);
        await user.save();
        updateSessionPersistedEnergyBaseForUser(user.username, user.energy);
        if (completions.length > 0 && connected) emitQueueCompletions(user.username, completions);
        if (promotions.length > 0 && connected) emitQueuePromotions(user.username, promotions);
        const completion = completions[0] || {};
        return {
            ok:             true,
            queued:         false,
            completed:      true,
            reactionKey:    reactionObj.reactionKey,
            wasDiscovery:   completion.wasDiscovery   || false,
            prevUnlockTier: completion.prevUnlockTier,
            newUnlockTier:  completion.newUnlockTier
        };
    }

    // Timed or buffered synthesis: entry persists; client shows countdown or queued state
    return {
        ok:                 true,
        queued:             true,
        completed:          false,
        reactionKey:        reactionObj.reactionKey,
        status:             entryStatus,
        expectedCompletion: queueEntry.expectedCompletion,
        revealOnCompletion,
        entry:              sanitizeQueueEntry({ ...queueEntry })
    };
}


router.get("/reactions", async (req, res) => {
    try {
        const reactions = await Reaction.find()
            .populate('reactants.substance')
            .populate('product.substance');
        res.status(200).json(reactions);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch reactions" });
    }
});


router.get("/reactions/available", async (req, res) => {
    try {
        if (!req.query.user) { return res.status(400).json({ error: "Missing username" }); }
        let user = await User.findOne({ username: req.query.user });
        if (!user) { return res.status(404).json({ error: "user not found" }); }

        try {
            const { user: fresh, completions, promotions } = await resolveAndPruneUserQueue(user);
            if (fresh) user = fresh;
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
            if (promotions.length > 0 && isUserConnected(user.username)) emitQueuePromotions(user.username, promotions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        const reactions = await Reaction.find({ unlockTier: { $lte: user.unlockTier } })
            .populate('reactants.substance')
            .populate('product.substance');

        // Ensure Gen 1 atoms in inventory are reflected as completed substance signals.
        // No-op once all Gen 1 keys are recorded; only saves when something new is added.
        try {
            const gen1Changed = applyGen1Discovery(user, reactions);
            if (gen1Changed) await user.save();
        } catch (gen1Err) {
            console.error('Gen1 discovery update failed for user', user.username, ':', gen1Err);
        }

        const objReactions = reactions.map(reaction => {
            if (reaction.discoveredByDefault) {
                const reactionObj = reaction.toObject();
                reactionObj.energyCost = calculateReactionCost(user, reaction.energyCost);
                reactionObj.unknown = false;
                return reactionObj;
            }

            const discovery = computeDiscoveryState(reaction, user);
            if (discovery.state === 'unknown') return null;

            if (discovery.state === 'understood') {
                const reactionObj = reaction.toObject();
                reactionObj.energyCost = calculateReactionCost(user, reaction.energyCost);
                reactionObj.unknown = false;
                reactionObj.discoveryState = 'understood';
                const productId = reaction.product?.substance?._id?.toString();
                const hasProduced = productId && user.runTotals.some(
                    rt => (rt.substance?._id || rt.substance)?.toString() === productId
                );
                reactionObj.isNewlyUnderstood = !hasProduced;
                return reactionObj;
            }

            return buildDiscoveryReaction(reaction, discovery);
        }).filter(Boolean);

        return res.status(200).json(objReactions);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch reactions" });
    }
});


router.get("/reactions/:reactionKey", async (req, res) => {
    try {
        const reaction = await Reaction.findOne({ reactionKey: req.params.reactionKey })
            .populate('reactants.substance')
            .populate('product.substance');
        if (!reaction) {
            return res.status(404).json({ error: "Reaction not found" });
        }

        if (!req.query.user) {
            return res.status(400).json({ error: "Missing username" });
        }
        await flushPendingMongoEnergyForUser(req.query.user);
        let user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        try {
            const { user: fresh, completions, promotions } = await resolveAndPruneUserQueue(user);
            if (fresh) user = fresh;
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
            if (promotions.length > 0 && isUserConnected(user.username)) emitQueuePromotions(user.username, promotions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        if (!reaction.discoveredByDefault) {
            const discovery = computeDiscoveryState(reaction, user);
            if (discovery.state !== 'understood') {
                return res.status(200).json({ reaction: buildDiscoveryReaction(reaction, discovery), canPerform: false });
            }
        }
        const objReaction = reaction.toObject();
        objReaction.energyCost = calculateReactionCost(user, reaction.energyCost);
        const canPerform = checkReactionEligibility(user, objReaction);
        return res.status(200).json({ reaction: objReaction, canPerform });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to fetch reaction" });
    }
});

// Legacy direct-perform route — still active until frontend migrates to queue route.
router.post("/perform/:reactionKey", async (req, res) => {
    try {
        let reaction = await Reaction.findOne({ reactionKey: req.params.reactionKey })
            .populate('reactants.substance')
            .populate('product.substance');
        if (!reaction) { return res.status(404).json({ error: "Reaction not found" }); }
        if (!req.query.user) {
            return res.status(400).json({ error: "missing username" });
        }
        await flushPendingMongoEnergyForUser(req.query.user);
        let user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        try {
            const { user: fresh, completions, promotions } = await resolveAndPruneUserQueue(user);
            if (fresh) user = fresh;
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
            if (promotions.length > 0 && isUserConnected(user.username)) emitQueuePromotions(user.username, promotions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        reaction = reaction.toObject();
        reaction.energyCost = calculateReactionCost(user, reaction.energyCost);
        const canPerform = checkReactionEligibility(user, reaction);
        if (canPerform) {
            const { wasDiscovery: discovered } = await performReaction(user, reaction, reaction.energyCost, 'perform');
            await user.save();
            updateSessionPersistedEnergyBaseForUser(user.username, user.energy);
            await user.populate(['inventory.substance', 'runTotals.substance']);
            return res.status(200).json({ success: true, inventory: user.inventory, reactionKey: reaction.reactionKey, discovered });
        }
        else {
            return res.status(400).json({ error: "Requirements not met to perform reaction" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to perform" });
    }
});

router.post("/reactions/experiment", async (req, res) => {
    try {
        if (!req.query.user) {
            return res.status(400).json({ error: "missing username" });
        }
        await flushPendingMongoEnergyForUser(req.query.user);
        let user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        try {
            const { user: fresh, completions, promotions } = await resolveAndPruneUserQueue(user);
            if (fresh) user = fresh;
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
            if (promotions.length > 0 && isUserConnected(user.username)) emitQueuePromotions(user.username, promotions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        const { substances } = req.body;
        if (!substances || !Array.isArray(substances) || substances.length < 1) {
            return res.status(400).json({ error: "Experiment requires at least one substance" });
        }

        const selectedSubstanceIds = [...new Set(substances.map((substance) => substance.toString()))];
        if (selectedSubstanceIds.length !== substances.length) {
            return res.status(400).json({ error: "Duplicate substances are not supported in experiments" });
        }

        if (user.energy < BASE_EXPERIMENTAL_REACTION_COST) {
            return res.status(400).json({ error: "Not enough energy for experiment" });
        }

        if (!hasOneOfEachSelectedSubstance(user, selectedSubstanceIds)) {
            return res.status(400).json({ error: "Missing selected substances in inventory" });
        }

        const reactions = await Reaction.find({ unlockTier: { $lte: user.unlockTier } })
            .populate('reactants.substance')
            .populate('product.substance');

        const matchingReactions = reactions.filter(r => selectedSubstancesMatchReaction(selectedSubstanceIds, r));

        if (matchingReactions.length === 0) {
            const lockedReactions = await Reaction.find({ unlockTier: { $gt: user.unlockTier } })
                .populate('reactants.substance');
            if (lockedReactions.find(r => selectedSubstancesMatchReaction(selectedSubstanceIds, r))) {
                return res.status(200).json({
                    success: false,
                    discovered: false,
                    message: "No stable reaction formed",
                    hint: "Your reactor cannot stabilize this reaction yet.",
                    inventory: user.inventory,
                    energy: user.energy
                });
            }

            const selectedSubstances = await Substance.find({ _id: { $in: selectedSubstanceIds } });
            const allReactions = await Reaction.find().populate('reactants.substance');
            const similarMatch = allReactions.find(r => substancesLookRelated(selectedSubstances, r));

            const undiscoveredCurrentTier = reactions.filter(r => !isReactionDiscovered(user, r));
            const hasResonance = undiscoveredCurrentTier.some(r =>
                r.reactants.some(reactant => selectedSubstanceIds.includes(getSubstanceId(reactant.substance)))
            );
            const failureHint = hasResonance
                ? "Reactor detected resonance — composition incomplete."
                : similarMatch
                    ? "These substances may need to be transformed first."
                    : undefined;

            user.energy -= BASE_EXPERIMENTAL_REACTION_COST;
            consumeOneOfEachSelectedSubstance(user, selectedSubstanceIds);
            addReactionLogEntry(user, {
                type: 'experiment',
                outcome: 'failure',
                substances: selectedSubstances.map(s => s.name),
                product: null,
                message: 'No stable reaction formed'
            });
            await user.save();
            updateSessionPersistedEnergyBaseForUser(user.username, user.energy);
            await user.populate(['inventory.substance', 'runTotals.substance']);
            return res.status(200).json({
                success: false,
                discovered: false,
                message: "No stable reaction formed",
                ...(failureHint && { hint: failureHint }),
                inventory: user.inventory,
                energy: user.energy
            });
        }

        // Undiscovered reactions take priority; within each group sort deterministically
        const sortByPriority = (a, b) =>
            a.unlockTier - b.unlockTier ||
            a.energyCost - b.energyCost ||
            a.reactionKey.localeCompare(b.reactionKey);

        const undiscoveredMatches = matchingReactions.filter(r => !isReactionDiscovered(user, r)).sort(sortByPriority);
        const discoveredMatches   = matchingReactions.filter(r =>  isReactionDiscovered(user, r)).sort(sortByPriority);

        for (const candidate of [...undiscoveredMatches, ...discoveredMatches]) {
            const result = await startQueueSynthesis(user, candidate, {
                energyCost: BASE_EXPERIMENTAL_REACTION_COST,
                source: 'experiment'
            });

            if (!result.ok) {
                // Insufficient quantity for this candidate — try the next one
                if (result.error === 'Missing required reactants') continue;
                // Any other error (queue full, energy, missing capabilities) is a hard stop
                const errBody = { error: result.error };
                if (result.missingConditions) errBody.missingConditions = result.missingConditions;
                return res.status(result.status).json(errBody);
            }

            await user.populate(['inventory.substance', 'runTotals.substance']);

            if (result.completed) {
                return res.status(200).json({
                    success:        true,
                    queued:         false,
                    completed:      true,
                    discovered:     result.wasDiscovery,
                    reactionKey:    result.reactionKey,
                    prevUnlockTier: result.prevUnlockTier,
                    newUnlockTier:  result.newUnlockTier,
                    inventory:      user.inventory,
                    energy:         user.energy
                });
            }

            // Timed synthesis queued — product identity stripped if undiscovered
            return res.status(200).json({
                success:            true,
                queued:             true,
                completed:          false,
                discovered:         false,
                reactionKey:        result.reactionKey,
                expectedCompletion: result.expectedCompletion,
                revealOnCompletion: result.revealOnCompletion,
                entry:              result.entry,
                inventory:          user.inventory,
                energy:             user.energy
            });
        }

        return res.status(400).json({
            error: "Not enough quantity for the matched reaction",
            hint: "The reaction pattern is promising, but you lack enough material."
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to experiment" });
    }
});


// ── Canonical queue start route ───────────────────────────────────────────────
// Single entry point for direct (known) reaction synthesis.
// Experiment route calls startQueueSynthesis directly after matching.
router.post("/reactions/queue/:reactionKey", async (req, res) => {
    try {
        if (!req.query.user) {
            return res.status(400).json({ error: "Missing username" });
        }

        await flushPendingMongoEnergyForUser(req.query.user);

        let user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        // Resolve due entries before slot check — a just-finished reaction frees the slot
        try {
            const { user: fresh, completions, promotions } = await resolveAndPruneUserQueue(user);
            if (fresh) user = fresh;
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
            if (promotions.length > 0 && isUserConnected(user.username)) emitQueuePromotions(user.username, promotions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        const reaction = await Reaction.findOne({ reactionKey: req.params.reactionKey })
            .populate('reactants.substance')
            .populate('product.substance');
        if (!reaction) { return res.status(404).json({ error: "Reaction not found" }); }

        if (reaction.unlockTier > user.unlockTier) {
            return res.status(403).json({ error: "Reaction not yet unlocked" });
        }
        if (!reaction.isActive) {
            return res.status(400).json({ error: "Reaction is not active" });
        }

        const energyCost = calculateReactionCost(user, reaction.energyCost);
        const result = await startQueueSynthesis(user, reaction, { energyCost, source: 'perform' });

        if (!result.ok) {
            const errBody = { error: result.error };
            if (result.missingConditions) errBody.missingConditions = result.missingConditions;
            return res.status(result.status).json(errBody);
        }

        await user.populate(['inventory.substance', 'runTotals.substance']);

        if (result.completed) {
            return res.status(200).json({
                success:        true,
                queued:         false,
                completed:      true,
                reactionKey:    result.reactionKey,
                wasDiscovery:   result.wasDiscovery,
                prevUnlockTier: result.prevUnlockTier,
                newUnlockTier:  result.newUnlockTier,
                inventory:      user.inventory,
                energy:         user.energy
            });
        }

        return res.status(200).json({
            success:            true,
            queued:             true,
            completed:          false,
            reactionKey:        result.reactionKey,
            expectedCompletion: result.expectedCompletion,
            revealOnCompletion: result.revealOnCompletion,
            entry:              result.entry,
            energy:             user.energy
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to queue reaction" });
    }
});


module.exports = router;
