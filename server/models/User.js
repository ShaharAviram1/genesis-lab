const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    inventory: [{
        substance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Substance',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    energy: {
        type: Number,
        default: 0,
        min: 0
    },
    bigBangCount: {
        type: Number,
        default: 0,
        min: 0
    },
    unlockTier: {
        type: Number,
        min: 0,
        default: 0
    },
    runTotals: [{
        substance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Substance',
            required: true
        },
        produced: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    genesisShards: {
        type: Number,
        default: 0,
        min: 0
    },
    prestigeUpgrades: {
        energy: {
            type: Number,
            default: 0,
            min: 0
        },
        matter: {
            type: Number,
            default: 0,
            min: 0
        },
        chemistry: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    reactionLog: [{
        type: { type: String, enum: ['experiment', 'perform'] },
        outcome: { type: String, enum: ['success', 'discovery', 'failure'] },
        substances: [String],
        product: { type: String, default: null },
        message: String,
        createdAt: { type: Date, default: Date.now }
    }],
    reactorCapabilities: {
        type: [String],
        default: []
    },
    activeQueue: [{
        // Live reference — used for resolution; not required because it may go stale
        reaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reaction'
        },
        // Snapshot identity — authoritative stable key
        reactionKey: {
            type: String,
            required: true
        },
        // 0-indexed slot; null until promoted from 'queued' to 'processing'
        slot: {
            type: Number,
            default: null
        },

        // Timing — null on 'queued' entries; populated at queue-write or promotion time
        startTime: {
            type: Date,
            default: null
        },
        expectedCompletion: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },
        // completedAt + 24h; entries with status !== 'processing' are pruned when this passes
        pruneAfter: {
            type: Date,
            default: null
        },

        // Status lifecycle:
        //   'queued'    — buffer position; reactants/energy already deducted; awaiting a free slot
        //   'processing'— occupies a numbered slot; timer is running
        //   'resolving' — transient atomic claim state; prevents concurrent double-completion
        //   'completed' — reward delivered; pruned after 24h
        //   'failed'    — side-effect error; pruned after 24h
        status: {
            type: String,
            enum: ['queued', 'processing', 'resolving', 'completed', 'failed'],
            default: 'processing'
        },
        // Set when status transitions to 'resolving'. Used to detect stale claims after
        // a server crash or save failure. Cleared when recovered back to 'processing'.
        claimedAt: {
            type: Date,
            default: null
        },
        // True immediately after deduction commits; guards against double-deduct on retry/recovery
        reactantsConsumed: {
            type: Boolean,
            default: false
        },

        // Discovery
        // True if product was undiscovered at queue start; strips product from client payload until completion
        revealOnCompletion: {
            type: Boolean,
            default: false
        },
        // False until completeReaction runs; set to wasDiscovery result at completion
        wasDiscovery: {
            type: Boolean,
            default: false
        },

        // Resilience snapshot — written at queue start, never mutated
        // Authoritative source for reward delivery; immune to content edits during long syntheses
        snapshot: {
            reactionName:           { type: String },
            energyCost:             { type: Number },
            productKey:             { type: String },
            productName:            { type: String },
            productQuantity:        { type: Number },
            productUnlocksUserTier: { type: Number, default: null },
            // Stored at write time so promotion can compute expectedCompletion without a DB lookup
            effectiveReactionTime:  { type: Number, default: null },
            reactants: [{
                substanceKey: { type: String },
                name:         { type: String },
                quantity:     { type: Number }
            }]
        }
    }],

    blueprints: [{
        blueprintKey:  { type: String, required: true },
        level:         { type: Number, default: 1, min: 1 },
        purchasedAt:   { type: Date, default: Date.now }
    }],

    generators: [{
        moduleKey:     { type: String, required: true },
        level:         { type: Number, default: 1, min: 1 },
        constructedAt: { type: Date, default: Date.now },
        pausedAt:      { type: Date, default: null },
        lastTickAt:    { type: Date, default: Date.now }
    }],

    lastActiveAt: { type: Date, default: Date.now },

    // ── Discovery (persists across Big Bang — knowledge survives, inventory does not) ──
    // Tracks which generationTiers the player has ever synthesized substances in.
    // Used to determine Anomaly Detected visibility (gen proximity gate).
    discoveredGenerations: {
        type: [Number],
        default: []
    },
    // Evidence record per undiscovered Gen 4-6 reaction.
    // completedSubstanceKeys: direct reactants the player has ever synthesized.
    // completedConditionKeys: substance-unlockable conditions the player has ever unlocked.
    reactionDiscovery: [{
        reactionKey: { type: String, required: true },
        completedSubstanceKeys: { type: [String], default: [] },
        completedConditionKeys:  { type: [String], default: [] },
        _id: false
    }],

    // Stores completion events for users who were offline at resolution time.
    // Drained and emitted exactly once on next WebSocket connect.
    // deliveredAt is set to the delivery timestamp; null means undelivered.
    //
    // TODO: future cleanup — prune entries where deliveredAt is set and older than 48h.
    // TODO: future cleanup — sweep undelivered entries older than 48h (permanent delivery failure guard).
    pendingNotifications: [{
        type:        { type: String, required: true, enum: ['synthesis_completed', 'synthesis_discovered', 'synthesis_failed', 'unlock_tier'] },
        payload:     { type: mongoose.Schema.Types.Mixed, required: true },
        createdAt:   { type: Date, default: Date.now },
        deliveredAt: { type: Date, default: null }
    }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
