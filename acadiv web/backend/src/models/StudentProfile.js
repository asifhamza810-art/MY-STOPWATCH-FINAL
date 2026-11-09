const mongoose = require('mongoose');

const EDUCATION_STAGES = [
  'Matriculation',
  'Intermediate',
  'FSc Pre-Engineering',
  'FSc Pre-Medical',
  'ICS',
  'FA',
  'General Science',
  'DAE',
  'O-Level',
  'A-Level',
  'Undergraduate',
  'Other',
];

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    preferredName: { type: String, trim: true, maxlength: 80 },
    educationStage: { type: String, enum: EDUCATION_STAGES },
    educationStream: { type: String, trim: true },
    boardOrQualification: { type: String, trim: true },
    currentStudyYear: { type: String, trim: true },
    subjects: [{ type: String, trim: true }],
    academicPreferences: [{ type: String, trim: true }],
    careerInterests: [{ type: String, trim: true }],
    preferredLearningStyle: { type: String, trim: true },
    city: { type: String, trim: true, default: 'Karachi' },
    province: { type: String, trim: true, default: 'Sindh' },
    budgetPreference: { type: String, trim: true },
    timeAvailability: { type: String, trim: true },
    activeCareerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
    activeCareerSlug: { type: String, trim: true },
    activeCareerTitle: { type: String, trim: true },
    activeCareerDomain: { type: String, trim: true },
    activeCareerCompatibility: { type: Number, default: null },
    activeCareerSelectedAt: { type: Date },
    profileCompletionState: {
      type: String,
      enum: ['empty', 'partial', 'complete'],
      default: 'empty',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
module.exports.EDUCATION_STAGES = EDUCATION_STAGES;
