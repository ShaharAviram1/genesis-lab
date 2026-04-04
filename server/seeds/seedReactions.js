const mongoose = require('mongoose');
const Reaction = require('./../models/Reaction');
const Substance = require('../models/Substance');
require('dotenv').config({ path: __dirname + '/../.env' });

const reactions = [
  {
    reactants: [
      { name: "Hydrogen", quantity: 2 }
    ],
    product: "Hydrogen Gas",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 0,
    isReversible: false,
    discoveredByDefault: true,
    isActive: true,
    energyCost: 1
  },
  {
    reactants: [
      { name: "Oxygen", quantity: 2 }
    ],
    product: "Oxygen Gas",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 0,
    isReversible: false,
    discoveredByDefault: true,
    isActive: true,
    energyCost: 1
  },
  {
    reactants: [
      { name: "Nitrogen", quantity: 2 }
    ],
    product: "Nitrogen Gas",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 0,
    isReversible: false,
    discoveredByDefault: true,
    isActive: true,
    energyCost: 1
  },
  {
    reactants: [
      { name: "Hydrogen Gas", quantity: 1 },
      { name: "Oxygen", quantity: 1 }
    ],
    product: "Water",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -285.8,
    unlockTier: 1,
    isReversible: false,
    discoveredByDefault: true,
    isActive: true,
    energyCost: 5
  },
  {
    reactants: [
      { name: "Oxygen Gas", quantity: 1 },
      { name: "Oxygen", quantity: 1 }
    ],
    product: "Ozone",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 1,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 6
  },
  {
    reactants: [
      { name: "Carbon", quantity: 1 },
      { name: "Oxygen Gas", quantity: 1 }
    ],
    product: "Carbon Dioxide",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -393.5,
    unlockTier: 1,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 6
  },
  {
    reactants: [
      { name: "Water", quantity: 1 }
    ],
    product: "Steam",
    reactionType: "transmutation",
    compoundType: "compound",
    energyChange: 40,
    unlockTier: 1,
    isReversible: true,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 3
  },
  {
    reactants: [
      { name: "Water", quantity: 1 }
    ],
    product: "Ice",
    reactionType: "transmutation",
    compoundType: "compound",
    energyChange: -6,
    unlockTier: 1,
    isReversible: true,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 2
  },
  {
    reactants: [
      { name: "Carbon", quantity: 1 },
      { name: "Hydrogen Gas", quantity: 1 }
    ],
    product: "Methane",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -74.8,
    unlockTier: 2,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 8
  },
  {
    reactants: [
      { name: "Nitrogen Gas", quantity: 1 },
      { name: "Hydrogen Gas", quantity: 1 }
    ],
    product: "Ammonia",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: -46.0,
    unlockTier: 2,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 8
  },
  {
    reactants: [
      { name: "Ammonia", quantity: 1 },
      { name: "Ozone", quantity: 1 }
    ],
    product: "Toxic Gas",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 2,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 10
  },
  {
    reactants: [
      { name: "Methane", quantity: 1 }
    ],
    product: "Fuel",
    reactionType: "transmutation",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 2,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 12
  },
  {
    reactants: [
      { name: "Fuel", quantity: 1 },
      { name: "Oxygen Gas", quantity: 1 }
    ],
    product: "Combustion Gas",
    reactionType: "combustion",
    compoundType: "compound",
    energyChange: -200,
    unlockTier: 2,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 10
  },
  {
    reactants: [
      { name: "Methane", quantity: 1 },
      { name: "Ammonia", quantity: 1 }
    ],
    product: "Organic Matter",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 3,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 15
  },
  {
    reactants: [
      { name: "Methane", quantity: 1 },
      { name: "Fuel", quantity: 1 }
    ],
    product: "Complex Hydrocarbon",
    reactionType: "synthesis",
    compoundType: "compound",
    energyChange: 0,
    unlockTier: 3,
    isReversible: false,
    discoveredByDefault: false,
    isActive: true,
    energyCost: 18
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Reaction.deleteMany();
    let i = 1;
    const allSubstances = await Substance.find();
    const nameMap = {};
    allSubstances.forEach(sub => nameMap[sub.name] = sub._id);

    const formattedReactions = reactions.map(r => ({
      reactants: r.reactants.map(item => {
        const substanceId = nameMap[item.name];
        if (!substanceId) {
          throw new Error(`Substance with name '${item.name}' not found in DB`);
        }
        return {
          substance: substanceId,
          quantity: item.quantity
        };
      }),
      product: {
        substance: nameMap[r.product],
        quantity: 1
      },
      reactionType: r.reactionType,
      compoundType: r.compoundType,
      energyChange: r.energyChange,
      unlockTier: r.unlockTier,
      isReversible: r.isReversible,
      discoveredByDefault: r.discoveredByDefault,
      isActive: r.isActive,
      reactionID: i++,
      energyCost: r.energyCost
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