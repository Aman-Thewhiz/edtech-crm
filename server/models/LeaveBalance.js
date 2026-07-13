import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    leavePolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeavePolicy",
      required: true,
    },

    // Financial year (e.g., "2024-2025")
    financialYear: {
      type: String,
      required: true,
      index: true,
    },

    // Opening balance (from previous year carry-forward)
    openingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Annual allocation for this year
    allocatedDays: {
      type: Number,
      required: true,
      min: 0,
    },

    // Total available (opening + allocated)
    totalAvailable: {
      type: Number,
      required: true,
      min: 0,
    },

    // Days used (approved leave only)
    usedDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Days pending approval
    pendingDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Days available for use
    balanceDays: {
      type: Number,
      required: true,
      min: 0,
    },

    // Days carried forward to next year
    carryForwardDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Lapsed/forfeited days (not carried forward)
    lapsedDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Last updated timestamp
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one balance per employee per leave type per financial year
leaveBalanceSchema.index(
  { employee: 1, leavePolicy: 1, financialYear: 1 },
  { unique: true }
);

export default mongoose.model("LeaveBalance", leaveBalanceSchema);
