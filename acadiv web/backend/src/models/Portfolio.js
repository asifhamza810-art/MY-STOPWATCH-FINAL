const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_-]{3,30}$/, 'Invalid username'],
    },
    headline: { type: String, maxlength: 160 },
    biography: { type: String, maxlength: 2000 },
    selectedSkills: [{ type: String }],
    educationRecords: [
      {
        institution: String,
        programme: String,
        stage: String,
        yearNote: String,
      },
    ],
    selectedArtifactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' }],
    visibility: {
      type: String,
      enum: ['private', 'unlisted', 'public'],
      default: 'private',
    },
    lastPublishedAt: { type: Date },
  },
  { timestamps: true }
);

const portfolioShareSchema = new mongoose.Schema(
  {
    portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    sharingMode: { type: String, enum: ['secret_link', 'time_limited'], default: 'secret_link' },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = {
  Portfolio: mongoose.model('Portfolio', portfolioSchema),
  PortfolioShare: mongoose.model('PortfolioShare', portfolioShareSchema),
};
