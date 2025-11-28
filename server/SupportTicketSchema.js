const mongoose = require("mongoose");

const SupportTicketSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  userId: { type: String, default: null }, // optional if logged in
  completed: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);
