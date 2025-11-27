const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  guestId: {
    type: String,
    default: null
  },

  name: String,
  email: String,

  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight"
  },

  airline: String,
  from: String,
  to: String,
  depart: String,
  arrive: String,
  date: String,

  passengerCount: Number,
  passengers: Array,
  seatingPreference: String,
  price: Number,

  checkedIn: { type: Boolean, default: false },

  confirmationCode: {
    type: String,
    unique: true
  },

  bookingDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
