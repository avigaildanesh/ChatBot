const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
console.log('📦 bookingRoutes loaded');

router.get('/slots', controller.getAvailableSlots);
router.post('/admin/slots', controller.addAvailableSlot);
router.post('/book', controller.createBooking);
router.post('/cancel', controller.cancelBooking);
router.get('/appointments', controller.getAppointments);

module.exports = router;
