const bcrypt = require('bcryptjs');
const User = require('../../auth/src/models/user');
const LoginHistory = require('../models/LoginHistory');
const { asyncHandler } = require('../../auth/src/middleware/errorHandle');

// Change password
const changePassword = asyncHandler(async (req, res) => {
  console.log('🔐 User changing password:', req.user.id);
  
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'All password fields are required'
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password and confirm password do not match'
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }
  
  // Get user with current password
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  // Hash new password (use same salt rounds as User model)
  const saltRounds = 10;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
  
  // Update password and set flag to skip pre-save middleware
  user.password = hashedNewPassword;
  user.passwordChangedAt = Date.now();
  user.isPasswordUpdate = true; // Flag to skip pre-save middleware
  await user.save();
  
  console.log('✅ Password changed successfully for user:', req.user.id);
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Get login history
const getLoginHistory = asyncHandler(async (req, res) => {
  console.log('📱 Fetching login history for user:', req.user.id);
  
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  // Get login history with pagination
  const loginHistory = await LoginHistory.find({ userId: req.user.id })
    .sort({ loginTime: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');
  
  // Get total count
  const totalLogins = await LoginHistory.countDocuments({ userId: req.user.id });
  
  // Calculate session duration for each login
  const historyWithDuration = loginHistory.map(login => {
    const loginObj = login.toObject();
    if (login.logoutTime) {
      const durationMs = new Date(login.logoutTime) - new Date(login.loginTime);
      loginObj.sessionDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    } else {
      loginObj.sessionDuration = 0;
    }
    return loginObj;
  });
  
  console.log(`✅ Found ${loginHistory.length} login records for user:`, req.user.id);
  
  res.json({
    success: true,
    data: {
      logins: historyWithDuration,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLogins / limit),
        totalLogins,
        hasNextPage: skip + loginHistory.length < totalLogins,
        hasPrevPage: page > 1
      }
    }
  });
});

// Log logout activity
const logLogout = asyncHandler(async (userId, req) => {
  try {
    // Find the most recent successful login for this user
    const lastLogin = await LoginHistory.findOne({
      userId,
      status: 'success',
      logoutTime: null
    }).sort({ loginTime: -1 });
    
    if (lastLogin) {
      lastLogin.logoutTime = new Date();
      const sessionDuration = Math.round((lastLogin.logoutTime - lastLogin.loginTime) / (1000 * 60));
      lastLogin.sessionDuration = sessionDuration;
      await lastLogin.save();
      
      console.log('📝 Logout activity logged for user:', userId);
    }
  } catch (error) {
    console.error('❌ Error logging logout activity:', error);
  }
});

module.exports = {
  changePassword,
  getLoginHistory,
  logLogout
};
