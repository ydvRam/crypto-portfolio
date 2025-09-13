const express = require('express');
const router = express.Router();
const { protect } = require('../../auth/src/middleware/authMiddleware');
const {
  changePassword,
  getLoginHistory
} = require('../controllers/securityController');

// All routes are protected (require authentication)
router.use(protect);

// PUT /api/security/change-password - Change user password
router.put('/change-password', changePassword);

// GET /api/security/login-history - Get user login history
router.get('/login-history', getLoginHistory);

module.exports = router;
