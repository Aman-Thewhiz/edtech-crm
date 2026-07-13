import mongoose from 'mongoose';

const salaryStructureSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    effectiveTo: {
      type: Date,
      default: null,
    },
    basic: {
      type: Number,
      required: true,
      min: 0,
    },
    hra: {
      type: Number,
      default: 0,
      min: 0,
    },
    da: {
      type: Number,
      default: 0,
      min: 0,
    },
    allowances: [
      {
        name: String,
        amount: Number,
        isPercentageOfBasic: Boolean,
      },
    ],
    deductions: [
      {
        name: String,
        amount: Number,
        isPercentageOfBasic: Boolean,
      },
    ],
    pfContribution: {
      type: Number,
      default: 0,
      min: 0,
    },
    ptContribution: {
      type: Number,
      default: 0,
      min: 0,
    },
    esicContribution: {
      type: Number,
      default: 0,
      min: 0,
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    remarks: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
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

// Calculate gross and net salary before saving
salaryStructureSchema.pre('save', function (next) {
  const allowancesTotal = this.allowances.reduce((sum, a) => {
    return sum + (a.isPercentageOfBasic ? (this.basic * a.amount) / 100 : a.amount);
  }, 0);

  const deductionsTotal = this.deductions.reduce((sum, d) => {
    return sum + (d.isPercentageOfBasic ? (this.basic * d.amount) / 100 : d.amount);
  }, 0);

  this.grossSalary = this.basic + this.hra + this.da + allowancesTotal;
  this.netSalary = this.grossSalary - deductionsTotal - this.pfContribution - this.ptContribution - this.esicContribution;

  next();
});

export default mongoose.model('SalaryStructure', salaryStructureSchema);
