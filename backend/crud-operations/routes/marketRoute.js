const express = require('express');
const router = express.Router();
const { getMarketData, getBatchMarketData } = require('../controllers/marketController');

// No auth required for market data (public), but add protect if needed
router.get('/:type/:symbol', getMarketData);
router.post('/batch', getBatchMarketData);

module.exports = router;