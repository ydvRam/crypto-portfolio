const jwt = require("jsonwebtoken");
const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const { asyncHandler } = require("../middleware/errorHandle");

// Import LoginHistory model directly
const LoginHistory = require("../../../crud-operations/models/LoginHistory");

// Helper function to log login activity
const logLoginActivity = async (userId, req, status = 'success') => {
  try {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Parse user agent to get device info
    let deviceType = 'unknown';
    let browser = 'unknown';
    let operatingSystem = 'unknown';
    
    if (userAgent !== 'unknown') {
      // Simple device detection
      if (userAgent.includes('Mobile')) {
        deviceType = 'mobile';
      } else if (userAgent.includes('Tablet')) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }
      
      // Browser detection
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
      
      // OS detection
      if (userAgent.includes('Windows')) operatingSystem = 'Windows';
      else if (userAgent.includes('Mac')) operatingSystem = 'macOS';
      else if (userAgent.includes('Linux')) operatingSystem = 'Linux';
      else if (userAgent.includes('Android')) operatingSystem = 'Android';
      else if (userAgent.includes('iOS')) operatingSystem = 'iOS';
    }
    
    const loginRecord = new LoginHistory({
      userId,
      ipAddress,
      userAgent,
      deviceType,
      browser,
      operatingSystem,
      status
    });
    
    await loginRecord.save();
    console.log('📝 Login activity logged for user:', userId);
    
    return loginRecord;
  } catch (error) {
    console.error('❌ Error logging login activity:', error);
    // Don't fail the login if logging fails
    return null;
  }
};

// Register
const registerUser = asyncHandler(async (req, res) => {
  console.log('🔍 Registration attempt:', { username: req.body.username, email: req.body.email });
  
  const { username, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    console.log('❌ User already exists:', userExists.email === email ? 'Email' : 'Username');
    return res.status(400).json({ 
      success: false,
      message: userExists.email === email ? "Email already registered" : "Username already taken" 
    });
  }

  try {
    // Create user
    const user = await User.create({ username, email, password });
    console.log('✅ User created successfully:', user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      }
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid credentials" 
    });
  }

  // Check password
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid credentials" 
    });
  }

  // Log successful login
  try {
    await logLoginActivity(user._id, req, 'success');
  } catch (error) {
    console.error('❌ Error logging login activity:', error);
    // Don't fail the login if logging fails
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    }
  });
});

// Get user profile
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: "User not found" 
    });
  }

  res.json({
    success: true,
    data: user
  });
});

module.exports = { registerUser, loginUser, getMe };
