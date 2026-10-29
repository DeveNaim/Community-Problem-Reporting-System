const bcrypt = require('bcryptjs');
const User = require('../models/User');

const DEFAULT_USERS = [
  // 1. System Admin
  {
    name: 'System Admin',
    email: 'admin@cprs.local',
    phone: '01700000001',
    password: 'Admin123!',
    role: 'admin',
    category: 'All',
  },

  // 2. Road Damage Authority
  {
    name: 'Roads & Highway Maintenance Authority',
    email: 'authority.roads@cprs.local',
    phone: '01700000002',
    password: 'Authority123!',
    role: 'authority',
    category: 'Road Damage',
  },

  // 3. Waste Management Authority
  {
    name: 'Waste Management & Sanitation Authority',
    email: 'authority.waste@cprs.local',
    phone: '01700000003',
    password: 'Authority123!',
    role: 'authority',
    category: 'Waste Management',
  },

  // 4. Water Leakage Authority (WASA)
  {
    name: 'Water Supply & WASA Authority',
    email: 'authority.water@cprs.local',
    phone: '01700000004',
    password: 'Authority123!',
    role: 'authority',
    category: 'Water Leakage',
  },

  // 5. Streetlight Outages Authority
  {
    name: 'Streetlight & Electrical Authority',
    email: 'authority.lights@cprs.local',
    phone: '01700000005',
    password: 'Authority123!',
    role: 'authority',
    category: 'Streetlight',
  },

  // 6. Drainage & Waterlogging Authority
  {
    name: 'Drainage & Stormwater Authority',
    email: 'authority.drainage@cprs.local',
    phone: '01700000006',
    password: 'Authority123!',
    role: 'authority',
    category: 'Drainage',
  },

  // 7. Public Parks & Security Authority
  {
    name: 'Public Parks & Security Authority',
    email: 'authority.security@cprs.local',
    phone: '01700000007',
    password: 'Authority123!',
    role: 'authority',
    category: 'Security',
  },

  // 8. General / Other Municipal Works
  {
    name: 'General Municipal Works Authority',
    email: 'authority.general@cprs.local',
    phone: '01700000008',
    password: 'Authority123!',
    role: 'authority',
    category: 'Other',
  },

  // 9. Citizen Accounts
  {
    name: 'Rahim Uddin (Citizen)',
    email: 'citizen1@cprs.local',
    phone: '01710000001',
    password: 'Citizen123!',
    role: 'citizen',
  },
  {
    name: 'Karima Begum (Citizen)',
    email: 'citizen2@cprs.local',
    phone: '01710000002',
    password: 'Citizen123!',
    role: 'citizen',
  },
];

async function ensureSeedUsers() {
  const results = [];
  try {
    for (const def of DEFAULT_USERS) {
      let user = await User.findOne({ email: def.email.toLowerCase() });
      const passwordHash = await bcrypt.hash(def.password, 12);

      if (!user) {
        user = await User.create({
          name: def.name,
          email: def.email.toLowerCase(),
          phone: def.phone,
          passwordHash,
          role: def.role,
          category: def.category || null,
          department: def.category || null,
          status: 'active',
        });
        console.log(`[Seed] Created ${def.role} user: ${def.email}`);
        results.push({ email: def.email, role: def.role, action: 'created' });
      } else {
        // Ensure role, password, category and active status are aligned
        user.name = def.name;
        user.phone = def.phone;
        user.passwordHash = passwordHash;
        user.role = def.role;
        user.category = def.category || user.category || null;
        user.department = def.category || user.department || null;
        user.status = 'active';
        await user.save();
        results.push({ email: def.email, role: def.role, action: 'verified' });
      }
    }
  } catch (err) {
    console.error('[Seed] Error ensuring seed users:', err.message);
  }
  return results;
}

module.exports = { DEFAULT_USERS, ensureSeedUsers };
