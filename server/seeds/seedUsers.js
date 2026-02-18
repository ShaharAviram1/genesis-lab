const mongoose = require('mongoose');
const Substance = require('./../models/Substance');
const User = require('./../models/User');

require('dotenv').config({ path: __dirname + '/../.env' });


(async () => { 
    try {
        mongoose.connect(process.env.MONGO_URI);
        const substances = await Substance.find();
        const users = [
        {
            username: "alchemist",
            inventory: [
            { substance: substances[0]._id, quantity: 10 },
            { substance: substances[1]._id, quantity: 5 },
            ]
        },
        {
            username: "chemist42",
            inventory: [
            { substance: substances[2]._id, quantity: 7 },
            ]
        }
        ];
        await User.deleteMany();
        await User.insertMany(users);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        mongoose.disconnect();
    }
})();