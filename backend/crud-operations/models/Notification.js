const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['price_alert', 'portfolio_update', 'security_alert', 'system_notification'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  sent: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  triggeredBy: {
    type: String,
    enum: ['price_change', 'portfolio_change', 'user_action', 'system'],
    default: 'system'
  },
  relatedAsset: {
    symbol: String,
    name: String
  },
  relatedPortfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio'
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, sent: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
