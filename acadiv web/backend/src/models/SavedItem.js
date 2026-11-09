const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: {
      type: String,
      enum: ['career', 'institution', 'programme', 'course', 'event', 'roadmap', 'skill_firm'],
      required: true,
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

savedItemSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('SavedItem', savedItemSchema);
