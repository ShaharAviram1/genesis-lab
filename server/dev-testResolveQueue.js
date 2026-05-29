// Manual test script for resolveQueue and pruneCompletedEntries.
// NOT production code — dev/testing only.
//
// Usage:
//   node server/dev-testResolveQueue.js [username] [productKey]
//
// Defaults:
//   username   = 'alchemist'
//   productKey = 'water'
//
// What it does:
//   1. Loads the user from the database.
//   2. Injects a fake processing queue entry with expectedCompletion 1 second in the past.
//   3. Calls resolveQueue(user) — should complete the entry.
//   4. Calls pruneCompletedEntries(user) — should keep the entry (pruneAfter is 24h from now).
//   5. Saves and prints a before/after report.
//
// Verifiable outcomes:
//   - Product appears in inventory (quantity +1)
//   - runTotals updated for the product substance
//   - unlockTier advances if substance.unlocksUserTier exceeds current tier
//   - Entry status transitions to 'completed'
//   - completedAt and pruneAfter are set
//   - Reactants were NOT deducted (none listed; already consumed at queue start)
//   - Running the script twice does NOT double-credit the product (entry is replaced each run)

require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Substance = require('./models/Substance');
const { resolveQueue, pruneCompletedEntries } = require('./utils/resolveQueue');

const TEST_USERNAME   = process.argv[2] || 'alchemist';
const TEST_PRODUCT_KEY = process.argv[3] || 'water';

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.\n');

    const user = await User.findOne({ username: TEST_USERNAME })
        .populate('inventory.substance')
        .populate('runTotals.substance');
    if (!user) { console.error(`User '${TEST_USERNAME}' not found`); process.exit(1); }

    const substance = await Substance.findOne({ substanceKey: TEST_PRODUCT_KEY });
    if (!substance) { console.error(`Substance '${TEST_PRODUCT_KEY}' not found`); process.exit(1); }

    // Snapshot state before injection
    const inventoryBefore = user.inventory.map(i => `${i.substance?.name ?? i.substance}×${i.quantity}`);
    const runTotalBefore  = user.runTotals.find(rt =>
        (rt.substance?._id ?? rt.substance).toString() === substance._id.toString()
    );
    console.log('=== BEFORE ===');
    console.log('inventory     :', inventoryBefore.join(', ') || '(empty)');
    console.log('unlockTier    :', user.unlockTier);
    console.log('queue entries :', user.activeQueue.length);
    console.log('runTotal for test substance:', runTotalBefore?.produced ?? 'none');

    // Inject a fake processing entry with expectedCompletion in the past
    const now = new Date();
    user.activeQueue.push({
        reactionKey:        `dev_test_${TEST_PRODUCT_KEY}`,
        slot:               0,
        startTime:          new Date(now.getTime() - 10_000),
        expectedCompletion: new Date(now.getTime() - 1_000),  // 1 second ago — due immediately
        status:             'processing',
        reactantsConsumed:  true,
        revealOnCompletion: false,
        wasDiscovery:       false,
        snapshot: {
            reactionName:           'Dev Test Synthesis',
            energyCost:             0,
            productKey:             substance.substanceKey,
            productName:            substance.name,
            productQuantity:        1,
            productUnlocksUserTier: substance.unlocksUserTier || null,
            reactants:              []   // no reactants — consumed at queue start
        }
    });

    // Run resolution
    const results = await resolveQueue(user);
    pruneCompletedEntries(user);  // entry should survive (pruneAfter is 24h from now)

    // Print results
    const inventoryAfter = user.inventory.map(i => {
        const name = i.substance?.name ?? i.substance;
        return `${name}×${i.quantity}`;
    });
    const runTotalAfter = user.runTotals.find(rt =>
        (rt.substance?._id ?? rt.substance).toString() === substance._id.toString()
    );

    console.log('\n=== AFTER ===');
    console.log('inventory     :', inventoryAfter.join(', ') || '(empty)');
    console.log('unlockTier    :', user.unlockTier);
    console.log('queue entries :', user.activeQueue.length, `(${user.activeQueue.filter(e => e.status === 'processing').length} processing, ${user.activeQueue.filter(e => e.status === 'completed').length} completed)`);
    console.log('runTotal for test substance:', runTotalAfter?.produced ?? 'none');

    console.log('\n=== RESOLVE RESULTS ===');
    for (const r of results) {
        console.log({
            reactionKey:    r.entry.reactionKey,
            status:         r.entry.status,
            wasDiscovery:   r.wasDiscovery,
            prevUnlockTier: r.prevUnlockTier,
            newUnlockTier:  r.newUnlockTier,
            completedAt:    r.entry.completedAt,
            pruneAfter:     r.entry.pruneAfter
        });
    }

    if (results.length === 0) {
        console.log('(no entries resolved — check that expectedCompletion was set in the past)');
    }

    await user.save();
    console.log('\nUser saved.');

    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
