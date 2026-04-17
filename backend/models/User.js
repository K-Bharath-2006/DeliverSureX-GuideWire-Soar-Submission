const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String, required: true },
  weeklyIncome: { type: Number, required: true },
  policyActive: { type: Boolean, default: false },
  policyStartDate: { type: Date },
  policyEndDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
