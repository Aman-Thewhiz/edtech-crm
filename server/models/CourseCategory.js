import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

courseCategorySchema.index({ createdAt: -1 });

export default mongoose.model('CourseCategory', courseCategorySchema);