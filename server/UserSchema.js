const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
    // store user's reward balance
    totalPoints: { type: Number, default: 0 }
});

// Add points history as an array of transactions
UserSchema.add({
    pointsHistory: [
        {
            change: String, // e.g. '+2000' or '-10000'
            date: { type: Date, default: Date.now },
            note: String,
            flight: String
        }
    ]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;