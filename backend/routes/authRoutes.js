const express = require('express');
const router = express.Router();
const { registerPatient, registerDoctor, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/patient', registerPatient);
router.post('/register/doctor', registerDoctor);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully' }));

module.exports = router;
