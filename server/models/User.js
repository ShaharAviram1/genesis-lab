const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    inventory: [{
            substance: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Substance',
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