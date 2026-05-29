// Capability registry for the conditions system (Phase F).
//
// Each entry ties a condition key to its display metadata and unlock source.
// Adding a new condition requires one entry here and zero new code.
//
// Unlock types:
//   'substance'  — granted the first time a specific substance is produced.
//   'unlockTier' — granted when user.unlockTier reaches or passes the gate tier.

const CONDITION_REGISTRY = [
    {
        key:              'high_pressure',
        displayName:      'High Pressure',
        shortDescription: 'Enables reactions requiring forced compression of reactants.',
        unlock:           { type: 'substance', substanceKey: 'ammonia' },
        generationHint:   2
    },
    {
        key:              'catalyst',
        displayName:      'Catalyst',
        shortDescription: 'Enables reactions that require a catalytic medium to proceed.',
        unlock:           { type: 'substance', substanceKey: 'nitric_acid' },
        generationHint:   2
    },
    {
        key:              'high_temperature',
        displayName:      'High Temperature',
        shortDescription: 'Enables sustained high-heat synthesis beyond standard thermal range.',
        unlock:           { type: 'substance', substanceKey: 'steel' },
        generationHint:   3
    },
    {
        key:              'vacuum',
        displayName:      'Vacuum',
        shortDescription: 'Enables reactions that require a vacuum or near-vacuum environment.',
        unlock:           { type: 'substance', substanceKey: 'graphene' },
        generationHint:   3
    },
    {
        key:              'radiation_bombardment',
        displayName:      'Radiation Bombardment',
        shortDescription: 'Enables reactions requiring directed particle or ion bombardment.',
        unlock:           { type: 'substance', substanceKey: 'doped_silicon' },
        generationHint:   3
    },
    {
        key:              'extreme_pressure',
        displayName:      'Extreme Pressure',
        shortDescription: 'Enables reactions requiring pressures beyond conventional compression.',
        unlock:           { type: 'unlockTier', tier: 7 },
        generationHint:   4
    },
    {
        key:              'extreme_temperature',
        displayName:      'Extreme Temperature',
        shortDescription: 'Enables reactions at the boundary between thermal and plasma-state conditions.',
        unlock:           { type: 'unlockTier', tier: 8 },
        generationHint:   4
    },
    {
        key:              'plasma_state',
        displayName:      'Plasma State',
        shortDescription: 'Enables plasma-phase reactions. Required for all Gen 4 synthesis.',
        unlock:           { type: 'unlockTier', tier: 9 },
        generationHint:   4
    },
    {
        key:              'extreme_cold',
        displayName:      'Extreme Cold',
        shortDescription: 'Enables cryogenic synthesis and low-temperature phase reactions.',
        unlock:           { type: 'unlockTier', tier: 9 },
        generationHint:   4
    }
];

module.exports = CONDITION_REGISTRY;
