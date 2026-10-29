const router = require('express').Router();
const notifications = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notifications.listNotifications);
router.put('/read-all', notifications.markAllAsRead);
router.put('/:id/read', notifications.markAsRead);

module.exports = router;
