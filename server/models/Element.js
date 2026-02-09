const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
    //Identity properties
    symbol: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    atomicNumber: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["nonmetal", "metal", "noble_gas", "halogen", "metalloid"]
    },
    //Physical properties
    stateAtSTP: {
        type: String
    },
    density: {
        type: Number
    },
    meltingPoint: {
        type: Number
    },
    boilingPoint: {
        type: Number
    },
    //Chemical behavior properties
    valenceElectrons: {
        type: Number
    },
    maxBonds: {
        type: Number
    },
    electronegativity: {
        type: Number
    },
    reactivity: {
        type: Number,
        min: 0,
        max: 1
    },
    //Energy and stabiliity properties
    baseEnergy: {
        type: Number
    },
    stabilityFactor: {
        type: Number
    },
    radioactive: {
        type: Boolean,
        default: false
    },
    //UI
    color: {
        type: String
    },
    icon: {
        type: String
    },
    size: {
        type: Number
    },
    //Progression and unblocking
    unlockTier: {
        type: Number
    },
    discoveryPrerequisites: {
        type: [String],
        default: []
    },
    isBaseElement: {
        type: Boolean,
        default: false
    },
    //Metadata
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: false
    }
});

const Element = mongoose.model("Element", elementSchema);
module.exports = Element;