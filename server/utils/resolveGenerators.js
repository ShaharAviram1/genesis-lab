const Substance = require('../models/Substance');
const PRESTIGE_CONFIG = require('../config/prestigeConfig');
const { AUTOMATION_CONFIG, getGeneratorStats } = require('../config/prestigeConfig');

// Resolves passive production for all constructed automation modules.
//
// For each generator in user.generators:
//   - Computes elapsed hours since lastTickAt (capped at AUTOMATION_CONFIG.maxOfflineHours)
//   - Skips if less than minTickIntervalSec has passed (prevents micro-ticks on burst requests)
//   - Floors production to whole units per substance
//   - Applies productionCap: if current inventory >= cap, that substance is skipped
//   - Adds produced quantity to user.inventory (in-memory)
//   - Advances generator.lastTickAt to now
//
// Returns array of { substanceKey, substanceName, quantity } for each substance produced.
// Returns [] when no generators are constructed (fast path).
//
// Caller is responsible for saving user after this returns.
async function resolveGenerators(user) {
    if (!user.generators || user.generators.length === 0) return [];

    const now = new Date();
    const maxElapsedHours = AUTOMATION_CONFIG.maxOfflineHours;
    const minTickIntervalMs = AUTOMATION_CONFIG.minTickIntervalSec * 1000;

    // Collect all substance keys needed across active generators
    const neededKeys = new Set();
    for (const gen of user.generators) {
        const cfg = PRESTIGE_CONFIG.modules[gen.moduleKey];
        if (cfg?.produces) cfg.produces.forEach(k => neededKeys.add(k));
    }
    if (neededKeys.size === 0) return [];

    const substances = await Substance.find({ substanceKey: { $in: [...neededKeys] } });
    const substanceByKey = new Map(substances.map(s => [s.substanceKey, s]));

    const produced = [];

    for (const gen of user.generators) {
        const moduleCfg = PRESTIGE_CONFIG.modules[gen.moduleKey];
        if (!moduleCfg?.produces || !moduleCfg.productionRatePerHour) continue;

        const tickFrom = gen.lastTickAt
            ? new Date(gen.lastTickAt)
            : new Date(gen.constructedAt);
        const elapsedMs = now.getTime() - tickFrom.getTime();
        if (elapsedMs < minTickIntervalMs) continue;

        const elapsedHours = Math.min(elapsedMs / (1000 * 60 * 60), maxElapsedHours);
        const { productionRatePerHour, productionCap } = getGeneratorStats(gen.moduleKey, gen.level || 1);
        const rawQuantity = Math.floor(elapsedHours * productionRatePerHour);
        if (rawQuantity <= 0) continue;

        for (const substanceKey of moduleCfg.produces) {
            const substance = substanceByKey.get(substanceKey);
            if (!substance) continue;

            const substanceIdStr = substance._id.toString();
            const cap = productionCap;

            const existing = user.inventory.find(i => {
                const id = i.substance?._id?.toString() || i.substance?.toString();
                return id === substanceIdStr;
            });

            const currentQty = existing ? existing.quantity : 0;
            if (currentQty >= cap) continue;

            const toAdd = Math.min(rawQuantity, cap - currentQty);
            if (toAdd <= 0) continue;

            if (existing) {
                existing.quantity += toAdd;
            } else {
                user.inventory.push({ substance: substance._id, quantity: toAdd });
            }
            produced.push({ substanceKey, substanceName: substance.name, quantity: toAdd });
        }

        gen.lastTickAt = now;
    }

    return produced;
}

module.exports = resolveGenerators;
