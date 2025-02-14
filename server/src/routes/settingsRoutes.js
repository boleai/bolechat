const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/apikey', settingsController.getApiKey);
router.post('/apikey', settingsController.saveApiKey);

module.exports = router; 