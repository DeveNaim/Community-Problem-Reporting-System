const router = require('express').Router();
const users = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Authenticated current user endpoints
router.get('/me', authenticate, users.getMe);
router.put('/me', authenticate, users.updateMe);

// Admin-only user management endpoints
router.get('/', authenticate, requireRole('admin'), users.listUsers);
router.get('/:id', authenticate, requireRole('admin'), users.getUserById);
router.post('/', authenticate, requireRole('admin'), users.createUser);
router.put('/:id', authenticate, requireRole('admin'), users.updateUser);
router.delete('/:id', authenticate, requireRole('admin'), users.deleteUser);
router.put('/:id/status', authenticate, requireRole('admin'), users.updateUserStatus);

module.exports = router;
