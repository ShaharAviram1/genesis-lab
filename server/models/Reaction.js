const mongoose = require('mongoose');
const { applyTimestamps } = require('./Element');

const reactionSchema = mongoose.Schema({
    //recipe input
    reactants: {
        type: [{
            element: { type: mongoose.Schema.Types.ObjectId, ref: 'Element', required: true },
            quantity: { type: Number, required: true }
        }],
        required: true
    },
    ratioLocked: {
        type: Boolean,
        default: false
    },

    //Reaction output
    product: {
        type: String,
        quantity: { type: Number, required: true }
    },
    compoundType: {
        type: String,
        enum: ["compound", "material", "structure"]
    },
    byproducts: {
        type: [String],
        default: []
    },

    //Reaction Characteristics
    reactionType: {
        type: String,
        required: true
    },
    isReversible: {
        type: Boolean,
        default: false
    },
    energyChange: {
        type: Number
    },
    reactionTime: {
        type: Number
    },

    //conditions
    conditions: {
        type: Object
    },
    catalyst: {
        type: String
    },
    requiredUserUnlock: {
        type: Boolean,
        default: false
    },

    //progression
    unlockTier: {
        type: Number,
        required: true
    },
    discoveryXP: {
        type: Number
    },
    discoveredByDefault: {
        type: Boolean,
        default: false
    },

    //Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    reactionID: {
        type: Number,
        required: true,
        unique: true
    }
}, { timestamps: true });

const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;
