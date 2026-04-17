const Delivery = require('../models/Delivery');
const Claim = require('../models/Claim');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a date-range filter from a period string
// ─────────────────────────────────────────────────────────────────────────────
const buildDateFilter = (period = 'all') => {
  const now = new Date();
  if (period === 'daily') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { createdAt: { $gte: start } };
  }
  if (period === 'weekly') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { createdAt: { $gte: start } };
  }
  if (period === 'monthly') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    return { createdAt: { $gte: start } };
  }
  return {}; // 'all'
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1 — Loss Ratio Analytics
// GET /admin/stats?period=daily|weekly|monthly|all
// ─────────────────────────────────────────────────────────────────────────────
const getLossRatioStats = async (period = 'all') => {
  const dateFilter = buildDateFilter(period);

  // Aggregate from Delivery collection
  const [result] = await Delivery.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        total_premium: { $sum: '$premium' },
        total_claims: { $sum: '$claimAmount' },
        total_deliveries: { $sum: 1 },
        approved_count: {
          $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] },
        },
        rejected_count: {
          $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
        },
      },
    },
  ]);

  const total_premium = result?.total_premium ?? 0;
  const total_claims = result?.total_claims ?? 0;
  const total_deliveries = result?.total_deliveries ?? 0;

  const loss_ratio =
    total_premium > 0
      ? parseFloat((total_claims / total_premium).toFixed(4))
      : 0;

  // ── Weekly trend: compare this week vs last week ──────────────────────────
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 14);

  const [thisWeek] = await Delivery.aggregate([
    { $match: { createdAt: { $gte: thisWeekStart } } },
    { $group: { _id: null, claims: { $sum: '$claimAmount' }, premium: { $sum: '$premium' } } },
  ]);

  const [lastWeek] = await Delivery.aggregate([
    { $match: { createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } } },
    { $group: { _id: null, claims: { $sum: '$claimAmount' }, premium: { $sum: '$premium' } } },
  ]);

  const thisRatio = thisWeek?.premium > 0 ? thisWeek.claims / thisWeek.premium : 0;
  const lastRatio = lastWeek?.premium > 0 ? lastWeek.claims / lastWeek.premium : 0;
  const trend_change = parseFloat((thisRatio - lastRatio).toFixed(4));

  // ── Alert if loss ratio > 70% ─────────────────────────────────────────────
  const alert =
    loss_ratio > 0.7
      ? '⚠️ ALERT: Loss ratio exceeds 70%. Review underwriting policies immediately.'
      : null;

  return {
    total_premium,
    total_claims,
    loss_ratio,
    total_deliveries,
    approved_count: result?.approved_count ?? 0,
    rejected_count: result?.rejected_count ?? 0,
    period,
    weekly_trend: {
      this_week_ratio: parseFloat(thisRatio.toFixed(4)),
      last_week_ratio: parseFloat(lastRatio.toFixed(4)),
      change: trend_change,
      direction: trend_change > 0 ? 'UP 📈' : trend_change < 0 ? 'DOWN 📉' : 'STABLE ↔',
    },
    alert,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 3 — Risk Heatmap Data
// GET /admin/risk-map
// ─────────────────────────────────────────────────────────────────────────────
const getRiskHeatmap = async () => {
  // Group by approximate 2-decimal lat/lon (~1.1 km grid)
  const zones = await Delivery.aggregate([
    {
      $group: {
        _id: {
          lat: { $round: ['$lat', 2] },
          lon: { $round: ['$lon', 2] },
        },
        incident_count: { $sum: 1 },
        total_claim: { $sum: '$claimAmount' },
        avg_fraud_score: { $avg: '$fraudScore' },
        high_crowd_count: {
          $sum: { $cond: [{ $eq: ['$crowdDensity', 'HIGH'] }, 1, 0] },
        },
      },
    },
    { $sort: { incident_count: -1 } },
    { $limit: 200 },
  ]);

  return zones.map((z) => {
    const densityRatio = z.incident_count > 0 ? z.high_crowd_count / z.incident_count : 0;
    const fraudRisk = z.avg_fraud_score ?? 0;

    // Composite risk score for the zone
    const zoneScore = 0.5 * densityRatio + 0.3 * fraudRisk + 0.2 * Math.min(z.incident_count / 20, 1);

    let risk_level = 'LOW';
    if (zoneScore > 0.6) risk_level = 'HIGH';
    else if (zoneScore > 0.3) risk_level = 'MEDIUM';

    return {
      lat: z._id.lat,
      lon: z._id.lon,
      risk_level,
      incident_count: z.incident_count,
      total_claim_amount: z.total_claim,
      avg_fraud_score: parseFloat((fraudRisk).toFixed(3)),
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 4 — Fraud Analytics
// GET /admin/fraud
// ─────────────────────────────────────────────────────────────────────────────
const getFraudAnalytics = async () => {
  // Per-user fraud aggregation
  const userFraud = await Delivery.aggregate([
    {
      $group: {
        _id: '$userId',
        avg_fraud_score: { $avg: '$fraudScore' },
        total_claims: { $sum: 1 },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
        },
        total_claim_amount: { $sum: '$claimAmount' },
      },
    },
    { $sort: { avg_fraud_score: -1 } },
  ]);

  // Total flagged = fraud score > 0.6
  const HIGH_FRAUD_THRESHOLD = 0.6;
  const flaggedUsers = userFraud.filter((u) => u.avg_fraud_score > HIGH_FRAUD_THRESHOLD);
  const total_flagged = flaggedUsers.length;

  const high_risk_users = flaggedUsers.map((u) => ({
    userId: u._id,
    avg_fraud_score: parseFloat(u.avg_fraud_score.toFixed(3)),
    total_claims: u.total_claims,
    rejected: u.rejected,
  }));

  // Rejected claims count from Claim model directly
  const rejected_claims = await Claim.countDocuments({ status: 'Rejected' });

  // Fraud patterns: most common disruption type in flagged deliveries
  const [fraudPattern] = await Delivery.aggregate([
    { $match: { fraudScore: { $gt: HIGH_FRAUD_THRESHOLD } } },
    { $group: { _id: '$disruptionType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  return {
    total_flagged,
    high_risk_users,
    rejected_claims,
    fraud_threshold_used: HIGH_FRAUD_THRESHOLD,
    most_common_fraud_type: fraudPattern?._id ?? 'N/A',
  };
};

module.exports = {
  getLossRatioStats,
  getRiskHeatmap,
  getFraudAnalytics,
};
