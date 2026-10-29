const mongoose = require('mongoose');

// SRS Section 9.1
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'authority'],
      default: 'citizen',
    },
    category: {
      type: String,
      trim: true,
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
