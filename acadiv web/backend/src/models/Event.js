const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['hackathon', 'mun', 'debate', 'workshop', 'exhibition', 'competition', 'other'],
      default: 'other',
    },
    organizer: { type: String },
    hostingInstitution: { type: String },
    city: { type: String, default: 'Karachi' },
    campusArea: { type: String },
    venue: { type: String },
    format: { type: String, enum: ['physical', 'online', 'hybrid', 'unknown'], default: 'unknown' },
    startsAt: { type: Date },
    endsAt: { type: Date },
    registrationDeadline: { type: Date },
    registrationLink: { type: String },
    eligibility: { type: String },
    feeNote: { type: String, default: null },
    imageUrl: { type: String },
    sourceUrl: { type: String },
    verificationStatus: {
      type: String,
      enum: ['verified', 'provisional', 'unverified', 'community'],
      default: 'provisional',
    },
    publicationStatus: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    expiresAt: { type: Date, required: true, index: true },
    archivedAt: { type: Date },
    purgeAt: { type: Date },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

eventSchema.index({ publicationStatus: 1, expiresAt: 1, startsAt: 1 });
eventSchema.index({ category: 1, city: 1 });
eventSchema.index({ title: 'text', description: 'text', organizer: 'text' });

module.exports = mongoose.model('Event', eventSchema);
