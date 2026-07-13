import mongoose from 'mongoose';

const documentChecklistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    required: { type: Boolean, default: true },
    received: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

const admissionStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['initiated', 'documents-pending', 'documents-verified', 'fee-pending', 'enrolled'],
      required: true,
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

const admissionSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, unique: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ['female', 'male', 'other', 'prefer-not-to-say'], default: 'prefer-not-to-say' },
    address: { type: String, default: '', trim: true },
    guardianName: { type: String, default: '', trim: true },
    guardianPhone: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['initiated', 'documents-pending', 'documents-verified', 'fee-pending', 'enrolled'],
      default: 'initiated',
      index: true,
    },
    documentChecklist: { type: [documentChecklistSchema], default: [] },
    statusHistory: { type: [admissionStatusHistorySchema], default: [] },
    invoiceStub: {
      invoiceNumber: { type: String, default: '' },
      amount: { type: Number, default: 0, min: 0 },
      status: { type: String, enum: ['not-generated', 'draft'], default: 'not-generated' },
      generatedAt: { type: Date, default: null },
      note: { type: String, default: '', trim: true },
    },
    enrolledAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

admissionSchema.index({ createdAt: -1 });
admissionSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.model('Admission', admissionSchema);
