const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        'project',
        'github',
        'design',
        'research',
        'certificate',
        'course_output',
        'competition',
        'event_deliverable',
        'other',
      ],
      default: 'project',
    },
    tags: [{ type: String }],
    projectUrl: { type: String },
    storageProvider: { type: String, enum: ['local', 'none'], default: 'none' },
    storageKey: { type: String },
    originalFilename: { type: String },
    mimeType: { type: String },
    fileSize: { type: Number },
    accessClassification: {
      type: String,
      enum: ['private', 'unlisted', 'public'],
      default: 'private',
    },
    verificationState: {
      type: String,
      enum: ['self_reported', 'repository_linked', 'uploaded', 'reviewed', 'externally_verified'],
      default: 'self_reported',
    },
    relatedCareerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
    sourceNote: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artifact', artifactSchema);
