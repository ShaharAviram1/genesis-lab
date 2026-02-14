const express = require('express');
const Reaction = require('./../models/Reaction');
const User = require('../models/User');
const checkReactionEligibility = require('../utils/checkReactionEligibility');

const router = express.Router();

router.get("/reactions", async (req, res) => {
    try {
        const reactions = await Reaction.find().populate('reactants.element');
        res.json(reactions);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch reactions" });
    }
});

router.get("/reactions/:reactionID", async (req, res) => { 
    try {
        const reaction = await Reaction.findOne({ reactionID: req.params.reactionID }).populate('reactants.element');
        if (!reaction) { 
            return res.status(404).json({ error: "Reaction not found" }); 
        }

        if (!req.query.user) { 
            return res.status(400).json({ error: "Missing username" }); 
        }

        const user = await User.findOne({ username: req.query.user }).populate('inventory.element');
        if (!user) { 
            return res.status(404).json({ error: "User not found" }); 
        }

        const canPerform = checkReactionEligibility(user, reaction);
        return res.status(200).json({ reaction, canPerform });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to fetch reaction" });
    }
});

router.post("/perform/:reactionID", async (req, res) => {
    try {
        const reaction = await Reaction.findOne({ reactionID: req.params.reactionID }).populate('reactants.element').populate('product.element');
        if (!reaction) { return res.status(404).json({ error: "Reaction not found" }); }
        if (!req.query.user) {
            return res.status(400).json({ error: "missing username" });
        }
        const user = await User.findOne({ username: req.query.user }).populate('inventory.element');
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        const canPerform = checkReactionEligibility(user, reaction);
        if (canPerform) {
            reaction.reactants.forEach(({element, quantity}) => {
                const inventoryItem = user.inventory.find((inv) => inv.element._id.toString() === element._id.toString());
                if (inventoryItem) {
                    inventoryItem.quantity -= quantity;
                }
            });
            const { element, quantity } = reaction.product;
            const existing = user.inventory.find((inv) => inv.element._id.toString() === element._id.toString());
            if (existing) {
                existing.quantity += quantity;
            } else {
                user.inventory.push({ element: element._id, quantity });
            }
            await user.save();
            return res.status(200).json({ success: true, inventory: user.inventory });
        }
        else {
            return res.status(400).json({ error: "Not enough elements found to perform" });
        }
    } 
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to perform" });
    }
});

module.exports = router;