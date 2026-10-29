const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendStatusNotificationEmail } = require('./email');

const STATUS_MESSAGES = {
  Verified: 'Your complaint has been verified.',
  Rejected: 'Your complaint has been rejected.',
  Assigned: 'Your complaint has been assigned to an authority.',
  'In Progress': 'Your complaint is now in progress.',
  Resolved: 'Your complaint has been resolved.',
  'Unable to Resolve': 'Your complaint could not be resolved.',
};

async function notifyCitizenOfStatusChange(citizenId, complaintId, status, customMessage) {
  const message =
    customMessage || STATUS_MESSAGES[status] || `Your complaint status changed to ${status}.`;

  await Notification.create({
    userId: citizenId,
    complaintId,
    message,
  });

  // FR-6.3 (Could-have): optional email when SMTP is configured
  if (process.env.EMAIL_NOTIFICATIONS !== 'false') {
    const citizen = await User.findById(citizenId).select('email');
    if (citizen?.email) {
      await sendStatusNotificationEmail(citizen.email, message);
    }
  }
}

/**
 * Updates complaint status, appends statusHistory, and notifies the citizen.
 * Used by admin/authority flows in Stages 6–7; exported here for Stage 4 wiring (FR-3.3).
 */
async function applyStatusChange(complaint, { status, changedBy, note = '' }) {
  const previousStatus = complaint.status;
  complaint.status = status;
  complaint.statusHistory.push({
    status,
    changedBy,
    note,
    timestamp: new Date(),
  });
  await complaint.save();

  if (previousStatus !== status) {
    await notifyCitizenOfStatusChange(complaint.citizenId, complaint._id, status);
  }

  return complaint;
}

module.exports = {
  STATUS_MESSAGES,
  notifyCitizenOfStatusChange,
  applyStatusChange,
};
