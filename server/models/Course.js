import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '', trim: true },
    duration: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseCategory', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

courseSchema.index({ createdAt: -1 });

export default mongoose.model('Course', courseSchema);