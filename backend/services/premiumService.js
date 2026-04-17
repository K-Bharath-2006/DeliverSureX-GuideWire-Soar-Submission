const { getRiskScore } = require('./mlRiskService');

const calculateRiskAndPremium = ({ rainfall, aqi, traffic }) => {
  
  // To match the new AI Engine, we just use the ML Risk Service directly.
  // Activity, Crowd, and Route scores are explicitly related to claims and not the standard live premium, 
  // so we default them to 0 or neutral states for live pricing.
  const { riskScore, riskLevel } = getRiskScore({
     rainfall,
     aqi,
     traffic,
     activityScore: 1, // assume good activity for pricing
     crowdScore: 0,
     routeScore: 1 // assume good route for pricing
  });

  let premium = 30; // base < 0.4 (> 0.3)
  let note = "Standard environmental risk";

  if (riskScore > 0.7) {
    premium = 50;
    note = "High risk zone - increased coverage";
  } else if (riskScore > 0.4) {
    premium = 40;
  } else if (riskScore < 0.3) {
    premium = 28;
    note = "Safe zone - discounted coverage";
  }

  return {
    riskScore,
    riskLevel,
    premium,
    coverage: "Standard AI",
    note
  };
};

module.exports = { calculateRiskAndPremium };
