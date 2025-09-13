const express = require('express');
const router = express.Router();
const { protect } = require('../../auth/src/middleware/authMiddleware');
const { createPortfolio, getPortfolios, updatePortfolio, deletePortfolio, getPortfolioWithAnalytics } = require('../controllers/portfolioController');
const { validateRequest } = require('../../auth/src/middleware/validationMiddleware');
const { createPortfolioValidation, updatePortfolioValidation } = require('../validations/portfolioValidations');

router.post('/', protect, validateRequest(createPortfolioValidation), createPortfolio);
router.get('/', protect, getPortfolios);
router.get('/:id/analytics', protect, getPortfolioWithAnalytics);
router.put('/:id', protect, validateRequest(updatePortfolioValidation), updatePortfolio);
router.delete('/:id', protect, deletePortfolio);

module.exports = router;