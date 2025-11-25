const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Only safe fields
  last4: {
    type: String,
    required: true
  },

  cardHolder: {
    type: String,
    required: true
  },

  expiry: {
    type: String,
    required: true
  },

  brand: {
    type: String,   // Optional: Visa, Mastercard, etc.
    default: "Card"
  }

}, { timestamps: true });

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
