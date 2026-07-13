import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    capacity: { type: Number, required: true, min: 1 },
    schedule: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    enrollmentCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

batchSchema.index({ createdAt: -1 });

export default mongoose.model('Batch', batchSchema);