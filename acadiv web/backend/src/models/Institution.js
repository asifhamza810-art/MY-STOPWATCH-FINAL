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

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['university', 'institute', 'college', 'technical_polytechnic', 'vocational', 'higher_secondary', 'other'],
      default: 'university',
    },
    ownershipType: { type: String, enum: ['public', 'private', 'semi-public', 'unknown'], default: 'unknown' },
    accreditationAuthority: { type: String }, // e.g. 'HEC', 'PEC', 'PMDC', 'BIEK', 'SBTE', 'STEVTA', 'NAVTTC'
    description: { type: String },
    officialWebsite: { type: String },
    admissionsWebsite: { type: String },
    city: { type: String, default: 'Karachi' },
    province: { type: String, default: 'Sindh' },
    country: { type: String, default: 'Pakistan' },
    areas: [{ type: String }],
    metaDescription: { type: String },
    imageUrl: { type: String },
    recognitionStatus: {
      type: String,
      enum: ['verified', 'claimed', 'unknown', 'not_applicable'],
      default: 'unknown',
    },
    recognitionNote: { type: String },
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

institutionSchema.index({ city: 1, category: 1 });
institutionSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Institution', institutionSchema);
