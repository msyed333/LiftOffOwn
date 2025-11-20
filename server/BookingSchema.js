const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  // Who booked the flight
  userId: { type: String, required: true },

  // Passenger information
  passengerCount: Number,
  passengers: [
    {
      fullName: String,
      age: Number
    }
  ],

  seatingPreference: String,
  email: String, // receipt email

  // Flight details
  flightId: String,
  airline: String,
  from: String,
  to: String,
  depart: String,
  arrive: String,
  price: String,

  // System-generated values
  confirmationCode: String,
  bookingDate: String
});

module.exports = mongoose.model("Booking", BookingSchema);
