const { calculateRiskAndPremium } = require('../services/premiumService');
const { getWeatherData } = require('../services/weatherService');
const { getAirQualityData } = require('../services/aqiService');
const { fetchTraffic } = require('../services/trafficService');

exports.calculatePremium = (req, res) => {
  try {
    const { rainfall, aqi, traffic } = req.body;

    if (rainfall === undefined || aqi === undefined || traffic === undefined) {
      return res.status(400).json({ success: false, message: "Missing environmental parameters (rainfall, aqi, traffic)" });
    }

    const premiumData = calculateRiskAndPremium({ rainfall, aqi, traffic });
    res.json(premiumData);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.calculateLivePremium = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    // ✅ Proper validation
    if (lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required."
      });
    }

    // ✅ SAFE FETCH (no crash even if API fails)
    let weather = {};
    let aqiData = {};

    try {
      weather = await getWeatherData(lat, lon, 1);
    } catch (err) {
      console.warn("Weather failed:", err.message);

      // ✅ Fallback
      weather = {
        rainfall_mm: 0,
        rain_status: "unavailable",
        weather_condition: "unknown",
        temperature: 0
      };
    }

    try {
      aqiData = await getAirQualityData(lat, lon, 1);
    } catch (err) {
      console.warn("AQI failed:", err.message);

      // ✅ Fallback
      aqiData = {
        aqi: 0,
        aqi_status: "unavailable"
      };
    }

    // ✅ Safe extraction
    let rainfall = Number(weather?.rainfall_mm) || 0;
    let aqi = Number(aqiData?.aqi) || 0;

    // 🚗 Traffic (optional)
    let trafficCongestion = 0;

    const hasTomTomKey =
      process.env.TOMTOM_API_KEY &&
      process.env.TOMTOM_API_KEY !== "your_tom_tom_api_key_here";
    console.log("TomTom Key:", process.env.TOMTOM_API_KEY);
    console.log(hasTomTomKey);
    
    if (hasTomTomKey) {
      try {
        const trafficData = await fetchTraffic(lat, lon);
        trafficCongestion = Math.round((1 - trafficData.ratio) * 100);
      } catch (trafficErr) {
        console.warn("Traffic failed:", trafficErr.message);
      }
    }

    // ✅ FINAL CALCULATION
    const premiumData = calculateRiskAndPremium({
      rainfall,
      aqi,
      traffic: trafficCongestion
    });

    // ✅ RESPONSE
    res.json({
      success: true,
      ...premiumData,
      env: {
        rainfall_mm: rainfall,
        rain_status: weather?.rain_status || "unknown",
        weather_condition: weather?.weather_condition || "unknown",
        temperature: weather?.temperature || 0,
        aqi: aqi,
        aqi_status: aqiData?.aqi_status || "unknown",
        traffic_congestion: trafficCongestion
      }
    });

  } catch (err) {
    console.error("Live Premium Error:", err);

    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};