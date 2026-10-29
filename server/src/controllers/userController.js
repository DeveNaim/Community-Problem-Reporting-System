const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { validateEmail, validatePassword } = require('../utils/validation');
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

exports.getMe = (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

exports.getUserById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({ message: 'Phone cannot be empty' });
      }
      user.phone = phone.trim();
    }

    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      user.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.role) {
      if (!['citizen', 'authority', 'admin'].includes(req.query.role)) {
        return res.status(400).json({ message: 'Invalid role filter' });
      }
      filter.role = req.query.role;
    }

    if (req.query.status) {
      if (!['active', 'disabled'].includes(req.query.status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { category: regex }];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users: users.map(sanitizeUser) });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, category, department } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, phone, and password are required' });
    }

    if (!role || !['citizen', 'authority', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role (citizen, authority, admin) is required' });
    }

    const emailError = validateEmail(email.trim());
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

    if (role === 'authority' && !category?.trim()) {
      return res.status(400).json({ message: 'Category is required for authority accounts' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role,
      category: category?.trim() || null,
      department: department?.trim() || category?.trim() || null,
      status: 'active',
    });

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, category, department, password, role } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({ message: 'Phone cannot be empty' });
      }
      user.phone = phone.trim();
    }

    if (category !== undefined) {
      user.category = category ? category.trim() : null;
      user.department = user.category;
    }

    if (department !== undefined && !category) {
      user.department = department ? department.trim() : null;
    }

    if (role !== undefined) {
      // Prevent demoting oneself
      if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
        return res.status(400).json({ message: 'You cannot change your own admin role' });
      }
      user.role = role;
    }

    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }
      user.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.save();
    res.json({
      message: 'User updated successfully',
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Explicit security rule: admin cannot delete himself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account (${user.email}) was deleted successfully`,
      id: user._id,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or disabled' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own account status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({
      message: `User status updated to ${status}`,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};
