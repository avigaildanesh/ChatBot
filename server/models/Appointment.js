const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  date: String,
  time: String,
  eventId: String, // ✅ חדש!
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
