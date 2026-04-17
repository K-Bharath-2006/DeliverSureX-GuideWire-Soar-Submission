const express = require('express');
const router = express.Router();
const routingController = require('../controllers/routingController');

// POST /api/routing/smart-route
router.post('/smart-route', routingController.getSmartRoute);

module.exports = router;
