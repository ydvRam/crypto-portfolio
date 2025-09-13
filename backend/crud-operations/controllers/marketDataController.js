const marketDataService = require('../services/marketDataService');
const { asyncHandler } = require('../../auth/src/middleware/errorHandle');

// Get real-time stock quote
exports.getStockQuote = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    return res.status(400).json({
      success: false,
      message: 'Stock symbol is required'
    });
  }

  const stockData = await marketDataService.getStockPrice(symbol.toUpperCase());
  
  res.json({
    success: true,
    data: stockData
  });
});

// Get real-time cryptocurrency quote
exports.getCryptoQuote = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    return res.status(400).json({
      success: false,
      message: 'Cryptocurrency symbol is required'
    });
  }

  const cryptoData = await marketDataService.getCryptoPrice(symbol.toLowerCase());
  
  res.json({
    success: true,
    data: cryptoData
  });
});

// Get multiple stock quotes
// exports.getMultipleStockQuotes = asyncHandler(async (req, res) => {
//   const { symbols } = req.query;
//   
//   if (!symbols) {
//     return res.status(400).json({
//       success: false,
//       message: 'Stock symbols are required (comma-separated)'
//     });
//   }

//   const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
//   const stockData = await marketDataService.getMultipleStockQuotes(symbolArray);
//   
//   res.json({
//     success: true,
//     data: stockData
//   });
// });

// Get multiple crypto quotes
// exports.getMultipleCryptoQuotes = asyncHandler(async (req, res) => {
//   const { symbols } = req.query;
//   
//   if (!symbols) {
//     return res.status(400).json({
//       success: false,
//       message: 'Cryptocurrency symbols are required (comma-separated)'
//     });
//   }

//   const symbolArray = symbols.split(',').map(s => s.trim().toLowerCase());
//   const cryptoData = await marketDataService.getMultipleCryptoQuotes(symbolArray);
//   
//   res.json({
//     success: true,
//     data: stockData
//   });
// });

// Search for stocks
exports.searchStocks = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const stocks = await marketDataService.searchStocks(query);
  
  res.json({
    success: true,
    data: stocks
  });
});

// Search for cryptocurrencies
exports.searchCrypto = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const crypto = await marketDataService.searchCrypto(query);
  
  res.json({
    success: true,
    data: crypto
  });
});

// Get market overview
exports.getMarketOverview = asyncHandler(async (req, res) => {
  const marketData = await marketDataService.getMarketOverview();
  
  res.json({
    success: true,
    data: marketData
  });
});

// Get portfolio with real-time prices
exports.getPortfolioWithLiveData = asyncHandler(async (req, res) => {
  const { portfolioId } = req.params;
  
  // This will be implemented when we enhance the portfolio controller
  // For now, return a placeholder
  res.json({
    success: true,
    message: 'Portfolio with live data endpoint - to be implemented',
    portfolioId
  });
});

// Clear market data cache
exports.clearCache = asyncHandler(async (req, res) => {
  const result = marketDataService.clearCache();
  
  res.json({
    success: true,
    message: result.message
  });
});

// Get cache statistics
exports.getCacheStats = asyncHandler(async (req, res) => {
  const stats = marketDataService.getCacheStats();
  
  res.json({
    success: true,
    data: stats
  });
});
