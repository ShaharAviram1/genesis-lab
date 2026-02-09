const mongoose = require('mongoose');
const Element = require('../models/Element');
require('dotenv').config({ path: __dirname + '/../.env' });


const elements = [
  {
    symbol: "H",
    name: "Hydrogen",
    atomicNumber: 1,
    category: "nonmetal",
    stateAtSTP: "gas",
    density: 0.00008988,
    meltingPoint: -259.1,
    boilingPoint: -252.9,
    valenceElectrons: 1,
    maxBonds: 1,
    electronegativity: 2.20,
    reactivity: 0.9,
    baseEnergy: 1,
    stabilityFactor: 0.8,
    radioactive: false,
    color: "#FFFFFF",
    size: 1,
    unlockTier: 0,
    discoveryPrerequisites: [],
    isBaseElement: true,
    isActive: true
  },
  {
    symbol: "O",
    name: "Oxygen",
    atomicNumber: 8,
    category: "nonmetal",
    stateAtSTP: "gas",
    density: 0.001429,
    meltingPoint: -218.8,
    boilingPoint: -183.0,
    valenceElectrons: 6,
    maxBonds: 2,
    electronegativity: 3.44,
    reactivity: 0.8,
    baseEnergy: 2,
    stabilityFactor: 0.9,
    radioactive: false,
    color: "#FF0000",
    size: 1.2,
    unlockTier: 0,
    discoveryPrerequisites: [],
    isBaseElement: true,
    isActive: true
  },
  {
    symbol: "C",
    name: "Carbon",
    atomicNumber: 6,
    category: "nonmetal",
    stateAtSTP: "solid",
    density: 2.267,
    meltingPoint: 3550,
    boilingPoint: 4027,
    valenceElectrons: 4,
    maxBonds: 4,
    electronegativity: 2.55,
    reactivity: 0.7,
    baseEnergy: 3,
    stabilityFactor: 0.95,
    radioactive: false,
    color: "#2E2E2E",
    size: 1.1,
    unlockTier: 1,
    discoveryPrerequisites: ["H", "O"],
    isBaseElement: true,
    isActive: true
  },
  {
    symbol: "N",
    name: "Nitrogen",
    atomicNumber: 7,
    category: "nonmetal",
    stateAtSTP: "gas",
    density: 0.0012506,
    meltingPoint: -210.0,
    boilingPoint: -195.8,
    valenceElectrons: 5,
    maxBonds: 3,
    electronegativity: 3.04,
    reactivity: 0.5,
    baseEnergy: 2,
    stabilityFactor: 0.97,
    radioactive: false,
    color: "#0000FF",
    size: 1,
    unlockTier: 1,
    discoveryPrerequisites: ["H"],
    isBaseElement: true,
    isActive: true
  }
];

(async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Element.deleteMany();
        await Element.insertMany(elements)
    }
    catch (err) {
        console.log(err);
    }
    finally {
        mongoose.disconnect();
    }
})();