const apiClient = require('../utils/apiClient');
const { TOMTOM_API_KEY } = require('../config/config');

/**
 * Fetch multiple routes from TomTom Routing API
 * and extract/rank the key metrics.
 *
 * @param {number} originLat
 * @param {number} originLon
 * @param {number} destLat
 * @param {number} destLon
 * @returns {Promise<Array>} ranked list of route objects
 */
const fetchAndRankRoutes = async (originLat, originLon, destLat, destLon) => {
  const url = `https://api.tomtom.com/routing/1/calculateRoute/${originLat},${originLon}:${destLat},${destLon}/json`;

  const response = await apiClient.get(url, {
    params: {
      key: TOMTOM_API_KEY,
      maxAlternatives: 3,
      routeType: 'fastest',
      traffic: true,
      travelMode: 'car',
    },
  });

  const routes = response.data?.routes;
  if (!routes || routes.length === 0) {
    throw new Error('No routes returned by TomTom API');
  }

  // Extract key metrics from each route
  const extracted = routes.map((route, index) => {
    const summary = route.summary;

    const travelTimeSeconds = summary.travelTimeInSeconds ?? 0;
    const trafficDelaySeconds = summary.trafficDelayInSeconds ?? 0;
    const lengthMeters = summary.lengthInMeters ?? 0;
    const departureTime = summary.departureTime ?? null;
    const arrivalTime = summary.arrivalTime ?? null;

    // Congestion ratio: 0 = no delay, 1 = fully blocked
    const noTrafficTravelTime = summary.noTrafficTravelTimeInSeconds ?? travelTimeSeconds;
    const congestionRatio =
      noTrafficTravelTime > 0
        ? Math.min(trafficDelaySeconds / noTrafficTravelTime, 1)
        : 0;

    // Traffic level classification
    let trafficLevel = 'LOW';
    if (congestionRatio > 0.4) trafficLevel = 'HIGH';
    else if (congestionRatio > 0.15) trafficLevel = 'MEDIUM';

    return {
      routeIndex: index + 1,
      travelTimeSeconds,
      travelTimeMinutes: Math.round(travelTimeSeconds / 60),
      trafficDelaySeconds,
      trafficDelayMinutes: Math.round(trafficDelaySeconds / 60),
      lengthMeters,
      lengthKm: (lengthMeters / 1000).toFixed(2),
      congestionRatio: parseFloat(congestionRatio.toFixed(3)),
      trafficLevel,
      departureTime,
      arrivalTime,
      // Keep the raw points for potential map rendering
      legs: route.legs?.length ?? 1,
    };
  });

  // Rank: primary key = lowest trafficDelaySeconds, secondary = shortest travelTimeSeconds
  const ranked = [...extracted].sort((a, b) => {
    if (a.trafficDelaySeconds !== b.trafficDelaySeconds) {
      return a.trafficDelaySeconds - b.trafficDelaySeconds;
    }
    return a.travelTimeSeconds - b.travelTimeSeconds;
  });

  // Tag each with its rank
  ranked.forEach((route, idx) => {
    route.rank = idx + 1;
  });

  return ranked;
};

module.exports = { fetchAndRankRoutes };
