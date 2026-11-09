const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema(
  {
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    name: { type: String, required: true },
    area: { type: String },
    address: { type: String },
    city: { type: String, default: 'Karachi' },
    province: { type: String, default: 'Sindh' },
    officialPage: { type: String },
    verificationStatus: {
      type: String,
      enum: ['verified', 'provisional', 'unverified'],
      default: 'provisional',
    },
    sourceUrl: { type: String },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campus', campusSchema);
