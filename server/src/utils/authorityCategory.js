const { CATEGORIES } = require('../models/Complaint');

const EMAIL_TOKEN_TO_CATEGORY = {
  roads: 'Road Damage',
  road: 'Road Damage',
  'road.damage': 'Road Damage',
  waste: 'Waste Management',
  'waste.management': 'Waste Management',
  water: 'Water Leakage',
  'water.leakage': 'Water Leakage',
  lights: 'Streetlight',
  light: 'Streetlight',
  streetlight: 'Streetlight',
  drainage: 'Drainage',
  security: 'Security',
  parks: 'Security',
  general: 'Other',
  other: 'Other',
};

/**
 * Extracts the department token between the first '.' and '@' in an authority email
 * (e.g. "authority.roads@cprs.local" -> "roads" -> "Road Damage")
 */
function extractEmailToken(email) {
  if (!email || typeof email !== 'string') return null;
  const localPart = email.split('@')[0] || '';
  const dotIndex = localPart.indexOf('.');
  if (dotIndex === -1 || dotIndex === localPart.length - 1) return null;
  return localPart.slice(dotIndex + 1).toLowerCase().trim();
}

function resolveAuthorityCategory(user) {
  if (!user) return null;

  const token = extractEmailToken(user.email);
  if (token) {
    if (EMAIL_TOKEN_TO_CATEGORY[token]) {
      return EMAIL_TOKEN_TO_CATEGORY[token];
    }

    // Check if token matches any category slug (e.g. "road.damage" -> "Road Damage")
    const matchedCategory = CATEGORIES.find(
      (cat) => cat.toLowerCase().replace(/\s+/g, '.') === token || cat.toLowerCase() === token
    );
    if (matchedCategory) {
      return matchedCategory;
    }
  }

  if (user.category && user.category !== 'All') {
    return user.category;
  }

  if (user.department && user.department !== 'All') {
    return user.department;
  }

  return null;
}

module.exports = {
  EMAIL_TOKEN_TO_CATEGORY,
  extractEmailToken,
  resolveAuthorityCategory,
};

