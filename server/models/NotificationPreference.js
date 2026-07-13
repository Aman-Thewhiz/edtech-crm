import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    inAppNotifications: {
      enabled: { type: Boolean, default: true },
      leadAssigned: { type: Boolean, default: true },
      followUpDue: { type: Boolean, default: true },
      admissionStatusChanged: { type: Boolean, default: true },
      invoiceOverdue: { type: Boolean, default: true },
      leaveStatusChanged: { type: Boolean, default: true },
      payrollProcessed: { type: Boolean, default: true },
    },
    emailNotifications: {
      enabled: { type: Boolean, default: true },
      leadAssigned: { type: Boolean, default: true },
      followUpDue: { type: Boolean, default: false },
      admissionStatusChanged: { type: Boolean, default: true },
      invoiceOverdue: { type: Boolean, default: true },
      leaveStatusChanged: { type: Boolean, default: true },
      payrollProcessed: { type: Boolean, default: true },
    },
    emailAddress: String,
    digestFrequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate',
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: String, // HH:MM format
      endTime: String, // HH:MM format
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('NotificationPreference', notificationPreferenceSchema);
