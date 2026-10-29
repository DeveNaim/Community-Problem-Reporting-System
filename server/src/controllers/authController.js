const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { validateEmail, validatePassword } = require('../utils/validation');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signToken,
} = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const { resolveAuthorityCategory } = require('../utils/authorityCategory');

function sanitizeUser(user) {
  const resolvedCat =
    user.role === 'authority'
      ? resolveAuthorityCategory(user) || user.category || user.department || null
      : user.category || null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    category: resolvedCat,
    department: user.department || resolvedCat,
    status: user.status,
    createdAt: user.createdAt,
  };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name?.trim() || !email || !phone?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, phone, and password are required' });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'citizen',
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(201).json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If an administrator blocked/disabled this user, clearly state that they are restricted
    if (user.status === 'disabled' || user.status === 'blocked') {
      return res.status(403).json({
        message: 'Your account has been restricted by an administrator. Please contact municipal support.',
        restricted: true,
        code: 'ACCOUNT_RESTRICTED',
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status === 'disabled' || user.status === 'blocked') {
      return res.status(403).json({
        message: 'Your account has been restricted by an administrator. Please contact municipal support.',
        restricted: true,
        code: 'ACCOUNT_RESTRICTED',
      });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    res.json({
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to avoid email enumeration
    if (user && user.status === 'active') {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await PasswordReset.deleteMany({ userId: user._id });
      await PasswordReset.create({ userId: user._id, token, expiresAt });

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    res.json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const resetRecord = await PasswordReset.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user || user.status === 'disabled') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    await PasswordReset.deleteMany({ userId: user._id });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

exports.seedDefaultUsers = async (req, res, next) => {
  try {
    const { ensureSeedUsers, DEFAULT_USERS } = require('../utils/ensureSeedUsers');
    const results = await ensureSeedUsers();
    res.json({
      message: 'Default admin, authority, and citizen accounts are verified and ready.',
      results,
      accounts: DEFAULT_USERS.map((u) => ({
        role: u.role,
        email: u.email,
        password: u.password,
        name: u.name,
      })),
    });
  } catch (err) {
    next(err);
  }
};
