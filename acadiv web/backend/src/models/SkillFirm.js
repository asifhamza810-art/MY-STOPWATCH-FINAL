const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema(
  {
    label: String,
    url: String,
    retrievedAt: Date,
    note: String,
  },
  { _id: false }
);

const skillFirmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    categories: [{ type: String }],
    website: { type: String },
    karachiLocation: { type: String },
    campusArea: { type: String },
    city: { type: String, default: 'Karachi' },
    imageUrl: { type: String },
    metaDescription: { type: String },
    skillDomains: [{ type: String }],
    isFeatured: { type: Boolean, default: false, index: true },
    featuredPriority: { type: Number, default: 999 },
    featuredLabel: { type: String },
    verificationStatus: {
      type: String,
      enum: ['verified', 'provisional', 'unverified', 'rejected'],
      default: 'provisional',
    },
    sources: [sourceSchema],
    lastVerifiedAt: { type: Date },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

skillFirmSchema.index({ isFeatured: -1, featuredPriority: 1, name: 1 });
skillFirmSchema.index({ name: 'text', description: 'text', skillDomains: 'text' });

module.exports = mongoose.model('SkillFirm', skillFirmSchema);
