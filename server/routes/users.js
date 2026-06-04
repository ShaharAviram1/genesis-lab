const express = require('express');
const User = require('./../models/User');
const Substance = require('./../models/Substance');
const calculateGenesisShards = require('./../utils/calculateGenesisShards');
const { calculateEnergyGain, getEnergyMultiplier} = require('./../utils/gameEconomy');
const { updateSessionEnergyMultiplierForUser, flushPendingMongoEnergyForUser, updateSessionPersistedEnergyBaseForUser, zeroSessionEnergyForUser, emitQueueCompletions, emitQueuePromotions, isUserConnected } = require('./../realtime/reactorRuntime');
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
        let user = await User.findOne({ username: req.params.username }).populate('inventory.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }

        try {
            const { user: fresh, completions, promotions } = await resolveAndPruneUserQueue(user);
            if (fresh) user = fresh;
            if (completions.length > 0 && isUserConnected(user.username)) {
                emitQueueCompletions(user.username, completions);
            }
            if (promotions.length > 0 && isUserConnected(user.username)) {
                emitQueuePromotions(user.username, promotions);
            }
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

        const existing = user.blueprints.find(b => b.blueprintKey === blueprintKey);
        const isLeveled = typeof moduleConfig.maxLevel === 'number' && Array.isArray(moduleConfig.levelCosts);
        const currentLevel = existing?.level ?? 0;

        // Resolve next-purchase cost: leveled → levelCosts[currentLevel]; binary → blueprintCost.
        let cost;
        try {
            if (isLeveled) {
                if (currentLevel >= moduleConfig.maxLevel) {
                    return res.status(400).json({ error: "Already at maximum level" });
                }
                cost = requireConfigured(moduleConfig.levelCosts[currentLevel], `${blueprintKey}.levelCosts[${currentLevel}]`);
            } else {
                if (existing) {
                    return res.status(400).json({ error: "Blueprint already owned" });
                }
                cost = requireConfigured(moduleConfig.blueprintCost, `${blueprintKey}.blueprintCost`);
            }
        } catch (configErr) {
            return res.status(configErr.statusCode || 503).json({ error: configErr.message });
        }

        if (user.genesisShards < cost) {
            return res.status(400).json({ error: "Not enough Genesis Shards" });
        }
        if (moduleConfig.requires) {
            const owned = user.blueprints.some(b => b.blueprintKey === moduleConfig.requires);
            if (!owned) {
                const prereq = PRESTIGE_CONFIG.modules[moduleConfig.requires];
                const prereqName = prereq ? prereq.name : moduleConfig.requires;
                return res.status(400).json({ error: `Requires ${prereqName}` });
            }
        }

        user.genesisShards -= cost;
        if (existing) {
            existing.level += 1;
        } else {
            user.blueprints.push({ blueprintKey, level: 1 });
        }
        await user.save();

        return res.status(200).json({
            blueprintKey,
            level: existing ? existing.level : 1,
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