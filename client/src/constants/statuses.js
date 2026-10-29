// SRS Section 9.2 status enum
export const COMPLAINT_STATUSES = [
  'Pending Verification',
  'Verified',
  'Rejected',
  'Assigned',
  'In Progress',
  'Resolved',
  'Unable to Resolve',
];

// SRS Section 11 — consistent status color coding
export const STATUS_BADGE_CLASSES = {
  'Pending Verification': 'bg-yellow-100 text-yellow-800',
  Verified: 'bg-yellow-100 text-yellow-800',
  Rejected: 'bg-red-100 text-red-800',
  Assigned: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
  'Unable to Resolve': 'bg-red-100 text-red-800',
};

export function getStatusBadgeClass(status) {
  return STATUS_BADGE_CLASSES[status] || 'bg-gray-100 text-gray-800';
}
