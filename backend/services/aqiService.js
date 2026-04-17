const apiClient = require("../utils/apiClient");

const getAQIStatus = (aqi) => {
  if (aqi <= 50) return "Good 🟢";
  if (aqi <= 100) return "Moderate 🟡";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups 🟠";
  if (aqi <= 200) return "Unhealthy 🔴";
  if (aqi <= 300) return "Very Unhealthy 🟣";
  return "Hazardous ⚫";
};

const getHealthAdvice = (aqi) => {
  if (aqi <= 50) return "Air quality is safe for everyone.";
  if (aqi <= 100) return "Sensitive people should reduce prolonged outdoor exertion.";
  if (aqi <= 150) return "Children, elderly, and sensitive groups should limit outdoor activity.";
  if (aqi <= 200) return "Everyone should reduce outdoor activity.";
  if (aqi <= 300) return "Avoid outdoor activity. Wear masks if necessary.";
  return "Health alert! Avoid going outside.";
};

const getAirQualityData = async (lat, lon, duration = 1) => {
  try {
    const url = "https://air-quality-api.open-meteo.com/v1/air-quality";

    const response = await apiClient.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        current: "pm2_5,pm10,us_aqi",
        hourly: "us_aqi",
        timezone: "auto",
      },
    });

    const data = response.data;

    if (!data || !data.current) {
      throw new Error("Invalid AQI data received");
    }

    const current = data.current;
    let aqi = current.us_aqi;
    let isPolluted = aqi > 100;

    // Check historical duration
    if (data.hourly && data.hourly.time && data.hourly.us_aqi) {
        const currentTimeString = current.time;
        const currentIndex = data.hourly.time.indexOf(currentTimeString);
        
        if (currentIndex !== -1) {
            // we want to check from (currentIndex - duration + 1) to currentIndex
            const startIndex = Math.max(0, currentIndex - duration + 1);
            let maxAqiInWindow = aqi;
            
            for (let i = startIndex; i <= currentIndex; i++) {
                const hourlyAqi = data.hourly.us_aqi[i];
                if (hourlyAqi > maxAqiInWindow) {
                    maxAqiInWindow = hourlyAqi;
                }
            }
            
            // if the maximum AQI during this duration was polluted, we consider it valid for disruption.
            aqi = maxAqiInWindow;
            isPolluted = maxAqiInWindow > 100;
        }
    }

    const aqiStatus = getAQIStatus(aqi);
    const healthAdvice = getHealthAdvice(aqi);

    return {
      location: {
        lat: data.latitude,
        lon: data.longitude,
      },
      aqi: aqi,
      aqi_status: aqiStatus,
      is_polluted: isPolluted,
      pm2_5: current.pm2_5,
      pm10: current.pm10,
      health_advice: healthAdvice,
      timestamp: current.time,
    };

  } catch (error) {
    console.error("AQI Service Error:", error.message);
    throw new Error("Failed to fetch AQI data");
  }
};

module.exports = {
  getAirQualityData,
};
