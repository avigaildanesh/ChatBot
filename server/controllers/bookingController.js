const Appointment    = require('../models/Appointment');
const AvailableSlot  = require('../models/AvailableSlot');
const googleCalendar = require('../googleCalendar');

// קבלת רק תאריכים עם שעות זמינות
exports.getAvailableSlots = async (req, res) => {
  try {
    const slots = await AvailableSlot.find({
      times: { $exists: true, $not: { $size: 0 } } // ✅ רק אם יש שעות בפנים
    });
    res.json(slots);
  } catch (err) {
    console.error('Error in getAvailableSlots:', err);
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
    console.error('Error in addAvailableSlot:', err);
    res.status(500).json({ error: 'Failed to add slots' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { name, phone, date, time } = req.body;
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // בדיקת זמינות
    const slot = await AvailableSlot.findOne({ date });
    if (!slot || !slot.times.includes(time)) {
      return res.status(400).json({ error: 'Selected time is not available' });
    }

    // יצירת אירוע ב-Google Calendar
    const gEvent = await googleCalendar.createEvent({ name, phone, date, time });
    const eventId = gEvent?.id;

    // שמירת התור במסד
    await Appointment.create({ name, phone, date, time, eventId });

    // הסרת השעה מהרשימה הזמינה
    slot.times = slot.times.filter(t => t !== time);
    await slot.save();

    res.json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('Error in createBooking:', err);
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

    // ✅ מחזירים את הזמן לזמינות
    let slot = await AvailableSlot.findOne({ date });

    if (!slot) {
      slot = new AvailableSlot({ date, times: [time] });
    } else {
      if (!slot.times.includes(time)) {
        slot.times.push(time);
        slot.times.sort(); // סדר כרונולוגי
      }
    }

    await slot.save();

    // ✅ מחיקת האירוע מהיומן
    if (appt.eventId) {
      try {
        await googleCalendar.deleteEvent(appt.eventId);
      } catch (err) {
        console.warn('Warning: Failed to delete calendar event:', err.message);
      }
    }

    return res.json({ message: 'Appointment canceled and time returned to availability' });
  } catch (err) {
    console.error('Error in cancelBooking:', err);
    return res.status(500).json({ error: 'Server error canceling appointment' });
  }
};

