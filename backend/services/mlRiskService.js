const getRiskScore = ({ rainfall, aqi, traffic, activityScore, crowdScore, routeScore }) => {
  // Normalize inputs
  const rainfall_norm = Math.min((rainfall || 0) / 100, 1);
  const aqi_norm = Math.min((aqi || 0) / 500, 1);
  const traffic_norm = Math.min((traffic || 0) / 100, 1);
  
  // Weights defined in ML model design
  const riskScore = 
    (0.25 * rainfall_norm) +
    (0.20 * aqi_norm) +
    (0.20 * traffic_norm) +
    (0.15 * (activityScore || 0)) +
    (0.10 * (crowdScore || 0)) +
    (0.10 * (routeScore || 0));

  // Clamp the score between 0 and 1
  const finalRiskScore = Math.min(Math.max(riskScore, 0), 1);

  let riskLevel = 'Low';
  if (finalRiskScore > 0.7) riskLevel = 'High';
  else if (finalRiskScore > 0.4) riskLevel = 'Medium';

  return {
    riskScore: Number(finalRiskScore.toFixed(2)),
    riskLevel,
    confidence: 0.85 // Mock confidence metric
  };
};

module.exports = { getRiskScore };
