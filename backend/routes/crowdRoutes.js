const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');

router.post('/verify', crowdController.verifyCrowd);

module.exports = router;
