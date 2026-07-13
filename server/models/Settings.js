import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    instituteName: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: null },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    academicYear: {
      startMonth: { type: Number, default: 4 }, // April
      endMonth: { type: Number, default: 3 }, // March
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' },
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
