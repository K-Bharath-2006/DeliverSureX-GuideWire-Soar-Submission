const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');

router.post('/', premiumController.calculatePremium);
router.post('/live', premiumController.calculateLivePremium);

module.exports = router;
