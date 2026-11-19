const express = require('express');
const router = express.Router();
const { getSecureFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

router.get('/:fileType/:id', protect, getSecureFile);

module.exports = router;
