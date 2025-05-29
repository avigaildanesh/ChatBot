// server/routes/userRoutes.js
const express = require('express');
const router  = express.Router();
const { createUser } = require('../controllers/userController');

// עכשיו ה־POST יהיה על /api/user/ (ולא על /api/user/user)
router.post('/', createUser);

module.exports = router;
