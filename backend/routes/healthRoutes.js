const express = require('express');
const router = express.Router();
const { isDbConnected } = require('../config/db');

router.get('/', (req, res) => {
  const dbStatus = isDbConnected();
  res.json({
    status: 'ok',
    mode: 'live',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus,
      statusText: dbStatus ? 'Connected to MongoDB' : 'Disconnected (Backend is online, DB offline)'
    },
    version: '1.0.0'
  });
});

module.exports = router;
