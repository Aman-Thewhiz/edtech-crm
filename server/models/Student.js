import mongoose from 'mongoose';

const studentDocumentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['id-proof', 'photo', 'certificate', 'other'], required: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, default: '', trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const studentSchema = new mongoose.Schema(
  {
    enrollmentNumber: { type: String, required: true, unique: true, trim: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ['female', 'male', 'other', 'prefer-not-to-say'], default: 'prefer-not-to-say' },
    address: { type: String, default: '', trim: true },
    guardianName: { type: String, default: '', trim: true },
    guardianPhone: { type: String, default: '', trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    admission: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', default: null },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'dropped'],
      default: 'active',
      index: true,
    },
    enrollmentDate: { type: Date, default: Date.now, index: true },
    documents: { type: [studentDocumentSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

studentSchema.index({ createdAt: -1 });
studentSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.model('Student', studentSchema);
