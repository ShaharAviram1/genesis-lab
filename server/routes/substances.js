const express = require('express');
const Substance = require('../models/Substance');

const router = express.Router();

router.get("/substances", async (req, res) => {
    try {
        const substances = await Substance.find();
        res.json(substances);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch substances" });
    }
});

router.get("/debug/substances", async (req, res) => {
    const substances = await Substance.find();
    res.json(substances.map(s => ({
        name: s.name,
        id: s._id,
        symbol: s.symbol
    })));
});


module.exports = router;