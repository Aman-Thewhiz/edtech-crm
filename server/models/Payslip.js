import mongoose from 'mongoose';

const payslipSchema = new mongoose.Schema(
  {
    payroll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payroll',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    payslipNumber: {
      type: String,
      unique: true,
      required: true,
    },
    pdfUrl: String,
    pdfFileName: String,
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    downloadedAt: Date,
    downloadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emailSentAt: Date,
    emailSentTo: String,
    status: {
      type: String,
      enum: ['generated', 'sent', 'downloaded'],
      default: 'generated',
    },
    remarks: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true, sparse: true });

export default mongoose.model('Payslip', payslipSchema);
