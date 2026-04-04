const express = require('express');
const User = require('./../models/User');
const Substance = require('./../models/Substance');
const calculateGenesisShards = require('./../utils/calculateGenesisShards');
const { calculateEnergyGain } = require('./../utils/gameEconomy');

const router = express.Router();

router.get("/users/:username", async (req, res) => { 
    try {
        const user = await User.findOne({ username: req.params.username }).populate('inventory.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        return res.status(200).json({
            username: user.username,
            inventory: user.inventory,
            energy: user.energy,
            unlockTier: user.unlockTier,
            bigBangCount: user.bigBangCount,
            genesisShards: user.genesisShards,
            prestigeUpgrades: user.prestigeUpgrades
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

router.post("/bigbang", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.query.user }).populate('inventory.substance').populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        if (user.bigBangCount !== 0) {
            if (user.unlockTier < 3)
                return res.status(400).json({ error: "Unlock tier too low" });
            if (user.energy < 1000)
                return res.status(400).json({ error: "Not enough energy" });
        }
        user.genesisShards += calculateGenesisShards(user.runTotals);
        user.inventory = [];
        user.energy = 0;
        user.unlockTier = 1;
        user.bigBangCount += 1;
        user.runTotals = [];
        await user.save();
        return res.status(200).json({ success: true, username: user.username, bigBangCount: user.bigBangCount });
    } 
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Big Bang failed" });
    }
});

router.post("/generate-energy", async (req, res) => { 
    try {
        const user = await User.findOne({ username: req.query.user });
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        user.energy += calculateEnergyGain(user);
        await user.save();
        return res.status(200).json({ energy: user.energy, success: true });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to generate energy" });
    }
});

router.post("/prestige/upgrade/:username", async (req, res) => {
    try {
        if (!req.params.username) { return res.status(400).json({ error: "Missing username" }); }
        const user = await User.findOne({ username: req.params.username });
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        if (!req.body.upgrade) { return res.status(400).json({ error: "Missing chosen upgrade" }); }
        if (!(req.body.upgrade in user.prestigeUpgrades)) { return res.status(400).json({ error: "Wrong upgrade path" }); }
        const cost = (user.prestigeUpgrades[req.body.upgrade] + 1) * 2;
        if (user.genesisShards < cost) { return res.status(400).json({ error: "Not enough genesisShards" }); }
        user.genesisShards -= cost;
        user.prestigeUpgrades[req.body.upgrade] += 1;
        await user.save();
        return res.status(200).json({ success: true, upgrades: user.prestigeUpgrades, genesisShards: user.genesisShards });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to prestige upgrade" });
    }
});


module.exports = router;