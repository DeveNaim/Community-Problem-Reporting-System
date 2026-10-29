const mongoose = require('mongoose');

// SRS Sections 5.2 (FR-2.2) and 9.2
const CATEGORIES = [
  'Road Damage',
  'Waste Management',
  'Water Leakage',
  'Streetlight',
  'Drainage',
  'Security',
  'Other',
];

const STATUSES = [
  'Pending Verification',
  'Verified',
  'Rejected',
  'Assigned',
  'In Progress',
  'Resolved',
  'Unable to Resolve',
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    images: {
      type: [String],
      default: [],
      validate: [(arr) => arr.length <= 3, 'Maximum 3 images allowed'],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Pending Verification',
    },
    assignedAuthorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

complaintSchema.index({ citizenId: 1, createdAt: -1 });
complaintSchema.index({ assignedAuthorityId: 1, updatedAt: -1 });
complaintSchema.index({ status: 1, category: 1, createdAt: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
