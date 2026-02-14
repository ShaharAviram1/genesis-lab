const Reaction = require('./../models/Reaction');
const User = require('./../models/User');
const Element = require('../models/Substance');

function checkReactionEligibility(user, reaction) {
    for (const { element: reactantElement, quantity: reactionQuantity } of reaction.reactants) {
        let hasEnough = false;
        for (const { element: inventoryElement, quantity: userQuantity } of user.inventory) {
            if (reactantElement.equals(inventoryElement) && userQuantity >= reactionQuantity) {
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