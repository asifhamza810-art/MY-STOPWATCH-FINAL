const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String },
    description: { type: String },
    domains: [{ type: String }],
    relatedCareers: [{ type: String }],
    sourceNote: { type: String },
    active: { type: Boolean, default: true },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

const studentSkillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    declaredLevel: {
      type: String,
      enum: ['none', 'exploring', 'developing', 'working', 'confident'],
      default: 'exploring',
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    claimSource: { type: String, enum: ['self', 'artifact', 'course', 'reviewed'], default: 'self' },
    evidenceNote: { type: String },
  },
  { timestamps: true }
);

studentSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

const skillGapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
    pathwayId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPathway' },
    gaps: [
      {
        skillName: String,
        currentLevel: String,
        targetLevel: String,
        priority: { type: String, enum: ['high', 'medium', 'low'] },
        reason: String,
        suggestedActions: [String],
      },
    ],
    missingInformation: [String],
    calculationVersion: { type: String, default: 'gap-v1' },
  },
  { timestamps: true }
);

module.exports = {
  Skill: mongoose.model('Skill', skillSchema),
  StudentSkill: mongoose.model('StudentSkill', studentSkillSchema),
  SkillGapAssessment: mongoose.model('SkillGapAssessment', skillGapSchema),
};
