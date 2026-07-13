import mongoose from "mongoose";

const employeeDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["aadhar", "pan", "bank-passbook", "offer-letter", "other"],
      required: true,
    },
    name: String,
    fileName: String,
    mimeType: String,
    contentBase64: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    address: String,

    // Job Information
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern"],
      default: "full-time",
    },

    status: {
      type: String,
      enum: ["active", "on-leave", "resigned", "terminated"],
      default: "active",
    },

    // Bank Details
    bankAccountNumber: String,
    bankIFSC: String,
    bankAccountHolderName: String,

    // Documents
    documents: [employeeDocumentSchema],

    // Onboarding Checklist
    onboardingChecklist: [
      {
        item: String,
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      },
    ],

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

export default mongoose.model("Employee", employeeSchema);
