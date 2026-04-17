const { getRiskScore } = require('./mlRiskService');

const makeDecision = ({ activityScore, environmentScore, crowdScore, routeScore, rainfall, aqi, traffic }) => {
  
  // 1. Get ML risk score using parameters
  const { riskScore, riskLevel } = getRiskScore({
    rainfall,
    aqi,
    traffic,
    activityScore,
    crowdScore,
    routeScore
  });

  let decision = 'Review';
  let reason = '';

  // 2. Apply Rule-based explicit validation heuristics
  if (activityScore < 0.3) {
    decision = 'Rejected';
    reason = 'Likely fraud: Insufficient or off-route delivery activity detected.';
  } else if (crowdScore === 0 && routeScore < 0.5) {
    decision = 'Rejected';
    reason = 'No active crowd disruption, and an alternate route exists.';
  } else {
    // 3. Final Machine Learning Decision Matrix
    if (riskScore > 0.7) {
      decision = 'Approved';
      reason = 'High AI Risk Score validated disruption.';
    } else if (riskScore > 0.4) {
      decision = 'Review';
      reason = 'Moderate Risk. Requires manual overview.';
    } else {
      decision = 'Rejected';
      reason = 'Low Risk Scenario. Disruption not verified by AI models.';
    }
  }

  return {
    riskScore,
    decision,
    reason,
    breakdown: {
      activityScore: Math.round(activityScore * 100) / 100,
      environmentScore: Math.round(environmentScore * 100) / 100,
      crowdScore: Math.round(crowdScore * 100) / 100,
      routeScore: Math.round(routeScore * 100) / 100
    }
  };
};

module.exports = { makeDecision };
