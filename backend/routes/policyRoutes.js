const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');

router.post('/activate', policyController.activatePolicy);

module.exports = router;
