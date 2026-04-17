const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// MODULE 1: Loss Ratio Analytics
// GET /admin/stats?period=daily|weekly|monthly|all
router.get('/stats', adminController.getStats);

// MODULE 2: Predictive Analytics
// GET /admin/predict?lat=13.08&lon=80.27
router.get('/predict', adminController.getPrediction);

// MODULE 3: Risk Heatmap
// GET /admin/risk-map
router.get('/risk-map', adminController.getRiskMap);

// MODULE 4: Fraud Analytics
// GET /admin/fraud
router.get('/fraud', adminController.getFraud);

module.exports = router;
