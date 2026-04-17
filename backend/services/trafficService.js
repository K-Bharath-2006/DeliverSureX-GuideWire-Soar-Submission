const apiClient = require("../utils/apiClient");
const { TOMTOM_API_KEY } = require("../config/config");

const fetchTraffic = async (lat, lon) => {
  try {
    const response = await apiClient.get(
      "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json",
      {
        params: {
          point: `${lat},${lon}`,
          key: TOMTOM_API_KEY,
        },
      }
    );

    const data = response.data?.flowSegmentData;

    // 🔍 Debug full response if needed
    if (!data) {
      console.warn("⚠ No flowSegmentData:", response.data);
    }

    // ❗ Safety check
    if (!data || data.currentSpeed == null || data.freeFlowSpeed == null) {
      console.warn("⚠ Invalid traffic data → using fallback");

      return {
        ratio: 0.5,
        traffic: "Estimated Traffic ⚠️",
        traffic_congestion: 50,
      };
    }
    
    const currentSpeed = data.currentSpeed;
    const freeFlowSpeed = data.freeFlowSpeed;

    // ❗ Avoid division by zero
    if (freeFlowSpeed === 0) {
      console.warn("⚠ freeFlowSpeed is 0 → fallback");

      return {
        ratio: 0.5,
        traffic: "Estimated Traffic ⚠️",
        traffic_congestion: 50,
      };
    }

    const ratio = currentSpeed / freeFlowSpeed;

    // ❗ Handle NaN case
    if (isNaN(ratio)) {
      console.warn("⚠ Ratio is NaN → fallback");

      return {
        ratio: 0.5,
        traffic: "Estimated Traffic ⚠️",
        traffic_congestion: 50,
      };
    }

    let trafficStatus = "";
    let congestion = Math.round((1 - ratio) * 100);

    if (ratio > 0.8) {
      trafficStatus = "Smooth Traffic ✅";
    } else if (ratio > 0.5) {
      trafficStatus = "Moderate Traffic ⚠️";
    } else {
      trafficStatus = "Heavy Traffic 🚦";
    }

    
    return {
      latitude: lat,
      longitude: lon,
      currentSpeed,
      freeFlowSpeed,
      confidence: data.confidence,
      roadClosure: data.roadClosure,
      traffic: trafficStatus,
      ratio: ratio,
      traffic_congestion: congestion,
    };

  } catch (err) {
    console.error("❌ Traffic API Error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });

    // 🔥 Smart fallback (random realistic value)
    const fallbackRatio = 0.4 + Math.random() * 0.3;

    return {
      ratio: fallbackRatio,
      traffic: "Fallback Traffic ⚠️",
      traffic_congestion: Math.round((1 - fallbackRatio) * 100),
    };
  }
};

module.exports = { fetchTraffic };