import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
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

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    // Number of days (can be fractional for half days)
    numberOfDays: {
      type: Number,
      required: true,
      min: 0.5,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // Attachment (base64 document if needed)
    attachmentFileName: String,
    attachmentMimeType: String,
    attachmentContentBase64: String,

    // Status workflow
    status: {
      type: String,
      enum: ["applied", "pending", "approved", "rejected", "cancelled"],
      default: "applied",
      index: true,
    },

    // Manager approval
    managerApproval: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      approvedAt: Date,
      remarks: String,
    },

    // HR approval (if required)
    hrApproval: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      approvedAt: Date,
      remarks: String,
    },

    // Cancellation info
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: Date,
    cancellationReason: String,

    // Notes from employee
    notes: String,

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

// Compound index for finding overlapping leave requests
leaveRequestSchema.index({ employee: 1, startDate: 1, endDate: 1 });

export default mongoose.model("LeaveRequest", leaveRequestSchema);
