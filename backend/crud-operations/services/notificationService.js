const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const emailService = require('./emailService');

class NotificationService {
  // Create a new notification
  async createNotification(userId, notificationData) {
    try {
      const notification = new Notification({
        userId,
        ...notificationData
      });

      await notification.save();
      console.log('✅ Notification created:', notification._id);

      // Check if user wants to receive this type of notification
      const preferences = await NotificationPreference.findOne({ userId });
      if (!preferences) {
        console.log('⚠️ No notification preferences found for user:', userId);
        return notification;
      }

      // Send email if user has email notifications enabled
      if (preferences.emailNotifications) {
        console.log('📧 User has email notifications enabled, attempting to send email for type:', notification.type);
        await this.sendNotificationEmail(notification);
      } else {
        console.log('📧 User has email notifications disabled');
      }

      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  // Send email for a notification
  async sendNotificationEmail(notification) {
    try {
      console.log('📧 Sending email for notification:', notification._id);
      
      const notificationWithUser = await Notification.findById(notification._id)
        .populate('userId', 'email username');

      if (!notificationWithUser.userId) {
        console.error('❌ User not found for notification:', notification._id);
        return;
      }

      console.log('📧 User details for email:', {
        userId: notificationWithUser.userId._id,
        email: notificationWithUser.userId.email,
        username: notificationWithUser.userId.username
      });

      const result = await emailService.sendNotificationEmail(
        notificationWithUser.userId,
        notification
      );

      if (result.success) {
        notification.emailSent = true;
        notification.sent = true;
        await notification.save();
        console.log('✅ Notification email sent successfully');
      } else {
        console.error('❌ Failed to send notification email:', result.error);
      }
    } catch (error) {
      console.error('❌ Error sending notification email:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        limit = 20,
        skip = 0,
        unreadOnly = false,
        type = null
      } = options;

      let query = { userId };
      
      if (unreadOnly) {
        query.read = false;
      }
      
      if (type) {
        query.type = type;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('relatedPortfolio', 'name')
        .lean();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ userId, read: false });

      return {
        notifications,
        total,
        unreadCount,
        hasMore: total > skip + limit
      };
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );

      return result;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  // Portfolio-specific notification methods
  async notifyPortfolioChange(userId, changeType, portfolioData, oldValue = null, newValue = null) {
    const notifications = {
      created: {
        title: 'New Portfolio Created',
        message: `Your portfolio "${portfolioData.name}" has been created successfully.`,
        priority: 'medium'
      },
      updated: {
        title: 'Portfolio Updated',
        message: `Your portfolio "${portfolioData.name}" has been updated.`,
        priority: 'low'
      },
      deleted: {
        title: 'Portfolio Deleted',
        message: `Your portfolio "${portfolioData.name}" has been deleted.`,
        priority: 'high'
      },
      asset_added: {
        title: 'Asset Added to Portfolio',
        message: `A new asset has been added to your portfolio "${portfolioData.name}".`,
        priority: 'medium'
      },
      asset_removed: {
        title: 'Asset Removed from Portfolio',
        message: `An asset has been removed from your portfolio "${portfolioData.name}".`,
        priority: 'medium'
      }
    };

    const notificationConfig = notifications[changeType];
    if (!notificationConfig) {
      console.log('⚠️ Unknown portfolio change type:', changeType);
      return;
    }

    return await this.createNotification(userId, {
      type: 'portfolio_update',
      title: notificationConfig.title,
      message: notificationConfig.message,
      priority: notificationConfig.priority,
      triggeredBy: 'portfolio_change',
      relatedPortfolio: portfolioData._id,
      data: {
        changeType,
        oldValue,
        newValue,
        portfolioName: portfolioData.name
      }
    });
  }

  // Asset-specific notification methods
  async notifyAssetPriceChange(userId, assetData, oldPrice, newPrice, changePercent) {
    const isSignificantChange = Math.abs(changePercent) >= 5; // 5% change threshold
    
    if (!isSignificantChange) {
      return; // Don't notify for small changes
    }

    const priority = Math.abs(changePercent) >= 10 ? 'high' : 'medium';
    const direction = changePercent > 0 ? 'increased' : 'decreased';
    const emoji = changePercent > 0 ? '📈' : '📉';

    return await this.createNotification(userId, {
      type: 'price_alert',
      title: `${emoji} Price Alert: ${assetData.symbol}`,
      message: `${assetData.symbol} price has ${direction} by ${Math.abs(changePercent).toFixed(2)}%.`,
      priority,
      triggeredBy: 'price_change',
      relatedAsset: {
        symbol: assetData.symbol,
        name: assetData.name
      },
      data: {
        oldPrice,
        newPrice,
        changePercent,
        direction
      }
    });
  }

  // Security notification methods
  async notifySecurityEvent(userId, eventType, eventData) {
    const notifications = {
      login: {
        title: 'New Login Detected',
        message: `A new login was detected from ${eventData.ipAddress || 'unknown location'}.`,
        priority: 'medium'
      },
      password_change: {
        title: 'Password Changed',
        message: 'Your password has been successfully changed.',
        priority: 'high'
      },
      suspicious_activity: {
        title: 'Suspicious Activity Detected',
        message: 'Unusual activity has been detected on your account. Please review your recent activity.',
        priority: 'urgent'
      }
    };

    const notificationConfig = notifications[eventType];
    if (!notificationConfig) {
      console.log('⚠️ Unknown security event type:', eventType);
      return;
    }

    return await this.createNotification(userId, {
      type: 'security_alert',
      title: notificationConfig.title,
      message: notificationConfig.message,
      priority: notificationConfig.priority,
      triggeredBy: 'user_action',
      data: eventData
    });
  }

  // System notification methods
  async notifySystemUpdate(userId, updateData) {
    return await this.createNotification(userId, {
      type: 'system_notification',
      title: updateData.title || 'System Update',
      message: updateData.message || 'A system update has been applied.',
      priority: updateData.priority || 'medium',
      triggeredBy: 'system',
      data: updateData
    });
  }

  // Clean up old notifications (run periodically)
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true
      });

      console.log(`✅ Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
