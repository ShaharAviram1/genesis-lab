const mongoose = require('mongoose');
const Element = require('./../models/Element');
const User = require('./../models/User');

require('dotenv').config({ path: __dirname + '/../.env' });


(async () => { 
    try {
        mongoose.connect(process.env.MONGO_URI);
        const elements = await Element.find();
        const users = [
        {
            username: "alchemist",
            inventory: [
            { element: elements[0]._id, quantity: 10 },
            { element: elements[1]._id, quantity: 5 },
            ]
        },
        {
            username: "chemist42",
            inventory: [
            { element: elements[2]._id, quantity: 7 },
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