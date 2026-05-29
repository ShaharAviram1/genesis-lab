const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Builds a safe summary of a single queue entry for the inspect endpoint.
// Strips product identity (productKey, productName, etc.) when revealOnCompletion is true —
// the same rule the WS sanitizer uses.
function summarizeEntry(entry) {
    const e = entry.toObject ? entry.toObject() : entry;
    const out = {
        _id:                e._id,
        reactionKey:        e.reactionKey,
        slot:               e.slot,
        status:             e.status,
        startTime:          e.startTime,
        expectedCompletion: e.expectedCompletion,
        completedAt:        e.completedAt,
        pruneAfter:         e.pruneAfter,
        revealOnCompletion: e.revealOnCompletion,
        wasDiscovery:       e.wasDiscovery,
        claimedAt:          e.claimedAt,
    };
    if (e.snapshot) {
        out.snapshot = {
            reactionName: e.revealOnCompletion ? 'Unknown Synthesis' : e.snapshot.reactionName,
            energyCost:   e.snapshot.energyCost,
            reactants:    e.snapshot.reactants,
        };
        if (!e.revealOnCompletion) {
            out.snapshot.productKey             = e.snapshot.productKey;
            out.snapshot.productName            = e.snapshot.productName;
            out.snapshot.productQuantity        = e.snapshot.productQuantity;
            out.snapshot.productUnlocksUserTier = e.snapshot.productUnlocksUserTier;
        }
    }
    return out;
}

// GET /api/dev/users/:username/queue
// Returns the full activeQueue for a user, with product identity stripped for undiscovered entries.
router.get('/users/:username/queue', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            username:    user.username,
            unlockTier:  user.unlockTier,
            queueLength: user.activeQueue.length,
            queue:       user.activeQueue.map(summarizeEntry),
        });
    } catch (err) {
        console.error('dev/queue inspect error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/dev/users/:username/queue/:queueEntryId/fast-forward
// Accepts _id OR reactionKey as :queueEntryId.
// Sets expectedCompletion to now - 1s so the entry resolves on the very next resolveQueue call.
// Does NOT call completeReaction or touch inventory — the real lifecycle handles completion.
router.post('/users/:username/queue/:queueEntryId/fast-forward', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { queueEntryId } = req.params;
        const entry = user.activeQueue.find(e =>
            e._id.toString() === queueEntryId || e.reactionKey === queueEntryId
        );

        if (!entry) return res.status(404).json({ error: 'Queue entry not found' });

        if (entry.status !== 'processing' && entry.status !== 'resolving') {
            return res.status(400).json({
                error: `Cannot fast-forward entry with status '${entry.status}' — only 'processing' or 'resolving' entries can be advanced`
            });
        }

        entry.expectedCompletion = new Date(Date.now() - 1000);
        await user.save();

        res.json({
            message: "expectedCompletion set to 1s ago. Fetch GET /api/users/:username to trigger resolution.",
            entry:   summarizeEntry(entry),
        });
    } catch (err) {
        console.error('dev/queue fast-forward error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/dev/users/:username/pending-notifications/delivered
// Removes only notifications where deliveredAt is set. Never touches undelivered notifications.
router.delete('/users/:username/pending-notifications/delivered', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const before = user.pendingNotifications.length;
        user.pendingNotifications = user.pendingNotifications.filter(n => !n.deliveredAt);
        const removed = before - user.pendingNotifications.length;

        if (removed > 0) await user.save();

        res.json({ removed, remaining: user.pendingNotifications.length });
    } catch (err) {
        console.error('dev/pending-notifications delete error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
