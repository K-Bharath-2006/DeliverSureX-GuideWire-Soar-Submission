const mongoose = require('mongoose');

/**
 * Delivery Record — one document per completed delivery/insurance event.
 * Created automatically when a claim is filed or a policy is activated for a run.
 */
const deliverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Geo-location of the delivery incident / pickup
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },

    // Crowd density level at the time of delivery
    crowdDensity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },

    // Route risk level derived from routing engine
    routeRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },

    // Fraud score from AI decision engine (0 – 1; higher = more suspicious)
    fraudScore: { type: Number, default: 0, min: 0, max: 1 },

    // Premium paid for this delivery
    premium: { type: Number, required: true, default: 30 },

    // Claim amount paid out (0 if not claimed / rejected)
    claimAmount: { type: Number, default: 0 },

    // Final claim status
    status: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'REVIEW', 'PENDING'],
      default: 'PENDING',
    },

    // Optional link to the Claim document
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
    },

    // Disruption type from the claim
    disruptionType: {
      type: String,
      enum: ['Rain', 'Pollution', 'Traffic', 'Crowd', 'None'],
      default: 'None',
    },
  },
  { timestamps: true }
);

// Index for time-based analytics queries
deliverySchema.index({ createdAt: -1 });
deliverySchema.index({ userId: 1, createdAt: -1 });
deliverySchema.index({ lat: 1, lon: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
