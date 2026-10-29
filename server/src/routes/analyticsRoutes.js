const router = require('express').Router();
const analytics = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/summary', authenticate, requireRole('admin', 'authority'), analytics.getSummary);
router.get('/export', authenticate, requireRole('admin', 'authority'), analytics.exportCsv);

module.exports = router;
