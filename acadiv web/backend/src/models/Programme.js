const mongoose = require('mongoose');

const programmeSchema = new mongoose.Schema(
  {
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    degreeLevel: {
      type: String,
      enum: ['certificate', 'diploma', 'undergraduate', 'postgraduate', 'other'],
      default: 'undergraduate',
    },
    discipline: { type: String },
    duration: { type: String },
    educationStageEligibility: [{ type: String }],
    requiredSubjects: [{ type: String }],
    publishedMinimumMarks: { type: String, default: null },
    requiredTests: [{ type: String }],
    sourceUrl: { type: String },
    verificationStatus: {
      type: String,
      enum: ['verified', 'provisional', 'unverified'],
      default: 'provisional',
    },
    lastVerifiedAt: { type: Date },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

programmeSchema.index({ institutionId: 1, slug: 1 });

module.exports = mongoose.model('Programme', programmeSchema);
