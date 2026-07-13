import mongoose from 'mongoose';

const leadActivitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['call', 'email', 'meeting', 'note'], required: true },
    summary: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const leadNoteSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const leadDocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    alternatePhone: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      enum: ['walk-in', 'website', 'referral', 'social-media', 'campaign'],
      default: 'website',
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leadScore: { type: Number, min: 1, max: 5, default: 3 },
    followUpAt: { type: Date, default: null, index: true },
    activities: { type: [leadActivitySchema], default: [] },
    notes: { type: [leadNoteSchema], default: [] },
    documents: { type: [leadDocumentSchema], default: [] },
    convertedToAdmission: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

leadSchema.index({ name: 'text', email: 'text', phone: 'text' });
leadSchema.index({ createdAt: -1 });

export default mongoose.model('Lead', leadSchema);