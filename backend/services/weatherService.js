const apiClient = require("../utils/apiClient");

// 🌧 Rain Status
const getRainStatus = (rainfall) => {
  if (rainfall === 0) return "No Rain";
  if (rainfall <= 2.5) return "Light Rain";
  if (rainfall <= 7.6) return "Moderate Rain";
  return "Heavy Rain";
};

// 🌦 Weather Condition
const getWeatherCondition = (code) => {
  if (code === 0) return "Clear Sky ☀️";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy ☁️";
  if ([45, 48].includes(code)) return "Fog 🌫";
  if ([51, 53, 55].includes(code)) return "Drizzle 🌦";
  if ([61, 63, 65].includes(code)) return "Rain 🌧";
  if ([71, 73, 75].includes(code)) return "Snow ❄️";
  if ([95, 96, 99].includes(code)) return "Thunderstorm ⛈";
  return "Unknown";
};

const getWeatherData = async (lat, lon, duration = 1) => {
  try {
    const url = "https://api.open-meteo.com/v1/forecast";

    console.log("🌍 Calling Weather API:", { lat, lon });

    const response = await apiClient.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: "rain",
        timezone: "auto",
      },
      timeout: 5000, // ⏱ prevent hanging
    });

    const data = response.data;

    console.log("✅ Weather API Response received");

    // ✅ SAFE VALIDATION (NO THROW)
    if (!data || !data.current_weather) {
      console.warn("⚠ Invalid weather response, using fallback");

      return {
        rainfall_mm: 0,
        rain_status: "fallback",
        weather_condition: "unknown",
        temperature: 0,
        is_raining: false,
      };
    }

    const current = data.current_weather;

    let rainfall = data?.hourly?.rain?.[0] || 0;
    let isRaining = rainfall > 0;

    // 🧠 Historical Rain Check
    if (data.hourly?.time && data.hourly?.rain) {
      const currentIndex = data.hourly.time.indexOf(current.time);

      if (currentIndex !== -1) {
        const startIndex = Math.max(0, currentIndex - duration + 1);

        let maxRain = 0;
        for (let i = startIndex; i <= currentIndex; i++) {
          if (data.hourly.rain[i] > maxRain) {
            maxRain = data.hourly.rain[i];
          }
        }

        rainfall = maxRain;
        isRaining = maxRain > 0;
      }
    }

    return {
      location: {
        lat: data.latitude,
        lon: data.longitude,
      },
      temperature: current.temperature,
      windspeed: current.windspeed,
      rainfall_mm: rainfall,
      rain_status: getRainStatus(rainfall),
      is_raining: isRaining,
      weather_code: current.weathercode,
      weather_condition: getWeatherCondition(current.weathercode),
      timestamp: current.time,
    };

  } catch (error) {
    // 🔍 FULL ERROR DEBUG (IMPORTANT)
    console.error("❌ FULL WEATHER ERROR:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    // ✅ NEVER CRASH → RETURN FALLBACK
    return {
      rainfall_mm: 0,
      rain_status: "fallback",
      weather_condition: "unknown",
      temperature: 0,
      is_raining: false,
    };
  }
};

module.exports = {
  getWeatherData,
};