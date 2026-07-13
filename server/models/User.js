import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'hr_manager', 'sales_manager', 'counsellor', 'finance', 'teacher', 'student'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);