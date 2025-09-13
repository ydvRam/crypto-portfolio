const Watchlist = require('../models/watchlistModel');
const marketDataService = require('../services/marketDataService');
const { asyncHandler } = require('../../auth/src/middleware/errorHandle');

// Create a new watchlist
exports.createWatchlist = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;
  
  // Check if user already has a watchlist with this name
  const existingWatchlist = await Watchlist.findOne({ 
    userId: req.user.id, 
    name: name || 'My Watchlist' 
  });
  
  if (existingWatchlist) {
    return res.status(400).json({
      success: false,
      message: 'Watchlist with this name already exists'
    });
  }

  const watchlist = new Watchlist({
    userId: req.user.id,
    name: name || 'My Watchlist',
    description,
    isPublic: isPublic || false,
    items: []
  });

  await watchlist.save();

  res.status(201).json({
    success: true,
    data: watchlist
  });
});

// Get user's watchlists
exports.getWatchlists = asyncHandler(async (req, res) => {
  const watchlists = await Watchlist.find({ userId: req.user.id })
    .select('-items') // Don't include items for list view
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: watchlists
  });
});

// Get specific watchlist with items
exports.getWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const watchlist = await Watchlist.findOne({ 
    _id: id, 
    userId: req.user.id 
  });

  if (!watchlist) {
    return res.status(404).json({
      success: false,
      message: 'Watchlist not found'
    });
  }

  // Update current prices for all items
  const updatedItems = await Promise.all(
    watchlist.items.map(async (item) => {
      try {
        let currentPrice = 0;
        if (item.type === 'stock') {
          const stockData = await marketDataService.getStockQuote(item.symbol);
          currentPrice = stockData.price;
        } else if (item.type === 'crypto') {
          const cryptoData = await marketDataService.getCryptoQuote(item.symbol);
          currentPrice = cryptoData.price;
        }
        
        return {
          ...item.toObject(),
          currentPrice,
          lastUpdated: new Date()
        };
      } catch (error) {
        console.error(`Error updating price for ${item.symbol}:`, error.message);
        return item;
      }
    })
  );

  // Update watchlist with new prices
  watchlist.items = updatedItems;
  watchlist.lastUpdated = Date.now();
  await watchlist.save();

  res.json({
    success: true,
    data: watchlist
  });
});

// Add item to watchlist
exports.addToWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { symbol, type, name, targetPrice, notes } = req.body;
  
  const watchlist = await Watchlist.findOne({ 
    _id: id, 
    userId: req.user.id 
  });

  if (!watchlist) {
    return res.status(404).json({
      success: false,
      message: 'Watchlist not found'
    });
  }

  // Check if item already exists
  const existingItem = watchlist.items.find(item => 
    item.symbol.toLowerCase() === symbol.toLowerCase() && item.type === type
  );

  if (existingItem) {
    return res.status(400).json({
      success: false,
      message: 'Item already exists in watchlist'
    });
  }

  // Get current price
  let currentPrice = 0;
  try {
    if (type === 'stock') {
      const stockData = await marketDataService.getStockQuote(symbol);
      currentPrice = stockData.price;
    } else if (type === 'crypto') {
      const cryptoData = await marketDataService.getCryptoQuote(symbol);
      currentPrice = cryptoData.price;
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    // Continue without price - user can add it manually later
  }

  const newItem = {
    symbol: symbol.toUpperCase(),
    type,
    name: name || symbol,
    currentPrice,
    targetPrice,
    notes,
    addedAt: new Date(),
    lastUpdated: new Date()
  };

  watchlist.items.push(newItem);
  watchlist.lastUpdated = Date.now();
  await watchlist.save();

  // Get the saved item with its ID by finding it in the updated watchlist
  const updatedWatchlist = await Watchlist.findById(watchlist._id);
  const savedItem = updatedWatchlist.items[updatedWatchlist.items.length - 1];

  res.status(201).json({
    success: true,
    data: savedItem
  });
});

// Update watchlist item
exports.updateWatchlistItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  const { name, targetPrice, notes } = req.body;
  
  const watchlist = await Watchlist.findOne({ 
    _id: id, 
    userId: req.user.id 
  });

  if (!watchlist) {
    return res.status(404).json({
      success: false,
      message: 'Watchlist not found'
    });
  }

  const item = watchlist.items.id(itemId);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  // Update fields
  if (name !== undefined) item.name = name;
  if (targetPrice !== undefined) item.targetPrice = targetPrice;
  if (notes !== undefined) item.notes = notes;
  
  item.lastUpdated = Date.now();
  watchlist.lastUpdated = Date.now();
  await watchlist.save();

  res.json({
    success: true,
    data: item
  });
});

// Remove item from watchlist
exports.removeFromWatchlist = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  
  const watchlist = await Watchlist.findOne({ 
    _id: id, 
    userId: req.user.id 
  });

  if (!watchlist) {
    return res.status(404).json({
      success: false,
      message: 'Watchlist not found'
    });
  }

  const item = watchlist.items.id(itemId);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  item.remove();
  watchlist.lastUpdated = Date.now();
  await watchlist.save();

  res.json({
    success: true,
    message: 'Item removed from watchlist'
  });
});

// Update watchlist settings
exports.updateWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isPublic } = req.body;
  
  const watchlist = await Watchlist.findOne({ 
    _id: id, 
    userId: req.user.id 
  });

  if (!watchlist) {
    return res.status(404).json({
      success: false,
      message: 'Watchlist not found'
    });
  }

  // Check if name is being changed and if it conflicts with existing watchlist
  if (name && name !== watchlist.name) {
    const existingWatchlist = await Watchlist.findOne({ 
      userId: req.user.id, 
      name 
    });
    
    if (existingWatchlist) {
      return res.status(400).json({
        success: false,
        message: 'Watchlist with this name already exists'
      });
    }
  }

  // Update fields
  if (name !== undefined) watchlist.name = name;
  if (description !== undefined) watchlist.description = description;
  if (isPublic !== undefined) watchlist.isPublic = isPublic;
  
  watchlist.lastUpdated = Date.now();
  await watchlist.save();

  res.json({
    success: true,
    data: watchlist
  });
});

// Delete watchlist
exports.deleteWatchlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const watchlist = await Watchlist.findOne({ 
    _id: id, 
    userId: req.user.id 
  });

  if (!watchlist) {
    return res.status(404).json({
      success: false,
      message: 'Watchlist not found'
    });
  }

  await watchlist.deleteOne();

  res.json({
    success: true,
    message: 'Watchlist deleted successfully'
  });
});

// Get public watchlists (for discovery)
exports.getPublicWatchlists = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'updatedAt' } = req.query;
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: -1 }
  };

  const watchlists = await Watchlist.find({ isPublic: true })
    .populate('userId', 'username')
    .select('-items')
    .sort(options.sort)
    .limit(options.limit)
    .skip((options.page - 1) * options.limit);

  const total = await Watchlist.countDocuments({ isPublic: true });

  res.json({
    success: true,
    data: watchlists,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      pages: Math.ceil(total / options.limit)
    }
  });
});

// Refresh watchlist prices
exports.refreshPrices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const watchlist = await Watchlist.findOne({ 
    _id: id, 
    userId: req.user.id 
  });

  if (!watchlist) {
    return res.status(404).json({
      success: false,
      message: 'Watchlist not found'
    });
  }

  // Update prices for all items
  const updatedItems = await Promise.all(
    watchlist.items.map(async (item) => {
      try {
        let currentPrice = 0;
        if (item.type === 'stock') {
          const stockData = await marketDataService.getStockQuote(item.symbol);
          currentPrice = stockData.price;
        } else if (item.type === 'crypto') {
          const cryptoData = await marketDataService.getCryptoQuote(item.symbol);
          currentPrice = cryptoData.price;
        }
        
        return {
          ...item.toObject(),
          currentPrice,
          lastUpdated: new Date()
        };
      } catch (error) {
        console.error(`Error updating price for ${item.symbol}:`, error.message);
        return item;
      }
    })
  );

  watchlist.items = updatedItems;
  watchlist.lastUpdated = Date.now();
  await watchlist.save();

  res.json({
    success: true,
    data: watchlist,
    message: 'Prices refreshed successfully'
  });
});
