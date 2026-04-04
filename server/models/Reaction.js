const mongoose = require('mongoose');

const reactionSchema = mongoose.Schema({
    //recipe input
    reactants: {
        type: [{
            substance: { type: mongoose.Schema.Types.ObjectId, ref: 'Substance', required: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        required: true
    },

    //Reaction output
    product: {
        substance: { type: mongoose.Schema.Types.ObjectId, ref: 'Substance', required: true },
        quantity: { type: Number, required: true, min: 1 }
    },
    compoundType: {
        type: String,
        enum: ["compound", "material", "structure"]
    },
    byproducts: {
        type: [{
            substance: { type: mongoose.Schema.Types.ObjectId, ref: 'Substance', required: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        default: []
    },

    //Reaction Characteristics
    reactionType: {
        type: String,
        required: true,
        enum: ["synthesis", "decomposition", "combustion", "fusion", "transmutation"]
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
    energyCost: {
        type: Number,
        required: true,
        min: 0
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
