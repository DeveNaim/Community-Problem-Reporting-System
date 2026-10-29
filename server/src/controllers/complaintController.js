const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const User = require('../models/User');
const { CATEGORIES, STATUSES } = require('../models/Complaint');
const { generateComplaintId } = require('../utils/complaintId');
const { applyStatusChange } = require('../utils/statusChange');
const { resolveAuthorityCategory } = require('../utils/authorityCategory');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

function sanitizeComplaint(complaint) {
  return {
    id: complaint._id,
    complaintId: complaint.complaintId,
    category: complaint.category,
    title: complaint.title,
    description: complaint.description,
    location: complaint.location,
    images: complaint.images,
    status: complaint.status,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

function sanitizeComplaintListItem(complaint) {
  const citizen = complaint.citizenId;
  const authority = complaint.assignedAuthorityId;

  return {
    ...sanitizeComplaint(complaint),
    citizen: citizen
      ? { id: citizen._id, name: citizen.name, email: citizen.email }
      : null,
    assignedAuthority: authority
      ? { id: authority._id, name: authority.name, email: authority.email }
      : null,
  };
}

function sanitizeStatusHistoryEntry(entry) {
  const changedBy = entry.changedBy;
  return {
    status: entry.status,
    note: entry.note || '',
    timestamp: entry.timestamp,
    changedBy: changedBy
      ? {
          id: changedBy._id || changedBy,
          name: changedBy.name || null,
          role: changedBy.role || null,
        }
      : null,
  };
}

function sanitizeComplaintDetail(complaint) {
  const citizen = complaint.citizenId;
  const authority = complaint.assignedAuthorityId;

  return {
    ...sanitizeComplaint(complaint),
    citizen: citizen
      ? { id: citizen._id, name: citizen.name, email: citizen.email }
      : null,
    assignedAuthority: authority
      ? { id: authority._id, name: authority.name, email: authority.email }
      : null,
    statusHistory: (complaint.statusHistory || []).map(sanitizeStatusHistoryEntry),
  };
}

function buildMineFilter(req) {
  const filter = { citizenId: req.user._id };
  const { status, category, search } = req.query;

  if (status) {
    if (!STATUSES.includes(status)) {
      return { error: 'Invalid status filter' };
    }
    filter.status = status;
  }

  if (category && category.trim()) {
    filter.category = category.trim();
  }

  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { complaintId: { $regex: term, $options: 'i' } },
      { location: { $regex: term, $options: 'i' } },
    ];
  }

  return { filter };
}

function buildAdminFilter(req) {
  const filter = {};
  const { status, category, authority, dateFrom, dateTo, search } = req.query;

  if (status) {
    if (!STATUSES.includes(status)) {
      return { error: 'Invalid status filter' };
    }
    filter.status = status;
  }

  if (category && category.trim()) {
    filter.category = category.trim();
  }

  if (authority) {
    if (!mongoose.Types.ObjectId.isValid(authority)) {
      return { error: 'Invalid authority filter' };
    }
    filter.assignedAuthorityId = authority;
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (Number.isNaN(from.getTime())) {
        return { error: 'Invalid dateFrom' };
      }
      filter.createdAt.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (Number.isNaN(to.getTime())) {
        return { error: 'Invalid dateTo' };
      }
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { complaintId: { $regex: term, $options: 'i' } },
      { location: { $regex: term, $options: 'i' } },
    ];
  }

  return { filter };
}

function refId(value) {
  if (!value) return null;
  return (value._id || value).toString();
}

function canAccessComplaint(complaint, user) {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'citizen') {
    return refId(complaint.citizenId) === user._id.toString();
  }

  if (user.role === 'authority') {
    const authCat = resolveAuthorityCategory(user);
    const isAssignedToUser =
      complaint.assignedAuthorityId &&
      refId(complaint.assignedAuthorityId) === user._id.toString();
    const isMatchingCategory = Boolean(authCat && complaint.category === authCat);
    return isAssignedToUser || isMatchingCategory;
  }

  return false;
}

async function loadComplaintDetail(id) {
  return Complaint.findById(id)
    .populate('citizenId', 'name email')
    .populate('assignedAuthorityId', 'name email')
    .populate('statusHistory.changedBy', 'name role');
}

exports.createComplaint = async (req, res, next) => {
  try {
    const { category, title, description, location } = req.body;

    if (!category || !title?.trim() || !description?.trim() || !location?.trim()) {
      return res.status(400).json({
        message: 'Category, title, description, and location are required',
      });
    }

    if (!CATEGORIES.includes(category)) {
      const customCategory = await Category.exists({ name: category.trim() });
      if (!customCategory) {
        return res.status(400).json({ message: 'Invalid complaint category' });
      }
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: 'Maximum 3 images allowed' });
      }

      if (isCloudinaryConfigured()) {
        try {
          const uploadPromises = req.files.map((file) =>
            uploadToCloudinary(file.buffer, {
              folder: 'cprs/complaints',
            })
          );
          const results = await Promise.all(uploadPromises);
          imageUrls = results.map((result) => result.secure_url || result.url);
        } catch (uploadErr) {
          console.error('[Cloudinary] Upload failed:', uploadErr);
          return res.status(502).json({
            message: `Image upload to Cloudinary failed: ${uploadErr.message || 'Unknown error'}`,
          });
        }
      } else {
        // Fallback to local storage if Cloudinary is not configured
        const fs = require('fs');
        const path = require('path');
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        imageUrls = req.files.map((file) => {
          const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
          fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
          return `/uploads/${filename}`;
        });
      }
    } else if (Array.isArray(req.body.images)) {
      imageUrls = req.body.images.slice(0, 3);
    }

    const complaintId = await generateComplaintId();
    const now = new Date();

    const complaint = await Complaint.create({
      complaintId,
      citizenId: req.user._id,
      category,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      images: imageUrls,
      status: 'Pending Verification',
      statusHistory: [
        {
          status: 'Pending Verification',
          changedBy: req.user._id,
          note: 'Complaint submitted',
          timestamp: now,
        },
      ],
    });

    res.status(201).json({ complaint: sanitizeComplaint(complaint) });
  } catch (err) {
    next(err);
  }
};

async function computeComplaintStats(baseFilter = {}) {
  const matchStage = Object.keys(baseFilter).length ? [{ $match: baseFilter }] : [];
  const grouped = await Complaint.aggregate([
    ...matchStage,
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const byStatus = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
  const pendingVerification = byStatus['Pending Verification'] || 0;
  const verified = byStatus['Verified'] || 0;
  const assigned = byStatus['Assigned'] || 0;
  const inProgressOnly = byStatus['In Progress'] || 0;
  const active = verified + assigned + inProgressOnly;
  const assignedAndInProgress = assigned + inProgressOnly;
  const resolved = byStatus['Resolved'] || 0;
  const rejected = byStatus['Rejected'] || 0;
  const unableToResolve = byStatus['Unable to Resolve'] || 0;
  const closed = rejected + unableToResolve;
  const total = pendingVerification + active + resolved + closed;

  return {
    total,
    pendingVerification,
    verified,
    assigned,
    inProgressOnly,
    active,
    assignedAndInProgress,
    resolved,
    rejected,
    unableToResolve,
    closed,
  };
}

exports.getMyComplaints = async (req, res, next) => {
  try {
    const { filter, error } = buildMineFilter(req);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const [complaints, stats] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }),
      computeComplaintStats({ citizenId: req.user._id }),
    ]);
    res.json({ complaints: complaints.map(sanitizeComplaint), stats });
  } catch (err) {
    next(err);
  }
};

exports.listAllComplaints = async (req, res, next) => {
  try {
    const { filter, error } = buildAdminFilter(req);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const [complaints, stats] = await Promise.all([
      Complaint.find(filter)
        .populate('citizenId', 'name email')
        .populate('assignedAuthorityId', 'name email')
        .sort({ createdAt: -1 }),
      computeComplaintStats({}),
    ]);

    res.json({ complaints: complaints.map(sanitizeComplaintListItem), stats });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const complaint = await loadComplaintDetail(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ complaint: sanitizeComplaintDetail(complaint) });
  } catch (err) {
    next(err);
  }
};

exports.verifyComplaint = async (req, res, next) => {
  try {
    const { decision, reason } = req.body;

    if (!['verified', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be verified or rejected' });
    }

    if (decision === 'rejected' && !reason?.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Pending Verification') {
      return res.status(400).json({ message: 'Only pending complaints can be verified or rejected' });
    }

    const newStatus = decision === 'verified' ? 'Verified' : 'Rejected';
    const note = decision === 'rejected' ? reason.trim() : 'Verified by admin';

    await applyStatusChange(complaint, {
      status: newStatus,
      changedBy: req.user._id,
      note,
    });

    const updated = await loadComplaintDetail(complaint._id);
    res.json({ complaint: sanitizeComplaintDetail(updated) });
  } catch (err) {
    next(err);
  }
};

exports.assignComplaint = async (req, res, next) => {
  try {
    const { authorityId } = req.body;

    if (!authorityId || !mongoose.Types.ObjectId.isValid(authorityId)) {
      return res.status(400).json({ message: 'Valid authorityId is required' });
    }

    const authority = await User.findOne({
      _id: authorityId,
      role: 'authority',
      status: 'active',
    });

    if (!authority) {
      return res.status(404).json({ message: 'Authority not found or inactive' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Verified') {
      return res.status(400).json({ message: 'Only verified complaints can be assigned' });
    }

    complaint.assignedAuthorityId = authority._id;
    await applyStatusChange(complaint, {
      status: 'Assigned',
      changedBy: req.user._id,
      note: `Assigned to ${authority.name}`,
    });

    const updated = await loadComplaintDetail(complaint._id);
    res.json({ complaint: sanitizeComplaintDetail(updated) });
  } catch (err) {
    next(err);
  }
};

exports.getAssignedComplaints = async (req, res, next) => {
  try {
    const authorityCategory = resolveAuthorityCategory(req.user);
    const baseScopeFilter = authorityCategory
      ? { $or: [{ category: authorityCategory }, { assignedAuthorityId: req.user._id }] }
      : { assignedAuthorityId: req.user._id };

    const conditions = [baseScopeFilter];
    const { status, search } = req.query;

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      conditions.push({ status });
    }

    if (search?.trim()) {
      const term = search.trim();
      conditions.push({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { complaintId: { $regex: term, $options: 'i' } },
          { location: { $regex: term, $options: 'i' } },
        ],
      });
    }

    const filter = conditions.length === 1 ? conditions[0] : { $and: conditions };

    const [complaints, stats] = await Promise.all([
      Complaint.find(filter)
        .populate('citizenId', 'name email')
        .populate('assignedAuthorityId', 'name email')
        .sort({ updatedAt: -1, createdAt: -1 }),
      computeComplaintStats(baseScopeFilter),
    ]);

    res.json({
      complaints: complaints.map(sanitizeComplaintListItem),
      authorityCategory,
      stats,
    });
  } catch (err) {
    next(err);
  }
};

const AUTHORITY_UPDATE_STATUSES = ['In Progress', 'Resolved', 'Unable to Resolve'];
const AUTHORITY_UPDATABLE_FROM = ['Pending Verification', 'Verified', 'Assigned', 'In Progress'];

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status || !AUTHORITY_UPDATE_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Status must be one of: In Progress, Resolved, Unable to Resolve',
      });
    }

    if (!note?.trim()) {
      return res.status(400).json({ message: 'Progress note is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!AUTHORITY_UPDATABLE_FROM.includes(complaint.status)) {
      return res.status(400).json({
        message: `Cannot update status from "${complaint.status}"`,
      });
    }

    if (!complaint.assignedAuthorityId) {
      complaint.assignedAuthorityId = req.user._id;
    }

    await applyStatusChange(complaint, {
      status,
      changedBy: req.user._id,
      note: note.trim(),
    });

    const updated = await loadComplaintDetail(complaint._id);
    res.json({ complaint: sanitizeComplaintDetail(updated) });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Permission check: Admin, owner citizen, or matching category authority
    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({ message: 'You are not authorized to edit this complaint' });
    }

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Title cannot be empty' });
      complaint.title = title.trim();
    }
    if (description !== undefined) {
      if (!description.trim()) return res.status(400).json({ message: 'Description cannot be empty' });
      complaint.description = description.trim();
    }
    if (category !== undefined) {
      if (!category.trim()) return res.status(400).json({ message: 'Category cannot be empty' });
      complaint.category = category.trim();
    }
    if (location !== undefined) {
      if (!location.trim()) return res.status(400).json({ message: 'Location cannot be empty' });
      complaint.location = location.trim();
    }

    if (req.files && req.files.length > 0) {
      let imageUrls = [];
      if (isCloudinaryConfigured()) {
        try {
          const uploadPromises = req.files.map((file) =>
            uploadToCloudinary(file.buffer, { folder: 'cprs/complaints' })
          );
          const results = await Promise.all(uploadPromises);
          imageUrls = results.map((result) => result.secure_url || result.url);
        } catch (uploadErr) {
          console.error('[Cloudinary] Upload failed:', uploadErr);
        }
      } else {
        const fs = require('fs');
        const path = require('path');
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        imageUrls = req.files.map((file) => {
          const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
          fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
          return `/uploads/${filename}`;
        });
      }
      if (imageUrls.length > 0) {
        complaint.images = imageUrls.slice(0, 3);
      }
    }

    await complaint.save();
    const updated = await loadComplaintDetail(complaint._id);
    res.json({
      message: 'Complaint updated successfully',
      complaint: sanitizeComplaintDetail(updated),
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Permission check: Admin, owner citizen, or matching category authority
    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({ message: 'You are not authorized to delete this complaint' });
    }

    const Notification = require('../models/Notification');
    await Notification.deleteMany({ complaintId: complaint._id });
    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      message: `Complaint ${complaint.complaintId} was deleted successfully`,
      id: complaint._id,
      complaintId: complaint.complaintId,
    });
  } catch (err) {
    next(err);
  }
};
