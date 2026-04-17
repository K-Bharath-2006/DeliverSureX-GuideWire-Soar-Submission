const User = require('../models/User');
const Claim = require('../models/Claim');
const Delivery = require('../models/Delivery');
const FormData = require('form-data');
const axios = require('axios');

const { getAirQualityData } = require('../services/aqiService');
const { getWeatherData } = require('../services/weatherService');
const { fetchTraffic } = require('../services/trafficService');

const { verifyActivity } = require('../services/activityService');
const { validateRoute } = require('../services/routeService');
const { makeDecision } = require('../services/decisionService');

exports.reportClaim = async (req, res) => {
  try {
    const { userId, disruptionType, lat, lon, duration, imageBase64 } = req.body;
    
    // Default duration to 1 if missing
    const claimDuration = duration ? Number(duration) : 1;
    
    if (!lat || !lon) {
       return res.status(400).json({ success: false, message: 'Location data (lat, lon) is required for verification.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fraud Check: No policy -> reject
    if (!user.policyActive) {
      const claim = new Claim({ userId, disruptionType, duration: claimDuration, status: 'Rejected', reason: 'No active policy' });
      await claim.save();
      return res.json({ success: true, claim });
    }

    // 1. Fetch Environment Data (with fallbacks)
    let rainfall = 0;
    let aqi = 0;
    let traffic = 0;

    try {
      const weather = await getWeatherData(lat, lon, claimDuration);
      rainfall = Number(weather?.rainfall_mm) || 0;
    } catch(e) {}
    
    try {
      const aqiData = await getAirQualityData(lat, lon, claimDuration);
      aqi = Number(aqiData?.aqi) || 0;
    } catch(e) {}
    
    if (process.env.TOMTOM_API_KEY && process.env.TOMTOM_API_KEY !== 'your_tom_tom_api_key_here') {
       try {
          const trafficData = await fetchTraffic(lat, lon);
          traffic = Math.round((1 - trafficData.ratio) * 100);
       } catch(e) {}
    }
    
    const environmentScore = Math.min(((rainfall/100)*0.4 + (aqi/500)*0.3 + (traffic/100)*0.3), 1);

    // 2. Fetch Activity & Route Scores (Simulated via services)
    const { activityScore } = verifyActivity({ orderStatus: 'active' });
    const { routeScore } = await validateRoute({ currentLocation: {lat, lon} });

    // 3. Crowd Detection Module Logic
    let crowdScore = 0;
    if (disruptionType === 'Crowd' && imageBase64) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const form = new FormData();
        form.append('file', imageBuffer, { filename: 'upload.jpg', contentType: 'image/jpeg' });
        
        // POST to external AI microservice
        const crowdRes = await axios.post('https://deliversurex-soar-backend.onrender.com/detect', form, {
          headers: form.getHeaders(),
          timeout: 15000 
        });
        
        if (crowdRes.data && !crowdRes.data.error) {
           const density = crowdRes.data.density;
           if (density === 'HIGH') crowdScore = 1.0;
           else if (density === 'MEDIUM') crowdScore = 0.6;
           else crowdScore = 0.2;
        } else {
           console.error("FastAPI Error:", crowdRes.data.error);
        }
      } catch (err) {
        console.error("FastAPI Crowd API Error:", err.message);
      }
    }

    // 4. Run AI Decision Engine
    const decisionResult = makeDecision({
      activityScore, environmentScore, crowdScore, routeScore, rainfall, aqi, traffic
    });

    const predictedIncomePerHour = 120;
    let amount = 0;
    if (decisionResult.decision === 'Approved') amount = predictedIncomePerHour * claimDuration;
    
    let finalStatus = decisionResult.decision;
    if (finalStatus === 'Review') finalStatus = 'Pending'; // Match DB schema enums

    // Save Claim with full breakdown
    const claim = new Claim({ 
      userId, 
      disruptionType, 
      duration: claimDuration, 
      hasImage: !!imageBase64,
      status: finalStatus, 
      amount, 
      reason: decisionResult.reason,
      riskScore: decisionResult.riskScore,
      breakdown: decisionResult.breakdown
    });
    await claim.save();

    // ── Auto-create Delivery record for admin analytics ───────────────────────
    try {
      // Derive crowd density label from crowdScore
      let crowdDensity = 'LOW';
      if (crowdScore >= 0.8) crowdDensity = 'HIGH';
      else if (crowdScore >= 0.4) crowdDensity = 'MEDIUM';

      // Derive route risk label from routeScore
      let routeRisk = 'LOW';
      if (routeScore >= 0.8) routeRisk = 'HIGH';
      else if (routeScore >= 0.5) routeRisk = 'MEDIUM';

      // Lookup premium from user's weekly plan (fallback to 30)
      const userPremium = 30;

      await new Delivery({
        userId,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        crowdDensity,
        routeRisk,
        fraudScore: parseFloat(decisionResult.riskScore.toFixed(3)),
        premium: userPremium,
        claimAmount: amount,
        status: finalStatus.toUpperCase(),
        claimId: claim._id,
        disruptionType,
      }).save();
    } catch (deliveryErr) {
      // Non-blocking — analytics failure must never break claim flow
      console.warn('⚠️ Delivery record creation failed (non-critical):', deliveryErr.message);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return res.json({ success: true, claim });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
