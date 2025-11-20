const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  code: String,
  fullName: String,
  address: String,
  durationMin: Number
});

const amenitiesSchema = new mongoose.Schema({
  wifi: Boolean,
  meals: Boolean,
  entertainment: Boolean,
  chargingPorts: Boolean
});

const flightSchema = new mongoose.Schema({
  airline: String,
  flightNo: String,

  from: String,
  fromFull: String,
  fromFullAddress: String,
  terminalFrom: String,
  gateFrom: String,

  uniqueKey: {
    type: String,
    unique: true,   // ✅ prevents duplicates
    required: true
  },

  to: String,
  toFull: String,
  toFullAddress: String,
  terminalTo: String,
  gateTo: String,

  baggageClaim: String,

  depart: String,
  arrive: String,
  departureTimeLocal: String,
  arrivalTimeLocal: String,

  durationMin: Number,
  timezoneChange: String,
  departureTimezone: String,
  arrivalTimezone: String,

  carryOnBagsAllowed: Number,
  carryOnWeightLimitKg: Number,
  personalItemAllowed: Boolean,
  checkedBagsAllowed: Number,
  checkedBagWeightLimitKg: Number,
  extraBagFeeUSD: Number,

  aircraftModel: String,
  aircraftCode: String,
  aircraftAgeYears: Number,
  aircraftCapacity: Number,

  seatLayout: String,
  seatPitch: String,
  seatWidth: String,

  hasUSBOutlets: Boolean,
  hasPowerOutlets: Boolean,
  hasLiveTV: Boolean,

  onTimePercentage: Number,
  averageDelayMin: Number,
  cancellationRate: Number,
  weatherDelayRiskScore: Number,
  safetyScore: Number,

  amenities: amenitiesSchema,

  price: Number,
  rating: Number,
  stops: Number,

  stopInfo: [stopSchema],

  date: String
});

module.exports = mongoose.model("Flight", flightSchema);
