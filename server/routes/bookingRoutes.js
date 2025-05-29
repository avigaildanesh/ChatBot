// server/routes/bookingRoutes.js
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/bookingController');
const Appointment = require('../models/Appointment');

router.get(  '/slots',      controller.getAvailableSlots);
router.post( '/book',       controller.createBooking);
router.post( '/admin/slots', controller.addAvailableSlot);
router.post('/cancel', controller.cancelBooking);

// חדש: GET /api/appointments?name=...&phone=...
router.get('/appointments', async (req, res) => {
  try {
    const { name, phone } = req.query;
    const filter = {};
    if (name)  filter.name  = name;
    if (phone) filter.phone = phone;

    const appts = await Appointment.find(filter).sort({ date: 1, time: 1 });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

module.exports = router;
