const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');

router.post('/report', claimController.reportClaim);
router.get('/user/:userId', claimController.getUserClaims);

module.exports = router;
