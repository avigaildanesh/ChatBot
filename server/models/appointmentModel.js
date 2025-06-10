const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  date: String,
  time: String,
  eventId: String,
  calendarId: String,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
