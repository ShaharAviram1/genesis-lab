const express = require('express');
const User = require('./../models/User');

const router = express.Router();

router.get("/users/:username", async (req, res) => { 
    try {
        const user = await User.findOne({ username: req.params.username }).populate('inventory.substance');
        if (!user) { return res.status(404).json({ error: "User not found" }); }
        return res.status(200).json({ username: user.username, inventory: user.inventory });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

module.exports = router;