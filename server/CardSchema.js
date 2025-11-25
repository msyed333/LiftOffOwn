const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },

  cardNumber: {
    type: String,
    required: true
  },

  cardHolder: String,
  expiry: String,

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: Date
});

module.exports = mongoose.model("Card", cardSchema);
