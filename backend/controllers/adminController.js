const {
  getLossRatioStats,
  getRiskHeatmap,
  getFraudAnalytics,
} = require('../services/adminAnalyticsService');

const { getPredictiveAnalytics } = require('../services/adminPredictionService');

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/stats?period=daily|weekly|monthly|all
// MODULE 1: Loss Ratio Analytics
// ─────────────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const period = req.query.period || 'all';
    const validPeriods = ['daily', 'weekly', 'monthly', 'all'];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: `Invalid period. Use: ${validPeriods.join(', ')}`,
      });
    }

    const stats = await getLossRatioStats(period);

    return res.json({ success: true, ...stats });
  } catch (err) {
    console.error('❌ /admin/stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/predict?lat=&lon=
// MODULE 2: Predictive Analytics
// ─────────────────────────────────────────────────────────────────────────────
exports.getPrediction = async (req, res) => {
  try {
    // Allow optional lat/lon override for city-specific prediction
    const lat = parseFloat(req.query.lat) || 13.0827; // Default: Chennai
    const lon = parseFloat(req.query.lon) || 80.2707;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, message: 'Invalid lat/lon coordinates.' });
    }

    const prediction = await getPredictiveAnalytics(lat, lon);

    return res.json({ success: true, ...prediction });
  } catch (err) {
    console.error('❌ /admin/predict error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/risk-map
// MODULE 3: Risk Heatmap Data
// ─────────────────────────────────────────────────────────────────────────────
exports.getRiskMap = async (req, res) => {
  try {
    const heatmap = await getRiskHeatmap();

    return res.json({
      success: true,
      total_zones: heatmap.length,
      zones: heatmap,
    });
  } catch (err) {
    console.error('❌ /admin/risk-map error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/fraud
// MODULE 4: Fraud Analytics
// ─────────────────────────────────────────────────────────────────────────────
exports.getFraud = async (req, res) => {
  try {
    const fraud = await getFraudAnalytics();

    return res.json({ success: true, ...fraud });
  } catch (err) {
    console.error('❌ /admin/fraud error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
