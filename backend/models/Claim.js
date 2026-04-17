const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disruptionType: { type: String, enum: ['Rain', 'Pollution', 'Traffic', 'Crowd'], required: true },
  duration: { type: Number, required: true, default: 1 },
  hasImage: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  amount: { type: Number, default: 0 },
  reason: { type: String },
  riskScore: { type: Number },
  breakdown: {
    activityScore: { type: Number },
    environmentScore: { type: Number },
    crowdScore: { type: Number },
    routeScore: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
