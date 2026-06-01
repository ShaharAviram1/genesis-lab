const express = require('express');
const User = require('./../models/User');
const Substance = require('./../models/Substance');
const calculateGenesisShards = require('./../utils/calculateGenesisShards');
const { calculateEnergyGain, getEnergyMultiplier} = require('./../utils/gameEconomy');
const { updateSessionEnergyMultiplierForUser, flushPendingMongoEnergyForUser, updateSessionPersistedEnergyBaseForUser, zeroSessionEnergyForUser, emitQueueCompletions, isUserConnected } = require('./../realtime/reactorRuntime');
const { resolveAndPruneUserQueue, addPendingNotifications } = require('./../utils/resolveQueue');
const PRESTIGE_CONFIG = require('./../config/prestigeConfig');

function requireConfigured(value, label) {
    if (value === null || value === undefined) {
        throw Object.assign(
            new Error(`config: '${label}' is not yet configured`),
            { statusCode: 503 }
        );
    }
    return value;
}

const router = express.Router();

router.get("/users/:username", async (req, res) => {
    try {
        await flushPendingMongoEnergyForUser(req.params.username);
        const user = await User.findOne({ username: req.params.username }).populate('inventory.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        try {
            const { completions, userModified } = await resolveAndPruneUserQueue(user);
            const connected = isUserConnected(user.username);
            if (completions.length > 0 && !connected) addPendingNotifications(user, completions);
            if (userModified) {
                await user.save();
                if (completions.length > 0) await user.populate('inventory.substance');
            }
            if (completions.length > 0 && connected) emitQueueCompletions(user.username, completions);
        } catch (queueErr) {
            console.error('Queue resolution error for user', user.username, ':', queueErr);
        }

        return res.status(200).json({
            username: user.username,
            inventory: user.inventory,
            energy: user.energy,
            unlockTier: user.unlockTier,
            bigBangCount: user.bigBangCount,
            genesisShards: user.genesisShards,
            prestigeUpgrades: user.prestigeUpgrades,
            reactionLog: user.reactionLog || [],
            reactorCapabilities: user.reactorCapabilities || [],
            blueprints: user.blueprints || [],
            generators: user.generators || []
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
        await flushPendingMongoEnergyForUser(user.username);
        user.genesisShards += calculateGenesisShards(user.runTotals, user.unlockTier);
        user.inventory           = [];
        user.energy              = 0;
        user.unlockTier          = 1;
        user.bigBangCount       += 1;
        user.runTotals           = [];
        user.reactorCapabilities = [];
        user.activeQueue         = [];  // clear in-flight queue entries
        user.generators          = [];  // automation modules reset per-run
        // user.blueprints intentionally preserved — survive Big Bang
        // user.prestigeUpgrades intentionally preserved — legacy data, read-only
        await user.save();
        updateSessionEnergyMultiplierForUser(user.username, getEnergyMultiplier(user));
        zeroSessionEnergyForUser(user.username);
        return res.status(200).json({ success: true, username: user.username, bigBangCount: user.bigBangCount });
    } 
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Big Bang failed" });
    }
});

router.get("/genesis-shards/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate('runTotals.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        const shards = calculateGenesisShards(user.runTotals, user.unlockTier);
        return res.status(200).json({ genesisShards: shards });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to calculate genesis shards" });
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
    return res.status(410).json({ error: 'Prestige multiplier upgrades are no longer available.' });
});

router.post("/users/:username/blueprints/:blueprintKey", async (req, res) => {
    try {
        const { username, blueprintKey } = req.params;
        const moduleConfig = PRESTIGE_CONFIG.modules[blueprintKey];
        if (!moduleConfig) {
            return res.status(400).json({ error: `Unknown blueprint: '${blueprintKey}'` });
        }

        const user = await User.findOne({ username });
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        let cost;
        try {
            cost = requireConfigured(moduleConfig.blueprintCost, `${blueprintKey}.blueprintCost`);
        } catch (configErr) {
            return res.status(configErr.statusCode || 503).json({ error: configErr.message });
        }

        if (user.genesisShards < cost) {
            return res.status(400).json({ error: "Not enough Genesis Shards" });
        }
        if (user.blueprints.some(b => b.blueprintKey === blueprintKey)) {
            return res.status(400).json({ error: "Blueprint already owned" });
        }

        user.genesisShards -= cost;
        user.blueprints.push({ blueprintKey });
        await user.save();

        return res.status(200).json({
            blueprintKey,
            genesisShards: user.genesisShards,
            blueprints: user.blueprints
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to purchase blueprint" });
    }
});


module.exports = router;