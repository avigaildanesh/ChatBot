const mongoose = require('mongoose');

const availableSlotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  times: { type: [String], default: [] },
});

module.exports = mongoose.model('AvailableSlot', availableSlotSchema);
