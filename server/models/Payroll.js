import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: true,
    },
    attendanceData: {
      totalWorkingDays: Number,
      presentDays: Number,
      absentDays: Number,
      halfDays: Number,
      onLeaveDays: Number,
      holidayDays: Number,
    },
    earnings: {
      basic: Number,
      hra: Number,
      da: Number,
      allowances: Number,
      bonus: {
        type: Number,
        default: 0,
      },
      total: Number,
    },
    deductions: {
      pf: Number,
      pt: Number,
      esic: Number,
      other: {
        type: Number,
        default: 0,
      },
      total: Number,
    },
    lossOfPay: {
      type: Number,
      default: 0,
    },
    netPay: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'processed', 'paid'],
      default: 'draft',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    approvalRemarks: String,
    paidOn: Date,
    paymentMode: {
      type: String,
      enum: ['bank', 'cash', 'cheque'],
    },
    transactionId: String,
    remarks: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Compound index for unique payroll per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1, isDeleted: 1 }, { unique: true, sparse: true });

export default mongoose.model('Payroll', payrollSchema);
