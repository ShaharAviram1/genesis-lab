const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    inventory: [{
            element: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Element',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 0
            }
    }]
});
const User = mongoose.model("User", userSchema);
module.exports = User;