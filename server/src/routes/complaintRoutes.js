const router = require('express').Router();
const multer = require('multer');
const complaints = require('../controllers/complaintController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadComplaintImages } = require('../config/upload');

function handleUpload(req, res, next) {
  uploadComplaintImages(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Each image must be 5MB or less' });
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Maximum 3 images allowed' });
      }
    }

    return res.status(400).json({ message: err.message || 'Invalid image upload' });
  });
}

router.use(authenticate);

// Citizen (SRS 5.2, 5.3)
router.post('/', requireRole('citizen'), handleUpload, complaints.createComplaint);
router.get('/mine', requireRole('citizen'), complaints.getMyComplaints);

// Authority (SRS 5.5) — must precede /:id
router.get('/assigned', requireRole('authority'), complaints.getAssignedComplaints);

// Admin (SRS 5.4)
router.get('/', requireRole('admin'), complaints.listAllComplaints);
router.put('/:id/verify', requireRole('admin'), complaints.verifyComplaint);
router.put('/:id/assign', requireRole('admin'), complaints.assignComplaint);

// Authority status update (SRS 5.5)
router.put('/:id/status', requireRole('authority'), complaints.updateComplaintStatus);

// Shared detail view, update & delete
router.get('/:id', complaints.getComplaintById);
router.put('/:id', handleUpload, complaints.updateComplaint);
router.delete('/:id', complaints.deleteComplaint);

module.exports = router;
