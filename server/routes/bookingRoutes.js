// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  addAvailableSlot,
  createBooking,
  cancelBooking,
  getAppointments
} = require('../controllers/bookingController');

router.get('/slots', getAvailableSlots);
router.post('/admin/slots', addAvailableSlot);
router.post('/book', createBooking);
router.post('/cancel', cancelBooking);
router.get('/appointments', getAppointments);

module.exports = router;
