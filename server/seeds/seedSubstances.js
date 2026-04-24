const mongoose = require('mongoose');
const Substance = require('../models/Substance');
require('dotenv').config({ path: __dirname + '/../.env' });


const substances = [
  // ===== ELEMENTS =====
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
    unlockTier: 0,
    discoveryPrerequisites: [],
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
    unlockTier: 0,
    discoveryPrerequisites: [],
    isBaseElement: true,
    isActive: true
  },
  {
    type: "element",
    symbol: "He",
    name: "Helium",
    atomicNumber: 2,
    category: "noble_gas",
    stateAtSTP: "gas",
    density: 0.0001785,
    meltingPoint: -272.2,
    boilingPoint: -268.9,
    valenceElectrons: 2,
    maxBonds: 0,
    electronegativity: 0,
    reactivity: 0.0,
    baseEnergy: 5,
    stabilityFactor: 1.0,
    radioactive: false,
    color: "#FFD700",
    size: 1,
    unlockTier: 0,
    discoveryPrerequisites: [],
    isBaseElement: true,
    isActive: true
  },

  // ===== BASIC GASES =====
  {
    type: "compound",
    symbol: "H2",
    name: "Hydrogen Gas",
    formula: "H2",
    composition: [],
    color: "#E3F2FD",
    size: 1.2,
    unlockTier: 0,
    discoveryPrerequisites: ["H"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "O2",
    name: "Oxygen Gas",
    formula: "O2",
    composition: [],
    color: "#FFCDD2",
    size: 1.2,
    unlockTier: 0,
    discoveryPrerequisites: ["O"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "N2",
    name: "Nitrogen Gas",
    formula: "N2",
    composition: [],
    color: "#BBDEFB",
    size: 1.2,
    unlockTier: 0,
    discoveryPrerequisites: ["N"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "O3",
    name: "Ozone",
    formula: "O3",
    composition: [],
    color: "#B39DDB",
    size: 1.3,
    unlockTier: 1,
    discoveryPrerequisites: ["O2"],
    isBaseElement: false,
    isActive: true
  },

  // ===== WATER SYSTEM =====
  {
    type: "compound",
    symbol: "H2O",
    name: "Water",
    formula: "H2O",
    composition: [],
    color: "#4FC3F7",
    size: 1.5,
    unlockTier: 1,
    unlocksUserTier: 2,
    shardValue: 1,
    discoveryPrerequisites: ["H2", "O2"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "H2O-S",
    name: "Steam",
    formula: "H2O(g)",
    composition: [],
    color: "#ECEFF1",
    size: 1.4,
    unlockTier: 1,
    discoveryPrerequisites: ["H2O"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "H2O-I",
    name: "Ice",
    formula: "H2O(s)",
    composition: [],
    color: "#E1F5FE",
    size: 1.4,
    unlockTier: 1,
    discoveryPrerequisites: ["H2O"],
    isBaseElement: false,
    isActive: true
  },

  // ===== ATMOSPHERIC COMPOUNDS =====
  {
    type: "compound",
    symbol: "CO2",
    name: "Carbon Dioxide",
    formula: "CO2",
    composition: [],
    color: "#B0BEC5",
    size: 1.5,
    unlockTier: 1,
    discoveryPrerequisites: ["C", "O2"],
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
    size: 1.4,
    unlockTier: 2,
    discoveryPrerequisites: ["C", "H2"],
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
    discoveryPrerequisites: ["N2", "H2"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "TG",
    name: "Toxic Gas",
    formula: "Mixed Gas",
    composition: [],
    color: "#8BC34A",
    size: 1.5,
    unlockTier: 2,
    discoveryPrerequisites: ["NH3", "O3"],
    isBaseElement: false,
    isActive: true
  },

  // ===== ENERGY COMPOUNDS =====
  {
    type: "compound",
    symbol: "FUEL",
    name: "Fuel",
    formula: "Hydrocarbon Fuel",
    composition: [],
    color: "#FF7043",
    size: 1.6,
    unlockTier: 2,
    unlocksUserTier: 3,
    shardValue: 2,
    discoveryPrerequisites: ["CH4"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "CG",
    name: "Combustion Gas",
    formula: "Combustion Products",
    composition: [],
    color: "#9E9E9E",
    size: 1.5,
    unlockTier: 2,
    discoveryPrerequisites: ["FUEL", "O2"],
    isBaseElement: false,
    isActive: true
  },

  // ===== PROTO ORGANICS =====
  {
    type: "compound",
    symbol: "ORG",
    name: "Organic Matter",
    formula: "Organic Compound",
    composition: [],
    color: "#6D4C41",
    size: 1.6,
    unlockTier: 3,
    unlocksUserTier: 4,
    shardValue: 4,
    discoveryPrerequisites: ["CH4", "NH3"],
    isBaseElement: false,
    isActive: true
  },
  {
    type: "compound",
    symbol: "HCX",
    name: "Complex Hydrocarbon",
    formula: "CxHy",
    composition: [],
    color: "#5D4037",
    size: 1.7,
    unlockTier: 3,
    unlocksUserTier: 5,
    shardValue: 6,
    discoveryPrerequisites: ["CH4", "FUEL"],
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