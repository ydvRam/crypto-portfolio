const express = require('express');
const router = express.Router();
const { protect } = require('../../auth/src/middleware/authMiddleware');
const {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCount
} = require('../controllers/notificationController');

// All routes are protected (require authentication)
router.use(protect);

// Notification preferences routes
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);
router.post('/preferences/reset', resetNotificationPreferences);

// Notification management routes
router.get('/', getUserNotifications); // Get user notifications with query params
router.get('/count', getNotificationCount); // Get unread notification count
router.put('/:id/read', markNotificationAsRead); // Mark single notification as read
router.put('/mark-all-read', markAllNotificationsAsRead); // Mark all notifications as read
router.delete('/:id', deleteNotification); // Delete notification

module.exports = router;
