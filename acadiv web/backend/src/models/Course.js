const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillFirm', required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    skillCategories: [{ type: String }],
    level: { type: String },
    curriculumSummary: { type: String },
    deliveryMode: { type: String, enum: ['onsite', 'online', 'hybrid', 'unknown'], default: 'unknown' },
    duration: { type: String },
    eligibility: { type: String },
    publishedFeeAmount: { type: Number, default: null },
    publishedFeeCurrency: { type: String, default: 'PKR' },
    publishedFeeNote: { type: String },
    officialLink: { type: String },
    registrationStatus: {
      type: String,
      enum: ['open', 'closed', 'unknown', 'announced'],
      default: 'unknown',
    },
    availability: {
      type: String,
      enum: ['available', 'unavailable', 'unknown'],
      default: 'unknown',
    },
    startDate: { type: Date },
    endDate: { type: Date },
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

courseSchema.index({ providerId: 1, slug: 1 });

module.exports = mongoose.model('Course', courseSchema);
