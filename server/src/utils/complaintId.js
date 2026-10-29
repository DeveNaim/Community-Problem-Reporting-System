const crypto = require('crypto');
const Complaint = require('../models/Complaint');

async function generateComplaintId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const complaintId = `CPRS-${date}-${suffix}`;
    const exists = await Complaint.exists({ complaintId });
    if (!exists) {
      return complaintId;
    }
  }

  throw new Error('Unable to generate unique complaint ID');
}

module.exports = { generateComplaintId };
