#!/usr/bin/env node
/**
 * CPRS database seed script (Stage 5, SRS Section 13).
 * Seeds admin, authority users, citizens, and sample complaints in varied statuses.
 *
 * Usage: npm run seed
 * Re-runnable: removes previous @cprs.local seed users and their data first.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dns = require('dns');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');
const Notification = require('../src/models/Notification');
const { generateComplaintId } = require('../src/utils/complaintId');
const { notifyCitizenOfStatusChange } = require('../src/utils/statusChange');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cprs';
if (MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {}
}
const SEED_EMAIL_DOMAIN = '@cprs.local';

const SEED_USERS = [
  {
    key: 'admin',
    name: 'System Admin',
    email: `admin${SEED_EMAIL_DOMAIN}`,
    phone: '01700000001',
    password: 'Admin123!',
    role: 'admin',
    category: 'All',
  },
  {
    key: 'authorityRoads',
    name: 'Roads & Highway Maintenance Authority',
    email: `authority.roads${SEED_EMAIL_DOMAIN}`,
    phone: '01700000002',
    password: 'Authority123!',
    role: 'authority',
    category: 'Road Damage',
  },
  {
    key: 'authorityWaste',
    name: 'Waste Management & Sanitation Authority',
    email: `authority.waste${SEED_EMAIL_DOMAIN}`,
    phone: '01700000003',
    password: 'Authority123!',
    role: 'authority',
    category: 'Waste Management',
  },
  {
    key: 'authorityWater',
    name: 'Water Supply & WASA Authority',
    email: `authority.water${SEED_EMAIL_DOMAIN}`,
    phone: '01700000004',
    password: 'Authority123!',
    role: 'authority',
    category: 'Water Leakage',
  },
  {
    key: 'authorityLights',
    name: 'Streetlight & Electrical Authority',
    email: `authority.lights${SEED_EMAIL_DOMAIN}`,
    phone: '01700000005',
    password: 'Authority123!',
    role: 'authority',
    category: 'Streetlight',
  },
  {
    key: 'authorityDrainage',
    name: 'Drainage & Stormwater Authority',
    email: `authority.drainage${SEED_EMAIL_DOMAIN}`,
    phone: '01700000006',
    password: 'Authority123!',
    role: 'authority',
    category: 'Drainage',
  },
  {
    key: 'authoritySecurity',
    name: 'Public Parks & Security Authority',
    email: `authority.security${SEED_EMAIL_DOMAIN}`,
    phone: '01700000007',
    password: 'Authority123!',
    role: 'authority',
    category: 'Security',
  },
  {
    key: 'authorityGeneral',
    name: 'General Municipal Works Authority',
    email: `authority.general${SEED_EMAIL_DOMAIN}`,
    phone: '01700000008',
    password: 'Authority123!',
    role: 'authority',
    category: 'Other',
  },
  {
    key: 'citizen1',
    name: 'Rahim Uddin',
    email: `citizen1${SEED_EMAIL_DOMAIN}`,
    phone: '01710000001',
    password: 'Citizen123!',
    role: 'citizen',
  },
  {
    key: 'citizen2',
    name: 'Karima Begum',
    email: `citizen2${SEED_EMAIL_DOMAIN}`,
    phone: '01710000002',
    password: 'Citizen123!',
    role: 'citizen',
  },
];

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function historyEntry(status, changedById, note, timestamp) {
  return { status, changedBy: changedById, note, timestamp };
}

async function upsertUser(definition) {
  const passwordHash = await bcrypt.hash(definition.password, 12);
  const user = await User.findOneAndUpdate(
    { email: definition.email },
    {
      name: definition.name,
      email: definition.email,
      phone: definition.phone,
      passwordHash,
      role: definition.role,
      category: definition.category || null,
      department: definition.category || null,
      status: 'active',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return user;
}

async function clearPreviousSeedData() {
  const seedUsers = await User.find({
    email: { $regex: SEED_EMAIL_DOMAIN.replace('.', '\\.') + '$' },
  }).select('_id');

  const seedUserIds = seedUsers.map((user) => user._id);
  if (seedUserIds.length === 0) {
    return;
  }

  const seedComplaints = await Complaint.find({
    $or: [{ citizenId: { $in: seedUserIds } }, { assignedAuthorityId: { $in: seedUserIds } }],
  }).select('_id');

  const complaintIds = seedComplaints.map((complaint) => complaint._id);

  await Notification.deleteMany({
    $or: [{ userId: { $in: seedUserIds } }, { complaintId: { $in: complaintIds } }],
  });
  await Complaint.deleteMany({ _id: { $in: complaintIds } });
  await User.deleteMany({ _id: { $in: seedUserIds } });
}

async function createSeededComplaint({
  citizen,
  admin,
  authority,
  category,
  title,
  description,
  location,
  statusHistory,
  assignedAuthorityId = null,
}) {
  const complaintId = await generateComplaintId();
  const finalStatus = statusHistory[statusHistory.length - 1].status;
  const createdAt = statusHistory[0].timestamp;
  const updatedAt = statusHistory[statusHistory.length - 1].timestamp;

  const complaint = await Complaint.create({
    complaintId,
    citizenId: citizen._id,
    category,
    title,
    description,
    location,
    images: [],
    status: finalStatus,
    assignedAuthorityId,
    statusHistory,
    createdAt,
    updatedAt,
  });

  for (let i = 1; i < statusHistory.length; i += 1) {
    if (statusHistory[i].status !== statusHistory[i - 1].status) {
      await notifyCitizenOfStatusChange(citizen._id, complaint._id, statusHistory[i].status);
    }
  }

  return complaint;
}

async function seedComplaints(users) {
  const {
    admin,
    authorityRoads,
    authorityWaste,
    authorityWater,
    authorityLights,
    authorityDrainage,
    authoritySecurity,
    authorityGeneral,
    citizen1,
    citizen2,
  } = users;

  const complaints = [];

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityRoads,
      category: 'Road Damage',
      title: 'Large pothole on Mirpur Road',
      description: 'Deep pothole near the bus stop causing accidents.',
      location: 'Mirpur Road, Section 10',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(1)
        ),
      ],
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityWaste,
      category: 'Waste Management',
      title: 'Overflowing garbage bin',
      description: 'Municipal bin not collected for five days.',
      location: 'Dhanmondi Road 27',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(5)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(4)),
      ],
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityWater,
      category: 'Water Leakage',
      title: 'Burst water pipe',
      description: 'Water flooding the street from a broken main line.',
      location: 'Gulshan Avenue, Block C',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(7)
        ),
        historyEntry('Rejected', admin._id, 'Duplicate report — already handled', daysAgo(6)),
      ],
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen2,
      admin,
      authority: authorityLights,
      category: 'Streetlight',
      title: 'Streetlight out for two weeks',
      description: 'Dark stretch of road with no working lights.',
      location: 'Banani Road 11',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen2._id,
          'Complaint submitted',
          daysAgo(10)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(9)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to Streetlight & Electrical Authority',
          daysAgo(8)
        ),
      ],
      assignedAuthorityId: authorityLights._id,
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen2,
      admin,
      authority: authorityDrainage,
      category: 'Drainage',
      title: 'Blocked storm drain',
      description: 'Drain clogged after rain; water pooling on road.',
      location: 'Uttara Sector 7',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen2._id,
          'Complaint submitted',
          daysAgo(12)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(11)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to Drainage & Stormwater Authority',
          daysAgo(10)
        ),
        historyEntry(
          'In Progress',
          authorityDrainage._id,
          'Crew dispatched to clear drain',
          daysAgo(3)
        ),
      ],
      assignedAuthorityId: authorityDrainage._id,
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen2,
      admin,
      authority: authoritySecurity,
      category: 'Security',
      title: 'Broken park fence',
      description: 'Fence damaged allowing unauthorized access at night.',
      location: 'Ramna Park, East Gate',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen2._id,
          'Complaint submitted',
          daysAgo(20)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(19)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to Public Parks & Security Authority',
          daysAgo(18)
        ),
        historyEntry(
          'In Progress',
          authoritySecurity._id,
          'Repair work started',
          daysAgo(14)
        ),
        historyEntry(
          'Resolved',
          authoritySecurity._id,
          'Fence repaired and area secured',
          daysAgo(7)
        ),
      ],
      assignedAuthorityId: authoritySecurity._id,
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityGeneral,
      category: 'Other',
      title: 'Illegal dumping site',
      description: 'Repeated illegal waste dumping behind market.',
      location: 'Old Dhaka, Chawkbazar',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(15)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(14)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to General Municipal Works Authority',
          daysAgo(13)
        ),
        historyEntry(
          'In Progress',
          authorityGeneral._id,
          'Site inspected',
          daysAgo(10)
        ),
        historyEntry(
          'Unable to Resolve',
          authorityGeneral._id,
          'Private land — outside jurisdiction',
          daysAgo(8)
        ),
      ],
      assignedAuthorityId: authorityGeneral._id,
    })
  );

  return complaints;
}

async function main() {
  console.log('CPRS seed starting…');
  await mongoose.connect(MONGODB_URI);

  await clearPreviousSeedData();

  const users = {};
  for (const definition of SEED_USERS) {
    users[definition.key] = await upsertUser(definition);
    console.log(`  user: ${definition.role.padEnd(9)} ${definition.email}`);
  }

  const complaints = await seedComplaints(users);
  console.log(`  complaints: ${complaints.length} created`);

  const notificationCount = await Notification.countDocuments({
    userId: { $in: [users.citizen1._id, users.citizen2._id] },
  });
  console.log(`  notifications: ${notificationCount} for seeded citizens`);

  console.log('\nSeed complete. Credentials: docs/SEED.md');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
