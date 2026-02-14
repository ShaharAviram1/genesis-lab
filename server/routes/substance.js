const express = require('express');
const elementDB = require('../models/Substance');

const router = express.Router();

router.get("/elements", async (req, res) => {
    try {
        const elements = await elementDB.find();
        res.json(elements);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch elements" });
    }
});



module.exports = router;