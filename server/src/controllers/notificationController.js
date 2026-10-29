const mongoose = require('mongoose');
const Notification = require('../models/Notification');

function sanitizeNotification(notification) {
  const complaint = notification.complaintId;
  return {
    id: notification._id,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    complaint: complaint
      ? {
          id: complaint._id,
          complaintId: complaint.complaintId,
          title: complaint.title,
        }
      : null,
  };
}

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('complaintId', 'complaintId title');

    res.json({ notifications: notifications.map(sanitizeNotification) });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('complaintId', 'complaintId title');
    res.json({
      message: 'All notifications marked as read',
      notifications: notifications.map(sanitizeNotification),
    });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ notification: sanitizeNotification(notification) });
  } catch (err) {
    next(err);
  }
};
