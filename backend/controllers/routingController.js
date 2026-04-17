const { fetchAndRankRoutes } = require('../services/routingService');

/**
 * POST /api/routing/smart-route
 * Body: { originLat, originLon, destLat, destLon, crowdDensity }
 * crowdDensity: "LOW" | "MEDIUM" | "HIGH"
 */
exports.getSmartRoute = async (req, res) => {
  try {
    const { originLat, originLon, destLat, destLon, crowdDensity = 'LOW' } = req.body;

    // ── Input Validation ──────────────────────────────────────────────
    if (!originLat || !originLon || !destLat || !destLon) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required.',
      });
    }

    const density = String(crowdDensity).toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(density)) {
      return res.status(400).json({
        success: false,
        message: 'crowdDensity must be LOW, MEDIUM, or HIGH.',
      });
    }

    // ── Step 1 & 2: Fetch routes + extract metrics ────────────────────
    let rankedRoutes;
    try {
      rankedRoutes = await fetchAndRankRoutes(
        parseFloat(originLat),
        parseFloat(originLon),
        parseFloat(destLat),
        parseFloat(destLon)
      );
    } catch (apiErr) {
      console.error('❌ TomTom Routing API Error:', apiErr.message);
      return res.status(502).json({
        success: false,
        message: 'Failed to fetch routes from TomTom API.',
        error: apiErr.message,
      });
    }

    // ── Step 3 & 4: Apply Crowd Density Logic ────────────────────────
    let selectedRoute = null;
    let riskLevel = 'LOW';
    let message = '';
    let triggerInsurance = false;

    if (density === 'LOW') {
      // Simply pick the fastest (rank 1 is already lowest delay + shortest time)
      selectedRoute = rankedRoutes[0];
      riskLevel = selectedRoute.trafficLevel === 'HIGH' ? 'MEDIUM' : 'LOW';
      message = `✅ Fastest route selected. Traffic delay: ${selectedRoute.trafficDelayMinutes} min.`;

    } else if (density === 'MEDIUM') {
      // Prefer a "balanced" route — avoid HIGH traffic, pick lowest rank that is not HIGH
      const balanced = rankedRoutes.find((r) => r.trafficLevel !== 'HIGH');
      selectedRoute = balanced ?? rankedRoutes[0]; // fallback to best available
      riskLevel = selectedRoute.trafficLevel === 'HIGH' ? 'MEDIUM' : 'LOW';
      message = selectedRoute.trafficLevel === 'HIGH'
        ? `⚠️ No clean route found. Best available route selected with moderate congestion.`
        : `✅ Balanced route selected. Travel time: ${selectedRoute.travelTimeMinutes} min.`;

    } else {
      // HIGH crowd density — avoid routes with HIGH traffic
      const safeRoute = rankedRoutes.find((r) => r.trafficLevel !== 'HIGH');

      if (safeRoute) {
        selectedRoute = safeRoute;
        riskLevel = 'LOW';
        message = `✅ Safe alternate route found avoiding high-traffic zones. ETA: ${selectedRoute.travelTimeMinutes} min.`;
      } else {
        // All routes have HIGH traffic → mark HIGH RISK
        selectedRoute = rankedRoutes[0]; // still provide the least-bad route
        riskLevel = 'HIGH';
        triggerInsurance = true;
        message = `🚨 HIGH RISK: All routes show heavy traffic under crowd conditions. Insurance claim logic triggered.`;
      }
    }

    // ── Step 5 & 6: Build Response ────────────────────────────────────
    return res.json({
      success: true,
      crowdDensity: density,
      selectedRoute,
      riskLevel,
      message,
      triggerInsurance,
      allRoutes: rankedRoutes,
    });

  } catch (err) {
    console.error('❌ Smart Route Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
