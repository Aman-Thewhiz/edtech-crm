import mongoose from "mongoose";

const leavePolicySchema = new mongoose.Schema(
  {
    leaveType: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["casual", "sick", "earned", "unpaid", "maternity", "paternity", "bereavement"],
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Annual quota per employee
    annualQuota: {
      type: Number,
      required: true,
      min: 0,
    },

    // Can unused days be carried forward to next year?
    carryForwardAllowed: {
      type: Boolean,
      default: false,
    },

    // Maximum days that can be carried forward
    carryForwardLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Minimum days that must be taken at once
    minimumDaysPerRequest: {
      type: Number,
      default: 0.5,
    },

    // Maximum consecutive days allowed
    maxConsecutiveDays: {
      type: Number,
      default: null, // null = unlimited
    },

    // Requires manager approval?
    requiresApproval: {
      type: Boolean,
      default: true,
    },

    // Requires HR approval?
    requiresHRApproval: {
      type: Boolean,
      default: false,
    },

    // Is this leave type active?
    isActive: {
      type: Boolean,
      default: true,
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

export default mongoose.model("LeavePolicy", leavePolicySchema);
