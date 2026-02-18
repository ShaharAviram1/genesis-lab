const Reaction = require('./../models/Reaction');
const User = require('./../models/User');
const Substance = require('../models/Substance');

function checkReactionEligibility(user, reaction) {
    for (const { substance: reactantSubstance, quantity: reactantQuantity } of reaction.reactants) {
        let hasEnough = false;

        for (const { substance: inventorySubstance, quantity: userQuantity } of user.inventory) {
            if (
                reactantSubstance._id.toString() === inventorySubstance._id.toString() &&
                userQuantity >= reactantQuantity
            ) {
                hasEnough = true;
                break;
            }
        }

        if (!hasEnough) {
            return false;
        }
    }

    return true;
}

module.exports = checkReactionEligibility;