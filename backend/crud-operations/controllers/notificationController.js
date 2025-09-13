const NotificationPreference = require('../models/NotificationPreference');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../../auth/src/middleware/errorHandle');

// Get user notification preferences
const getNotificationPreferences = asyncHandler(async (req, res) => {
  console.log('🔔 Fetching notification preferences for user:', req.user.id);
  
  let preferences = await NotificationPreference.findOne({ userId: req.user.id });
  
  // If no preferences exist, create default ones
  if (!preferences) {
    console.log('📝 Creating default notification preferences for user:', req.user.id);
    preferences = new NotificationPreference({
      userId: req.user.id,
      priceAlerts: true,
      portfolioUpdates: true,
      emailNotifications: true,
      pushNotifications: false
    });
    await preferences.save();
  }
  
  console.log('✅ Notification preferences retrieved:', preferences);
  
  res.json({
    success: true,
    data: preferences
  });
});

// Update user notification preferences
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  console.log('🔔 Updating notification preferences for user:', req.user.id);
  console.log('📝 New preferences:', req.body);
  
  const { priceAlerts, portfolioUpdates, emailNotifications, pushNotifications } = req.body;
  
  // Validate input
  if (typeof priceAlerts !== 'boolean' || typeof portfolioUpdates !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Invalid preference values. All preferences must be boolean.'
    });
  }
  
  // Update or create preferences
  const preferences = await NotificationPreference.findOneAndUpdate(
    { userId: req.user.id },
    {
      priceAlerts,
      portfolioUpdates,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      pushNotifications: pushNotifications !== undefined ? pushNotifications : false,
      lastUpdated: new Date()
    },
    { 
      new: true, 
      upsert: true, 
      runValidators: true 
    }
  );
  
  console.log('✅ Notification preferences updated successfully:', preferences);
  
  res.json({
    success: true,
    data: preferences,
    message: 'Notification preferences updated successfully'
  });
});

// Reset notification preferences to defaults
const resetNotificationPreferences = asyncHandler(async (req, res) => {
  console.log('🔄 Resetting notification preferences to defaults for user:', req.user.id);
  
  const preferences = await NotificationPreference.findOneAndUpdate(
    { userId: req.user.id },
    {
      priceAlerts: true,
      portfolioUpdates: true,
      emailNotifications: true,
      pushNotifications: false,
      lastUpdated: new Date()
    },
    { new: true, upsert: true }
  );
  
  console.log('✅ Notification preferences reset to defaults:', preferences);
  
  res.json({
    success: true,
    data: preferences,
    message: 'Notification preferences reset to defaults'
  });
});

// Get user notifications
const getUserNotifications = asyncHandler(async (req, res) => {
  console.log('🔔 Fetching notifications for user:', req.user.id);
  
  const {
    limit = 20,
    skip = 0,
    unreadOnly = false,
    type = null
  } = req.query;

  try {
    const result = await notificationService.getUserNotifications(req.user.id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true',
      type
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  console.log('🔔 Marking notification as read:', req.params.id);
  
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  console.log('🔔 Marking all notifications as read for user:', req.user.id);
  
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      data: result,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  console.log('🔔 Deleting notification:', req.params.id);
  
  try {
    const notification = await notificationService.deleteNotification(req.user.id, req.params.id);
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete notification'
    });
  }
});

// Get notification count (for badge)
const getNotificationCount = asyncHandler(async (req, res) => {
  console.log('🔔 Fetching notification count for user:', req.user.id);
  
  try {
    const result = await notificationService.getUserNotifications(req.user.id, {
      limit: 1,
      skip: 0,
      unreadOnly: true
    });

    res.json({
      success: true,
      data: {
        unreadCount: result.unreadCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification count'
    });
  }
});

module.exports = {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCount
};
