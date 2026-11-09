const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
    notifications: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      eventReminders: { type: Boolean, default: true },
      roadmapReminders: { type: Boolean, default: true },
    },
    preferredCategories: [{ type: String }],
    privacy: {
      portfolioVisibility: { type: String, enum: ['private', 'unlisted', 'public'], default: 'private' },
      showCity: { type: Boolean, default: true },
      allowCommunityMentions: { type: Boolean, default: true },
    },
    accessibility: {
      reduceMotion: { type: Boolean, default: false },
      denserText: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
