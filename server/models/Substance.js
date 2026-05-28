const mongoose = require('mongoose');

const substanceSchema = new mongoose.Schema({
    // Identity
    substanceKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ["element", "compound", "material", "artifact"]
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String   // short display tag, optional
    },
    formula: {
        type: String   // display identity, not simulation truth
    },
    category: {
        type: String   // open string: base_matter | gas | extreme_state | advanced_material | organic | cosmic | mythic | etc.
    },

    // Composition (conceptual, not enforced by engine)
    composition: [{
        substance: { type: mongoose.Schema.Types.ObjectId, ref: 'Substance' },
        quantity: Number
    }],

    // Progression
    generationTier: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    unlockTier: {
        type: Number,
        default: 0
    },
    unlocksUserTier: {
        type: Number,
        default: 0
    },

    // Economy
    baseEnergy: {
        type: Number,
        default: 0
    },
    shardValue: {
        type: Number,
        default: 0
    },

    // Reactor / gameplay tuning
    stabilityFactor: {
        type: Number,
        default: 1
    },
    reactivity: {
        type: Number,
        default: 0
    },
    fantasyWeight: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },

    // Display
    color: {
        type: String
    },
    hintText: {
        type: String
    },

    // Flags
    isBaseElement: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Substance = mongoose.model("Substance", substanceSchema);
module.exports = Substance;
