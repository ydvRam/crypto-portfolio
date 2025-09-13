const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String,
    default: 'unknown'
  },
  operatingSystem: {
    type: String,
    default: 'unknown'
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'suspicious'],
    default: 'success'
  },
  sessionDuration: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
loginHistorySchema.index({ userId: 1, loginTime: -1 });
loginHistorySchema.index({ loginTime: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
