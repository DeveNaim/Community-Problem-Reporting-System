const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-cprs-jwt-secret-change-in-production';
}

function getJwtRefreshSecret() {
  return (
    process.env.JWT_REFRESH_SECRET ||
    `${getJwtSecret()}-cprs-refresh-secret-v1`
  );
}

// Access token is valid for 15 minutes as requested
function signAccessToken(user) {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      type: 'access',
    },
    getJwtSecret(),
    { expiresIn }
  );
}

// Refresh token valid for 7 days
function signRefreshToken(user) {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      type: 'refresh',
    },
    getJwtRefreshSecret(),
    { expiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function verifyRefreshToken(token) {
  return jwt.verify(token, getJwtRefreshSecret());
}

// Backwards compatibility alias
const signToken = signAccessToken;

module.exports = {
  getJwtSecret,
  getJwtRefreshSecret,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  signToken,
};
