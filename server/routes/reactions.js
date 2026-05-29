const express = require('express');
const Reaction = require('./../models/Reaction');
const User = require('../models/User');
const checkReactionEligibility = require('../utils/checkReactionEligibility');
const Substance = require('../models/Substance');
const { calculateReactionCost } = require('./../utils/gameEconomy');
const { flushPendingMongoEnergyForUser, updateSessionPersistedEnergyBaseForUser, emitToUser, emitQueueCompletions, isUserConnected } = require('./../realtime/reactorRuntime');
const completeReaction = require('../utils/completeReaction');
const { resolveQueue, resolveAndPruneUserQueue, addPendingNotifications } = require('../utils/resolveQueue');

const router = express.Router();

const BASE_EXPERIMENTAL_REACTION_COST = 20;

function isReactionDiscovered(user, reaction) {
    const productId = reaction.product.substance._id.toString();
    return reaction.discoveredByDefault || user.runTotals.some(rt => {
        const runTotalSubstanceId = (rt.substance._id || rt.substance).toString();
        return runTotalSubstanceId === productId;
    });
}

function getReactionHint(reaction) {
    const { reactants, product } = reaction;
    const count = reactants.length;
    const cats = reactants.map(r => r.substance.category);
    const catSet = new Set(cats);
    const types = reactants.map(r => r.substance.type);
    const productCat = product.substance.category;

    if (types.includes('material'))
        return "Requires a material already produced.";
    if (catSet.has('acid'))
        return "A reactive chemical agent is required.";
    if (productCat === 'alloy')
        return "Two metals may combine into a stronger structure.";
    if (catSet.has('alloy'))
        return "One input is an alloy.";
    if (catSet.has('metalloid'))
        return "Involves a semiconductor-class substance.";
    if (cats.filter(c => c === 'metal').length >= 2)
        return "Multiple metals are involved.";
    if (catSet.has('metal') && catSet.has('gas'))
        return "A metal element reacts with a gas.";
    if (catSet.has('metal'))
        return "Involves a metal.";
    if (count >= 3 && cats.every(c => c === 'mineral'))
        return "Multiple mineral compounds fused together.";
    if (catSet.has('mineral') && catSet.has('gas'))
        return "A gas interacts with a mineral compound.";
    if (catSet.has('mineral') && catSet.has('liquid'))
        return "A mineral dissolved in a liquid medium.";
    if (catSet.has('mineral'))
        return "A mineral compound plays a role.";
    if (cats.every(c => c === 'gas'))
        return "All inputs are in gas form.";
    if (catSet.has('gas') && catSet.has('liquid'))
        return "Combines gaseous and liquid inputs.";
    if (catSet.has('gas'))
        return "Works with gas-state substances.";
    if (catSet.has('liquid'))
        return "Involves a liquid input.";
    return "Direct elemental synthesis.";
}

function buildMaskedReaction(reaction) {
    return {
        _id: reaction._id,
        reactionKey: reaction.reactionKey,
        name: "Unknown Synthesis",
        unknown: true,
        unlockTier: reaction.unlockTier,
        generationTier: reaction.generationTier,
        reactantCount: reaction.reactants.length,
        hint: reaction.hintText || getReactionHint(reaction),
        reactants: [],
        product: {
            substance: { name: "???", symbol: "?" },
            quantity: "?"
        },
        energyCost: null
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
    const MAX_SLOTS = 1;
    const processingCount = user.activeQueue.filter(e => e.status === 'processing').length;
    if (processingCount >= MAX_SLOTS) {
        return { ok: false, status: 400, error: 'Reactor is occupied' };
    }

    // Discovery state must be read from the populated mongoose doc before toObject()
    const revealOnCompletion = !isReactionDiscovered(user, reaction);
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
    const queueEntry = {
        reactionKey:        reactionObj.reactionKey,
        slot:               0,
        startTime:          now,
        expectedCompletion: new Date(now.getTime() + reactionObj.reactionTime * 1000),
        status:             'processing',
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
            reactants: reactionObj.reactants.map(r => ({
                substanceKey: r.substance.substanceKey,
                name:         r.substance.name,
                quantity:     r.quantity
            }))
        }
    };

    user.activeQueue.push(queueEntry);
    await user.save();
    updateSessionPersistedEnergyBaseForUser(user.username, user.energy);

    emitToUser(user.username, 'synthesis_queued', {
        reactionKey:        reactionObj.reactionKey,
        slot:               0,
        startTime:          queueEntry.startTime,
        expectedCompletion: queueEntry.expectedCompletion,
        revealOnCompletion,
        ...(revealOnCompletion ? {} : { reactionName: reactionObj.name })
    });

    // Zero-duration synthesis: complete within the same request via the full queue lifecycle
    if (reactionObj.reactionTime === 0) {
        const completions = await resolveQueue(user);
        const connected = isUserConnected(user.username);
        if (completions.length > 0 && !connected) addPendingNotifications(user, completions);
        await user.save();
        updateSessionPersistedEnergyBaseForUser(user.username, user.energy);
        if (completions.length > 0 && connected) emitQueueCompletions(user.username, completions);
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

    // Timed synthesis: entry persists; client shows countdown
    return {
        ok:                 true,
        queued:             true,
        completed:          false,
        reactionKey:        reactionObj.reactionKey,
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
        const user = await User.findOne({ username: req.query.user });
        if (!user) { return res.status(404).json({ error: "user not found" }); }

        try {
            const { completions, userModified } = await resolveAndPruneUserQueue(user);
            if (completions.length > 0 && !isUserConnected(user.username)) addPendingNotifications(user, completions);
            if (userModified) await user.save();
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        const reactions = await Reaction.find({ unlockTier: { $lte: user.unlockTier } })
            .populate('reactants.substance')
            .populate('product.substance');
        const objReactions = reactions.map(reaction => {
            const discovered = isReactionDiscovered(user, reaction);
            if (!discovered) {
                return buildMaskedReaction(reaction);
            }
            const reactionObj = reaction.toObject();
            reactionObj.energyCost = calculateReactionCost(user, reaction.energyCost);
            reactionObj.unknown = false;
            return reactionObj;
        });
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
        const user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        try {
            const { completions, userModified } = await resolveAndPruneUserQueue(user);
            if (completions.length > 0 && !isUserConnected(user.username)) addPendingNotifications(user, completions);
            if (userModified) await user.save();
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        if (!isReactionDiscovered(user, reaction)) {
            return res.status(200).json({ reaction: buildMaskedReaction(reaction), canPerform: false });
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
        const user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        try {
            const { completions, userModified } = await resolveAndPruneUserQueue(user);
            if (completions.length > 0 && !isUserConnected(user.username)) addPendingNotifications(user, completions);
            if (userModified) await user.save();
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
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
        const user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        try {
            const { completions, userModified } = await resolveAndPruneUserQueue(user);
            if (completions.length > 0 && !isUserConnected(user.username)) addPendingNotifications(user, completions);
            if (userModified) await user.save();
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
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
                // Any other error (reactor occupied, energy) is a hard stop
                return res.status(result.status).json({ error: result.error });
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

        const user = await User.findOne({ username: req.query.user })
            .populate('inventory.substance')
            .populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        // Resolve due entries before slot check — a just-finished reaction frees the slot
        try {
            const { completions, userModified } = await resolveAndPruneUserQueue(user);
            if (completions.length > 0 && !isUserConnected(user.username)) addPendingNotifications(user, completions);
            if (userModified) await user.save();
            if (completions.length > 0 && isUserConnected(user.username)) emitQueueCompletions(user.username, completions);
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
            return res.status(result.status).json({ error: result.error });
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
