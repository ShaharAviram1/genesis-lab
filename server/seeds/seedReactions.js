const mongoose = require('mongoose');
const Reaction = require('./../models/Reaction');
const Element = require('./../models/Element');
require('dotenv').config({ path: __dirname + '/../.env' });

const reactions = [
  {
    reactants: [
      { symbol: "H", quantity: 2 },
      { symbol: "O", quantity: 1 }
    ],
    product: "H2O",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -285.8,
    unlockTier: 0,
    isReversible: false,
    discoveredByDefault: true,
    isActive: true
  },
  {
    reactants: [
      { symbol: "C", quantity: 1 },
      { symbol: "O", quantity: 2 }
    ],
    product: "CO2",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -393.5,
    unlockTier: 1,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true
  },
  {
    reactants: [
      { symbol: "N", quantity: 1 },
      { symbol: "H", quantity: 3 }
    ],
    product: "NH3",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -46.0,
    unlockTier: 1,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true
  },
  {
    reactants: [
      { symbol: "C", quantity: 1 },
      { symbol: "H", quantity: 4 }
    ],
    product: "CH4",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -74.8,
    unlockTier: 1,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Reaction.deleteMany();
    let i = 1;
    const allElements = await Element.find();
    const symbolMap = {};
    allElements.forEach(el => symbolMap[el.symbol] = el._id);

    const formattedReactions = reactions.map(r => ({
      reactants: r.reactants.map(item => {
        const elementId = symbolMap[item.symbol];
        if (!elementId) {
          throw new Error(`Element with symbol '${item.symbol}' not found in DB`);
        }
        return {
          element: elementId,
          quantity: item.quantity
        };
      }),
      product: r.product,
      reactionType: r.reactionType,
      compoundType: r.compoundType,
      energyChange: r.energyChange,
      unlockTier: r.unlockTier,
      isReversible: r.isReversible,
      discoveredByDefault: r.discoveredByDefault,
      isActive: r.isActive,
      reactionID: i++ 
    }));

    await Reaction.insertMany(formattedReactions);
}
catch (err) {
    console.log(err);
}
finally {
    mongoose.disconnect();
}
})();