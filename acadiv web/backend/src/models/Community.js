const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 10000 },
    tags: [{ type: String }],
    category: { type: String, default: 'general' },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      default: 'pending',
      index: true,
    },
    visibilityStatus: {
      type: String,
      enum: ['public', 'hidden'],
      default: 'public',
    },
    upvoteCount: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

const communityReplySchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 5000 },
    parentReplyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityReply' },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      default: 'pending',
    },
    isExpertLabel: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const communityVoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'reply'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    voteType: { type: String, enum: ['up'], default: 'up' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

communityVoteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

const moderationReportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'reply', 'user'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    category: { type: String, required: true },
    explanation: { type: String },
    reviewStatus: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'dismissed'],
      default: 'open',
    },
    assignedModeratorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = {
  CommunityPost: mongoose.model('CommunityPost', communityPostSchema),
  CommunityReply: mongoose.model('CommunityReply', communityReplySchema),
  CommunityVote: mongoose.model('CommunityVote', communityVoteSchema),
  ModerationReport: mongoose.model('ModerationReport', moderationReportSchema),
};
