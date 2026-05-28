const express = require('express');
const Reaction = require('./../models/Reaction');
const User = require('../models/User');
const checkReactionEligibility = require('../utils/checkReactionEligibility');
const Substance = require('../models/Substance');
const { calculateReactionCost } = require('./../utils/gameEconomy');
const { flushPendingMongoEnergyForUser, updateSessionPersistedEnergyBaseForUser } = require('./../realtime/reactorRuntime');

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

function performReaction(user, reaction, energyCost) {
    reaction.reactants.forEach(({substance, quantity}) => {
        const inventoryItem = user.inventory.find((inv) => getSubstanceId(inv.substance) === getSubstanceId(substance));
        if (inventoryItem) {
            inventoryItem.quantity -= quantity;
        }
    });
    user.energy -= energyCost;
    const { substance, quantity } = reaction.product;
    const existing = user.inventory.find((inv) => getSubstanceId(inv.substance) === getSubstanceId(substance));
    if (existing) {
        existing.quantity += quantity;
    } else {
        user.inventory.push({ substance: substance._id, quantity });
    }

    const hasExisted = user.runTotals.find((inv) => getSubstanceId(inv.substance) === getSubstanceId(substance));
    const discovered = !hasExisted;

    if (hasExisted) {
        hasExisted.produced += quantity;
    } else {
        user.runTotals.push({ substance: substance._id, produced: quantity });
        if (substance.unlocksUserTier && substance.unlocksUserTier > user.unlockTier) {
            user.unlockTier = substance.unlocksUserTier;
        }
    }
    user.inventory = user.inventory.filter(item => item.quantity > 0);
    return discovered;
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
        reaction = reaction.toObject();
        reaction.energyCost = calculateReactionCost(user, reaction.energyCost);
        const canPerform = checkReactionEligibility(user, reaction);
        if (canPerform) {
            const discovered = performReaction(user, reaction, reaction.energyCost);
            const productName = reaction.product.substance.name;
            addReactionLogEntry(user, {
                type: 'perform',
                outcome: discovered ? 'discovery' : 'success',
                substances: reaction.reactants.map(r => r.substance.name),
                product: productName,
                message: discovered ? `Discovered ${productName}` : `Created ${productName}`
            });
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
            if (!hasRequiredReactants(user, candidate.reactants)) continue;
            const wasDiscovered = performReaction(user, candidate, BASE_EXPERIMENTAL_REACTION_COST);
            const expProductName = candidate.product.substance.name;
            addReactionLogEntry(user, {
                type: 'experiment',
                outcome: wasDiscovered ? 'discovery' : 'success',
                substances: candidate.reactants.map(r => r.substance.name),
                product: expProductName,
                message: wasDiscovered ? `Discovered ${expProductName}` : `Experiment created ${expProductName}`
            });
            await user.save();
            updateSessionPersistedEnergyBaseForUser(user.username, user.energy);
            await user.populate(['inventory.substance', 'runTotals.substance']);
            return res.status(200).json({
                success: true,
                discovered: wasDiscovered,
                inventory: user.inventory,
                energy: user.energy,
                reactionKey: candidate.reactionKey,
                reaction: candidate
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


module.exports = router;
