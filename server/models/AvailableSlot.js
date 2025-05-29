const mongoose = require('mongoose');

const AvailableSlotSchema = new mongoose.Schema({
  date:  { type: String, required: true }, // YYYY-MM-DD
  times: { type: [String], default: []      }, // ["09:00","10:00",…]
});

module.exports = mongoose.model('AvailableSlot', AvailableSlotSchema);
