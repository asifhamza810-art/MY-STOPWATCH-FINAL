const mongoose = require('mongoose');

/** Fee amounts are never defaulted to 0. Null/undefined means unknown. */
const feeRecordSchema = new mongoose.Schema(
  {
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', index: true },
    academicYear: { type: String, required: true },
    currency: { type: String, default: 'PKR' },
    amount: { type: Number, default: null },
    amountMin: { type: Number, default: null },
    amountMax: { type: Number, default: null },
    feeType: { type: String, enum: ['tuition', 'admission', 'other'], default: 'tuition' },
    paymentFrequency: { type: String },
    studentCategory: { type: String },
    additionalChargesNote: { type: String },
    sourceUrl: { type: String, required: true },
    lastVerifiedAt: { type: Date },
    verificationStatus: {
      type: String,
      enum: ['verified', 'provisional', 'unverified', 'insufficient_information'],
      default: 'insufficient_information',
    },
    stableKey: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeeRecord', feeRecordSchema);
