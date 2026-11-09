const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    role: {
      type: String,
      enum: ['student', 'contentReviewer', 'moderator', 'admin'],
      default: 'student',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pendingDeletion', 'deleted'],
      default: 'active',
    },
    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, accountStatus: 1 });

module.exports = mongoose.model('User', userSchema);
