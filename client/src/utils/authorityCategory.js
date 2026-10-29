import { COMPLAINT_CATEGORIES } from '../constants/categories.js';

export const EMAIL_TOKEN_TO_CATEGORY = {
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
 * Extracts the token after '.' and before '@' from an authority email
 * Example: "authority.roads@cprs.local" -> "roads"
 */
export function extractAuthorityEmailToken(email) {
  if (!email || typeof email !== 'string') return '';
  const localPart = email.split('@')[0] || '';
  const dotIndex = localPart.indexOf('.');
  if (dotIndex === -1 || dotIndex === localPart.length - 1) return '';
  return localPart.slice(dotIndex + 1).toLowerCase().trim();
}

/**
 * Resolves the complaint category for an authority user based on the email pattern
 * (between '.' and '@') or their assigned user.category field.
 */
export function getAuthorityCategoryFromUser(user) {
  if (!user) return '';

  const token = extractAuthorityEmailToken(user.email);
  if (token) {
    if (EMAIL_TOKEN_TO_CATEGORY[token]) {
      return EMAIL_TOKEN_TO_CATEGORY[token];
    }

    const matched = COMPLAINT_CATEGORIES.find(
      (cat) => cat.toLowerCase().replace(/\s+/g, '.') === token || cat.toLowerCase() === token
    );
    if (matched) {
      return matched;
    }
  }

  if (user.category && user.category !== 'All') {
    return user.category;
  }

  if (user.department && user.department !== 'All') {
    return user.department;
  }

  return '';
}

