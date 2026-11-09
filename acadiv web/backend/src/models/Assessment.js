const mongoose = require('mongoose');

const assessmentVersionSchema = new mongoose.Schema(
  {
    versionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    framework: { type: String, default: 'RIASEC' },
    scoringRules: {
      dimensions: {
        type: [String],
        default: ['R', 'I', 'A', 'S', 'E', 'C'],
      },
      completionMinAnswers: { type: Number, default: 15 },
      completionMaxAnswers: { type: Number, default: 20 },
      normalize: { type: Boolean, default: true },
    },
    branchingStrategyVersion: { type: String, default: 'balanced-v1' },
    publicationStatus: {
      type: String,
      enum: ['draft', 'published', 'retired'],
      default: 'published',
    },
    publishedAt: { type: Date },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

const assessmentQuestionSchema = new mongoose.Schema(
  {
    questionKey: { type: String, required: true },
    assessmentVersionId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    scenarioContext: { type: String },
    options: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        dimensionWeights: {
          R: { type: Number, default: 0 },
          I: { type: Number, default: 0 },
          A: { type: Number, default: 0 },
          S: { type: Number, default: 0 },
          E: { type: Number, default: 0 },
          C: { type: Number, default: 0 },
        },
      },
    ],
    primaryDimension: { type: String, enum: ['R', 'I', 'A', 'S', 'E', 'C'] },
    language: { type: String, default: 'en' },
    reviewStatus: { type: String, enum: ['approved', 'draft'], default: 'approved' },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

assessmentQuestionSchema.index({ assessmentVersionId: 1, questionKey: 1 }, { unique: true });

const answerSubSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionKey: String,
    optionKey: String,
    dimensionWeights: Object,
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const assessmentSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessmentVersionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    selectedQuestionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    answeredQuestionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    answers: { type: [answerSubSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const assessmentResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentSession', required: true },
    assessmentVersionId: { type: String, required: true },
    scores: {
      R: Number,
      I: Number,
      A: Number,
      S: Number,
      E: Number,
      C: Number,
    },
    normalizedScores: {
      R: Number,
      I: Number,
      A: Number,
      S: Number,
      E: Number,
      C: Number,
    },
    hollandCode: { type: String },
    scoringVersion: { type: String, default: 'riasec-v2' },
    reasonTrace: [{ type: String }],
    recommendedFields: [
      {
        careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
        slug: String,
        title: String,
        domain: String,
        compatibilityScore: Number,
        why: String,
        matchingDimensions: [String],
        strengths: [String],
        growthAreas: [String],
        relevantPathway: String,
        uncertainty: String,
      },
    ],
    alternativeFields: [
      {
        careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
        slug: String,
        title: String,
        domain: String,
        compatibilityScore: Number,
        why: String,
        matchingDimensions: [String],
      },
    ],
    missingInformation: [{ type: String }],
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ikigaiReflectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    enjoys: { type: String },
    developing: { type: String },
    communityNeeds: { type: String },
    sustainable: { type: String },
    notes: { type: String },
    selectedInterests: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = {
  AssessmentVersion: mongoose.model('AssessmentVersion', assessmentVersionSchema),
  AssessmentQuestion: mongoose.model('AssessmentQuestion', assessmentQuestionSchema),
  AssessmentSession: mongoose.model('AssessmentSession', assessmentSessionSchema),
  AssessmentResult: mongoose.model('AssessmentResult', assessmentResultSchema),
  IkigaiReflection: mongoose.model('IkigaiReflection', ikigaiReflectionSchema),
};
