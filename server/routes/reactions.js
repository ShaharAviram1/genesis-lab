const express = require('express');
const reactionsDB = require('./../models/Reaction');

const router = express.Router();

router.get("/reactions", async (req, res) => {
    try {
        const reactions = await reactionsDB.find().populate('reactants.element');
        res.json(reactions);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch reactions" });
    }
});


module.exports = router;