const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post("/auth/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ username, passwordHash });
        await newUser.save();
        jwt.sign({ username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Failed to generate token" });
            }
            return res.status(201).json({ success: true, user: { username: newUser.username }, token });
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to register user" });
    }
});

router.post("/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Failed to generate token" });
            }
            return res.status(200).json({ success: true, user: { username: user.username }, token });
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to login" });
    }
});

module.exports = router;