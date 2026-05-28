const mongoose = require('mongoose');

const reactionSchema = mongoose.Schema({
    // Identity
    reactionKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    generationTier: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },

    // Recipe
    reactants: {
        type: [{
            substance: { type: mongoose.Schema.Types.ObjectId, ref: 'Substance', required: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        required: true
    },
    product: {
        substance: { type: mongoose.Schema.Types.ObjectId, ref: 'Substance', required: true },
        quantity: { type: Number, required: true, min: 1 }
    },

    // Cost and time
    energyCost: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    reactionTime: {
        type: Number,
        default: 0     // seconds; 0 = instant synthesis
    },

    // Reactor requirements
    conditions: {
        type: [String],
        default: []    // checked against user.reactorCapabilities at queue time
    },

    // Progression
    unlockTier: {
        type: Number,
        required: true,
        default: 0
    },
    discoveredByDefault: {
        type: Boolean,
        default: false
    },

    // Display
    description: {
        type: String
    },
    hintText: {
        type: String
    },

    // Control
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;
