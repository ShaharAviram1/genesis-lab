const mongoose = require('mongoose');

const substanceSchema = new mongoose.Schema({
    // Core identity
    type: {
        type: String,
        required: true,
        enum: ["element", "compound"]
    },
    symbol: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },

    // Element-specific properties (conditionally required)
    atomicNumber: {
        type: Number,
        required: function () {
            return this.type === "element";
        }
    },
    category: {
        type: String,
        enum: ["nonmetal", "metal", "noble_gas", "halogen", "metalloid"],
        required: function () {
            return this.type === "element";
        }
    },

    // Physical properties
    stateAtSTP: String,
    density: Number,
    meltingPoint: Number,
    boilingPoint: Number,

    // Chemical behavior
    valenceElectrons: {
        type: Number,
        required: function () {
            return this.type === "element";
        }
    },
    maxBonds: Number,
    electronegativity: Number,
    reactivity: {
        type: Number,
        min: 0,
        max: 1
    },

    // Energy & stability
    baseEnergy: Number,
    stabilityFactor: Number,
    radioactive: {
        type: Boolean,
        default: false
    },

    // Compound-specific properties
    formula: {
        type: String
    },
    composition: [
        {
            substance: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Substance"
            },
            quantity: Number
        }
    ],

    // UI
    color: String,
    icon: String,
    size: Number,

    // Progression
    unlockTier: Number,
    discoveryPrerequisites: {
        type: [String],
        default: []
    },
    isBaseElement: {
        type: Boolean,
        default: false
    },

    // Metadata
    createdAt: Date,
    updatedAt: Date,
    isActive: {
        type: Boolean,
        default: false
    }
});

const Substance = mongoose.model("Substance", substanceSchema);
module.exports = Substance;