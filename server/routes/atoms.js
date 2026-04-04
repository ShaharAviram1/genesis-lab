const express = require('express');
const User = require('./../models/User');
const Substance = require('./../models/Substance');
const atomCost = require('./../config/atomCost');
const { calculateAtomCost } = require('./../utils/gameEconomy');

const router = express.Router();

router.post('/atoms/create', async (req, res) => { 
    try {
        if (!req.query.user) { return res.status(400).json({ error: "Missing username" }); }
        const user = await User.findOne({ username: req.query.user }).populate('inventory.substance').populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        if (!req.body.atom) { return res.status(400).json({ error: "Missing atom to create" }); }
        const atom = await Substance.findOne({ name: req.body.atom });
        if (!atom) { return res.status(404).json({ error: "Atom not found" }); }
        if (atom.type !== "element" || !atomCost[atom.name]) { return res.status(400).json({ error: "Trying to create non core element" }); }
        const cost = calculateAtomCost(user, atomCost[atom.name]);
        if (user.energy < cost) { return res.status(400).json({ error: "Not enough energy" }); }
        user.energy -= cost;
        const existing = user.inventory.find((inv) => inv.substance._id.toString() === atom._id.toString());
        if (existing) {
            existing.quantity += 1;
        } else {
            user.inventory.push({ substance: atom._id, quantity: 1 });
        }
        const hasExisted = user.runTotals.find((inv) => inv.substance._id.toString() === atom._id.toString());
        if (hasExisted) {
            hasExisted.produced += 1;
        } else {
            user.runTotals.push({ substance: atom._id, produced: 1 });
        }
        await user.save();
        await user.populate(['inventory.substance', 'runTotals.substance']);
        return res.status(200).json({ success: true, energy: user.energy, inventory: user.inventory });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed creating atoms" });
    }
});

router.get("/atoms/:username", async (req, res) => { 
    try {
        if (!req.params.username) { return res.status(400).json({ error: "Missing username" }); }
        const user = await User.findOne({ username: req.params.username });
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        return res.status(200).json(Object.entries(atomCost).map(([name, energy])=>({name, energyCost: calculateAtomCost(user, energy)})));
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed getting atoms list" });
    }
});

module.exports = router;