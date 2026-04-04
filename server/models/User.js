const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
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
    }
});
const User = mongoose.model("User", userSchema);
module.exports = User;