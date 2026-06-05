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

        const inFlight = (user.activeQueue || []).filter(e => e.status === 'processing' || e.status === 'resolving' || e.status === 'queued');
        if (inFlight.length > 0 && req.query.force !== 'true') {
            return res.status(409).json({
                requiresConfirmation: true,
                activeEntries: inFlight.length,
            });
        }

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


// Construct an automation module during a run.
// Requires owning the blueprint (permanent), spending construction energy, and
// consuming the specified substances from inventory (per-run cost).
// One module per blueprintKey per run; resets on Big Bang alongside user.generators.
router.post("/users/:username/generators/:moduleKey", async (req, res) => {
    try {
        const { username, moduleKey } = req.params;
        const moduleCfg = PRESTIGE_CONFIG.modules[moduleKey];
        if (!moduleCfg || moduleCfg.category !== 'atom_automation') {
            return res.status(400).json({ error: 'Unknown automation module' });
        }

        await flushPendingMongoEnergyForUser(username);
        const user = await User.findOne({ username }).populate('inventory.substance');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const hasBlueprint = user.blueprints.some(b => b.blueprintKey === moduleKey);
        if (!hasBlueprint) {
            return res.status(400).json({ error: 'Blueprint not owned' });
        }

        const alreadyBuilt = user.generators.some(g => g.moduleKey === moduleKey);
        if (alreadyBuilt) {
            return res.status(400).json({ error: 'Module already constructed this run' });
        }

        const energyCost = moduleCfg.constructionEnergyCost ?? 0;
        if (user.energy < energyCost) {
            return res.status(400).json({ error: `Insufficient energy (need ${energyCost})` });
        }

        const materialCosts = moduleCfg.constructionMaterialCost ?? [];
        for (const { substanceKey, quantity } of materialCosts) {
            const slot = user.inventory.find(i => i.substance?.substanceKey === substanceKey);
            const have = slot?.quantity ?? 0;
            if (have < quantity) {
                return res.status(400).json({ error: `Insufficient ${substanceKey} (have ${have}, need ${quantity})` });
            }
        }

        // Deduct materials
        for (const { substanceKey, quantity } of materialCosts) {
            const slot = user.inventory.find(i => i.substance?.substanceKey === substanceKey);
            slot.quantity -= quantity;
        }
        user.inventory = user.inventory.filter(i => i.quantity > 0);

        const now = new Date();
        user.energy -= energyCost;
        user.generators.push({ moduleKey, constructedAt: now, lastTickAt: now });
        await user.save();
        updateSessionPersistedEnergyBaseForUser(username, user.energy);

        // Re-populate so response includes hydrated substance objects
        await user.populate('inventory.substance');

        return res.status(200).json({
            success: true,
            generators: user.generators,
            energy: user.energy,
            inventory: user.inventory,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to construct module' });
    }
});

// Upgrade a constructed automation module to the next level during a run.
// Costs energy + substances; no Genesis Shards. Level resets on Big Bang.
router.post("/users/:username/generators/:moduleKey/upgrade", async (req, res) => {
    try {
        const { username, moduleKey } = req.params;
        const moduleCfg = PRESTIGE_CONFIG.modules[moduleKey];
        if (!moduleCfg || moduleCfg.category !== 'atom_automation') {
            return res.status(400).json({ error: 'Unknown automation module' });
        }

        await flushPendingMongoEnergyForUser(username);
        const user = await User.findOne({ username }).populate('inventory.substance');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const gen = user.generators.find(g => g.moduleKey === moduleKey);
        if (!gen) {
            return res.status(400).json({ error: 'Module not constructed' });
        }

        const maxLevel = (moduleCfg.upgradeCosts?.length ?? 0) + 1;
        if (gen.level >= maxLevel) {
            return res.status(400).json({ error: 'Module already at max level' });
        }

        // upgradeCosts[i] = cost to go from level i+1 → i+2
        const upgradeCost = moduleCfg.upgradeCosts[gen.level - 1];
        if (!upgradeCost) {
            return res.status(500).json({ error: 'Upgrade cost not configured' });
        }

        const energyCost = upgradeCost.energyCost ?? 0;
        if (user.energy < energyCost) {
            return res.status(400).json({ error: `Insufficient energy (need ${energyCost})` });
        }

        for (const { substanceKey, quantity } of (upgradeCost.materialCost ?? [])) {
            const slot = user.inventory.find(i => i.substance?.substanceKey === substanceKey);
            const have = slot?.quantity ?? 0;
            if (have < quantity) {
                return res.status(400).json({ error: `Insufficient ${substanceKey} (have ${have}, need ${quantity})` });
            }
        }

        for (const { substanceKey, quantity } of (upgradeCost.materialCost ?? [])) {
            const slot = user.inventory.find(i => i.substance?.substanceKey === substanceKey);
            slot.quantity -= quantity;
        }
        user.inventory = user.inventory.filter(i => i.quantity > 0);

        user.energy -= energyCost;
        gen.level += 1;
        await user.save();
        updateSessionPersistedEnergyBaseForUser(username, user.energy);

        await user.populate('inventory.substance');

        return res.status(200).json({
            success: true,
            generators: user.generators,
            energy: user.energy,
            inventory: user.inventory,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to upgrade module' });
    }
});

module.exports = router;