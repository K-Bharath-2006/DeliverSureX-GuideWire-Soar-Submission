const { fetchAndRankRoutes } = require('./routingService');

/**
 * Validates whether a viable alternate route exists for a given location.
 * Used by the claim decision engine.
 *
 * A routeScore close to 1 means the route is heavily blocked (no easy alternate).
 * A routeScore close to 0 means alternate routes are freely available.
 *
 * @param {object} params
 * @param {object} params.currentLocation  - { lat, lon }
 * @param {object} [params.destination]    - { lat, lon } optional—uses nearby offset if omitted
 */
const validateRoute = async ({ currentLocation, destination }) => {
  // If no real destination, synthesise a point ~500 m north as a proxy
  const lat = currentLocation?.lat ?? 0;
  const lon = currentLocation?.lon ?? 0;
  const destLat = destination?.lat ?? lat + 0.005;
  const destLon = destination?.lon ?? lon;

  if (!process.env.TOMTOM_API_KEY || process.env.TOMTOM_API_KEY === 'your_tom_tom_api_key_here') {
    // Fallback when no API key is configured
    return { routeScore: 0.85 };
  }

  try {
    const routes = await fetchAndRankRoutes(lat, lon, destLat, destLon);

    // If ALL ranked routes have HIGH trafficLevel → routeScore is high (truly blocked)
    const highTrafficCount = routes.filter((r) => r.trafficLevel === 'HIGH').length;
    const blockRatio = highTrafficCount / routes.length;

    // routeScore: 1 = fully blocked (supports claim), 0 = open alternate exists
    const routeScore = parseFloat(blockRatio.toFixed(2));

    return {
      routeScore,
      alternateRoutesFound: routes.length,
      bestRouteDelay: routes[0]?.trafficDelayMinutes ?? null,
    };
  } catch (err) {
    console.error('⚠️ routeService fallback (TomTom error):', err.message);
    // Generous fallback — assume moderate block
    return { routeScore: 0.85 };
  }
};

module.exports = { validateRoute };
