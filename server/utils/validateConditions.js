const CONDITION_REGISTRY = require('../config/conditionRegistry');

// Pure function — no DB access, no side effects.
// Returns { passed: Boolean, missing: [{ key, displayName }] }.
// Zero-condition reactions always pass immediately.
function validateConditions(reaction, user) {
    const conditions = reaction.conditions || [];
    if (conditions.length === 0) return { passed: true, missing: [] };

    const capabilities = user.reactorCapabilities || [];
    const missing = [];

    for (const key of conditions) {
        if (!capabilities.includes(key)) {
            const entry = CONDITION_REGISTRY.find(r => r.key === key);
            missing.push({ key, displayName: entry ? entry.displayName : key });
        }
    }

    return { passed: missing.length === 0, missing };
}

module.exports = validateConditions;
