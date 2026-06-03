// Dev-only: create or upsert an "admin" test user with everything unlocked.
// NOT production code.
//
// Usage:
//   node server/dev-createAdminUser.js [username] [password]
//
// Defaults:
//   username = 'admin'
//   password = 'admin123'
//
// What you get:
//   - unlockTier 12 (top of the current content tree — past NFP)
//   - All reactor capabilities granted
//   - 9999 of every substance in inventory
//   - runTotals populated with every substance so every reaction is "discovered"
//   - 1,000,000 energy and 10,000 Genesis Shards
//   - All R1 blueprints owned at max level (2 capacity + 3 optimizers at L5)
//   - activeQueue empty, pendingNotifications empty (clean slate for offline tests)
//
// Re-running the script resets all of the above for the same username — useful
// for repeated test cycles.

require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Substance = require('./models/Substance');
const CONDITION_REGISTRY = require('./config/conditionRegistry');

const USERNAME = process.argv[2] || 'admin';
const PASSWORD = process.argv[3] || 'admin123';

const INVENTORY_QTY    = 9999;
const ENERGY_VALUE     = 1_000_000;
const SHARDS_VALUE     = 10_000;
const TARGET_UNLOCK_TIER = 12;

const R1_BLUEPRINTS = [
    { blueprintKey: 'expanded_reactor_bay',     level: 1 },   // binary
    { blueprintKey: 'triple_reactor_array',     level: 1 },   // binary
    { blueprintKey: 'foundry_optimizer',        level: 5 },   // max
    { blueprintKey: 'materials_lab_optimizer',  level: 5 },   // max
    { blueprintKey: 'fusion_chamber_optimizer', level: 5 }    // max
];

async function main() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI not set in server/.env — cannot connect.');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.\n');

    const substances = await Substance.find({});
    if (substances.length === 0) {
        console.error('No substances found. Run server/seeds/seedSubstances.js first.');
        process.exit(1);
    }

    const inventory  = substances.map(s => ({ substance: s._id, quantity: INVENTORY_QTY }));
    const runTotals  = substances.map(s => ({ substance: s._id, produced: 1 }));
    const capabilities = CONDITION_REGISTRY.map(c => c.key);
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    const fields = {
        passwordHash,
        unlockTier:           TARGET_UNLOCK_TIER,
        energy:               ENERGY_VALUE,
        genesisShards:        SHARDS_VALUE,
        bigBangCount:         0,
        inventory,
        runTotals,
        reactorCapabilities:  capabilities,
        blueprints:           R1_BLUEPRINTS,
        prestigeUpgrades:     { energy: 0, matter: 0, chemistry: 0 },
        activeQueue:          [],
        pendingNotifications: [],
        reactionLog:          [],
        generators:           [],
        lastActiveAt:         new Date()
    };

    const result = await User.updateOne(
        { username: USERNAME },
        { $set: fields, $setOnInsert: { username: USERNAME } },
        { upsert: true }
    );

    const verb = result.upsertedCount ? 'CREATED' : 'RESET';
    console.log(`${verb} test user '${USERNAME}'`);
    console.log(`  password:            ${PASSWORD}`);
    console.log(`  unlockTier:          ${TARGET_UNLOCK_TIER}`);
    console.log(`  energy:              ${ENERGY_VALUE.toLocaleString()}`);
    console.log(`  genesisShards:       ${SHARDS_VALUE.toLocaleString()}`);
    console.log(`  inventory:           ${substances.length} substances × ${INVENTORY_QTY}`);
    console.log(`  runTotals (discovered): ${substances.length} substances`);
    console.log(`  reactorCapabilities: ${capabilities.length} (${capabilities.join(', ')})`);
    console.log(`  blueprints:`);
    for (const bp of R1_BLUEPRINTS) console.log(`    - ${bp.blueprintKey} Lv${bp.level}`);
    console.log(`  activeQueue:          empty`);
    console.log(`  pendingNotifications: empty`);
    console.log('\nLog in via the standard auth flow with the username and password above.');
}

main()
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    })
    .finally(() => mongoose.disconnect());
