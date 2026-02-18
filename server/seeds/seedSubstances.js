const mongoose = require('mongoose');
const Substance = require('../models/Substance');
require('dotenv').config({ path: __dirname + '/../.env' });


const substances = [
  {
    type: "element",
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
    type: "element",
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
    type: "element",
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
    type: "element",
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
  },
  {
    type: "compound",
    symbol: "H2O",
    name: "Water",
    formula: "H2O",
    composition: [],
    color: "#4FC3F7",
    size: 1.5,
    unlockTier: 1,
    discoveryPrerequisites: ["H", "O"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "CO2",
    name: "Carbon Dioxide",
    formula: "CO2",
    composition: [],
    color: "#B0BEC5",
    size: 1.6,
    unlockTier: 2,
    discoveryPrerequisites: ["C", "O"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "NH3",
    name: "Ammonia",
    formula: "NH3",
    composition: [],
    color: "#AED581",
    size: 1.4,
    unlockTier: 2,
    discoveryPrerequisites: ["N", "H"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "CH4",
    name: "Methane",
    formula: "CH4",
    composition: [],
    color: "#FFB74D",
    size: 1.5,
    unlockTier: 2,
    discoveryPrerequisites: ["C", "H"],
    isBaseElement: false,
    isActive: true
  }
];

(async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Substance.deleteMany();
        await Substance.insertMany(substances)
    }
    catch (err) {
        console.log(err);
    }
    finally {
        mongoose.disconnect();
    }
})();