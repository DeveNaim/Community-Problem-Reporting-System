const router = require('express').Router();
const categories = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Public or authenticated can list categories
router.get('/', categories.listCategories);

// Admin-only category management
router.post('/', authenticate, requireRole('admin'), categories.createCategory);
router.put('/:id', authenticate, requireRole('admin'), categories.updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), categories.deleteCategory);

module.exports = router;

