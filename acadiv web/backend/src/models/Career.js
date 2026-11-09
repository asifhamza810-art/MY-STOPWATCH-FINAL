const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    domain: { type: String, index: true },
    disciplines: [{ type: String }],
    relatedSubjects: [{ type: String }],
    requiredSkills: [{ type: String }],
    usefulSkills: [{ type: String }],
    educationRoutes: [{ type: String }],
    typicalResponsibilities: [{ type: String }],
    progressionPaths: [{ type: String }],
    riasecProfile: {
      R: { type: Number, default: 20 },
      I: { type: Number, default: 20 },
      A: { type: Number, default: 20 },
      S: { type: Number, default: 20 },
      E: { type: Number, default: 20 },
      C: { type: Number, default: 20 },
    },
    strengths: [{ type: String }],
    growthAreas: [{ type: String }],
    workStyle: {
      teamwork: { type: String, default: 'collaborative' },
      environment: { type: String, default: 'office-or-remote' },
      interaction: { type: String, default: 'balanced' },
    },
    eligibilityPrerequisites: [{ type: String }],
    sources: [{ label: String, url: String, retrievedAt: Date }],
    verificationStatus: {
      type: String,
      enum: ['verified', 'provisional', 'unverified'],
      default: 'provisional',
    },
    lastReviewedAt: { type: Date },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

const pathwaySchema = new mongoose.Schema(
  {
    careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', required: true, index: true },
    title: { type: String, required: true },
    educationPrerequisites: [{ type: String }],
    qualificationRoutes: [{ type: String }],
    requiredSubjects: [{ type: String }],
    entranceTests: [{ type: String }],
    skillRequirements: [{ type: String }],
    milestones: [
      {
        title: String,
        description: String,
        estimatedMonths: Number,
        budgetNote: String,
      },
    ],
    alternativeRoutes: [{ type: String }],
    sources: [{ label: String, url: String }],
    reviewStatus: { type: String, enum: ['approved', 'draft'], default: 'approved' },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

const studentRoadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
    pathwayId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerPathway' },
    title: { type: String, required: true },
    currentEducationStage: { type: String },
    milestones: [
      {
        id: String,
        title: String,
        description: String,
        status: { type: String, enum: ['planned', 'in_progress', 'done', 'skipped'], default: 'planned' },
        estimatedMonths: Number,
        estimatedBudgetPkr: { type: Number, default: null },
        budgetAssumption: String,
        skills: [String],
        prerequisites: [String],
        isDecisionPoint: Boolean,
        tradeoffs: String,
        position: { x: Number, y: Number, z: Number },
      },
    ],
    connections: [{ from: String, to: String, label: String }],
    timelineAssumptions: { type: String },
    budgetAssumptions: { type: String },
    progressStatus: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = {
  Career: mongoose.model('Career', careerSchema),
  CareerPathway: mongoose.model('CareerPathway', pathwaySchema),
  StudentRoadmap: mongoose.model('StudentRoadmap', studentRoadmapSchema),
};
