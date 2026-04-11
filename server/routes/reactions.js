const express = require('express');
const Reaction = require('./../models/Reaction');
const User = require('../models/User');
const checkReactionEligibility = require('../utils/checkReactionEligibility');
const Substance = require('../models/Substance');
const { calculateReactionCost } = require('./../utils/gameEconomy');

const unlockTierSubstances = {
    "Water": 2,
    "Fuel": 3,
    "Organic Matter": 4,
    "Complex Hydrocarbon": 5
};

const router = express.Router();

router.get("/reactions", async (req, res) => {
    try {
        const reactions = await Reaction.find().populate('reactants.substance').populate('product.substance').populate('byproducts.substance');
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
        const reactions = await Reaction.find({ unlockTier: { $lte: user.unlockTier } }).populate('reactants.substance').populate('product.substance').populate('byproducts.substance');
        const objReactions = reactions.map(reaction => {
            const reactionObj = reaction.toObject();
            reactionObj.energyCost= calculateReactionCost(user, reaction.energyCost);
            return reactionObj;
        });
        return res.status(200).json(objReactions);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch reactions" });
    }
});


router.get("/reactions/:reactionID", async (req, res) => { 
    try {
        const reaction = await Reaction.findOne({ reactionID: req.params.reactionID }).populate('reactants.substance').populate('product.substance').populate('byproducts.substance');
        if (!reaction) { 
            return res.status(404).json({ error: "Reaction not found" }); 
        }

        if (!req.query.user) { 
            return res.status(400).json({ error: "Missing username" }); 
        }

        const user = await User.findOne({ username: req.query.user }).populate('inventory.substance');
        if (!user) { 
            return res.status(404).json({ error: "User not found" }); 
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

router.post("/perform/:reactionID", async (req, res) => {
    try {
        let reaction = await Reaction.findOne({ reactionID: req.params.reactionID }).populate('reactants.substance').populate('product.substance').populate('byproducts.substance');
        if (!reaction) { return res.status(404).json({ error: "Reaction not found" }); }
        if (!req.query.user) {
            return res.status(400).json({ error: "missing username" });
        }
        const user = await User.findOne({ username: req.query.user }).populate('inventory.substance').populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        reaction = reaction.toObject();
        reaction.energyCost = calculateReactionCost(user, reaction.energyCost);
        const canPerform = checkReactionEligibility(user, reaction);
        if (canPerform) {
            reaction.reactants.forEach(({substance, quantity}) => {
                const inventoryItem = user.inventory.find((inv) => inv.substance._id.toString() === substance._id.toString());
                if (inventoryItem) {
                    inventoryItem.quantity -= quantity;
                }
            });
            user.energy -= reaction.energyCost;
            const { substance, quantity } = reaction.product;
            const existing = user.inventory.find((inv) => inv.substance._id.toString() === substance._id.toString());
            if (existing) {
                existing.quantity += quantity;
            } else {
                user.inventory.push({ substance: substance._id, quantity });
            }
            const hasExisted = user.runTotals.find((inv) => inv.substance._id.toString() === substance._id.toString());
            if (hasExisted) {
                hasExisted.produced += quantity;
            } else {
                user.runTotals.push({ substance: substance._id, produced: quantity });
                if (unlockTierSubstances[substance.name] && unlockTierSubstances[substance.name] > user.unlockTier) {
                    user.unlockTier = unlockTierSubstances[substance.name];
                }
            }
            user.inventory = user.inventory.filter(item => item.quantity > 0);
            await user.save();
            await user.populate(['inventory.substance','runTotals.substance']);
            return res.status(200).json({ success: true, inventory: user.inventory });
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

module.exports = router;