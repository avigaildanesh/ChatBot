const Appointment = require('../models/AppointmentModel');
const AvailableSlot = require('../models/availableSlotModel');
const googleCalendar = require('../google/googleCalendar');
const Doctor = require('../models/doctorModel'); 

exports.getAvailableSlots = async (req, res) => {
  try {
    const slots = await AvailableSlot.find({ times: { $exists: true, $not: { $size: 0 } } });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

exports.addAvailableSlot = async (req, res) => {
  try {
    const { date, times } = req.body;
    if (!date || !Array.isArray(times)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    let slot = await AvailableSlot.findOne({ date });
    if (!slot) {
      slot = new AvailableSlot({ date, times });
    } else {
      slot.times = Array.from(new Set([...slot.times, ...times])).sort();
    }

    await slot.save();
    res.json({ message: 'Slots added successfully' });
  } catch (err) {
    
    res.status(500).json({ error: 'Failed to add slots' });
  }
};


exports.createBooking = async (req, res) => {
  try {
    const { name, phone, date, time } = req.body;
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const slot = await AvailableSlot.findOne({ date });
    if (!slot || !slot.times.includes(time)) {
      return res.status(400).json({ error: 'Selected time is not available' });
    }

    const doctor = await Doctor.findOne();
    if (!doctor) {
      return res.status(500).json({ error: 'No doctor found in the system' });
    }

    const calendarId = doctor.email;

    slot.times = slot.times.filter(t => t !== time);
    if (slot.times.length === 0) {
      await AvailableSlot.deleteOne({ date });
    } else {
      await slot.save();
    }

    const gEvent = await googleCalendar.createEvent({ name, phone, date, time, calendarId });

    const eventId = gEvent?.id;

    await Appointment.create({ name, phone, date, time, eventId, calendarId });

    res.json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Server error booking appointment' });
  }
};


exports.cancelBooking = async (req, res) => {
  try {
    const { name, phone, date, time } = req.body;
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const appt = await Appointment.findOneAndDelete({ name, phone, date, time });
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    let slot = await AvailableSlot.findOne({ date });
    if (!slot) {
      slot = new AvailableSlot({ date, times: [time] });
    } else {
      if (!slot.times.includes(time)) {
        slot.times.push(time);
        slot.times.sort();
      }
    }

    await slot.save();

    if (appt.eventId) {
      try {
        await googleCalendar.deleteEvent(appt.eventId);
      } catch (err) {
        console.warn('Warning: Failed to delete calendar event:', err.message);
      }
    }

    res.json({ message: 'Appointment canceled and time returned to availability' });
  } catch (err) {
    res.status(500).json({ error: 'Server error canceling appointment' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { name, phone } = req.query;
    const filter = {};
    if (name) filter.name = name;
    if (phone) filter.phone = phone;

    const appts = await Appointment.find(filter).sort({ date: 1, time: 1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching appointments' });
  }
};
