const express = require('express');
const router = express.Router();
const { protect } = require('../../auth/src/middleware/authMiddleware');
const {
  getStockQuote,
  getCryptoQuote,
  searchStocks,
  searchCrypto,
  getMarketOverview,
  getPortfolioWithLiveData,
  clearCache,
  getCacheStats
} = require('../controllers/marketDataController');

// Public routes (no authentication required)
router.get('/stocks/quote/:symbol', getStockQuote);
router.get('/crypto/quote/:symbol', getCryptoQuote);
router.get('/stocks/search', searchStocks);
router.get('/crypto/search', searchCrypto);
router.get('/overview', getMarketOverview);

// Protected routes (authentication required)
router.get('/portfolio/:portfolioId/live', protect, getPortfolioWithLiveData);
router.delete('/cache', protect, clearCache);
router.get('/cache/stats', protect, getCacheStats);

module.exports = router;
