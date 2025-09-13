const Portfolio = require('../models/portfolioModel');
const Asset = require('../models/assetModel');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../../auth/src/middleware/errorHandle');
const marketDataService = require('../services/marketDataService');

// Get all portfolios for a user
const getPortfolios = asyncHandler(async (req, res) => {
  console.log('📊 Fetching portfolios for user:', req.user.id);
  
  const portfolios = await Portfolio.find({ userId: req.user.id }).populate('assets');
  console.log(`📁 Found ${portfolios.length} portfolios`);
  
  // Update asset prices with real market data
  for (const portfolio of portfolios) {
    if (portfolio.assets && portfolio.assets.length > 0) {
      console.log(`🔄 Updating prices for portfolio: ${portfolio.name} (${portfolio.assets.length} assets)`);
      
      // Debug: Log original assets
      console.log(`🔍 Original assets before update:`, portfolio.assets.map(a => ({ 
        _id: a._id, 
        symbol: a.symbol, 
        type: a.type,
        currentPrice: a.currentPrice 
      })));
      
      // Convert Mongoose documents to plain objects to preserve all properties
      const plainAssets = portfolio.assets.map(asset => asset.toObject ? asset.toObject() : asset);
      console.log(`🔍 Plain assets (converted from Mongoose):`, plainAssets.map(a => ({ 
        _id: a._id, 
        symbol: a.symbol, 
        type: a.type,
        currentPrice: a.currentPrice 
      })));
      
      const updatedAssets = await marketDataService.updateAssetPrices(plainAssets);
      
      // Debug: Log updated assets
      console.log(`🔍 Updated assets after market data service:`, updatedAssets.map(a => ({ 
        _id: a._id, 
        symbol: a.symbol, 
        type: a.type,
        currentPrice: a.currentPrice 
      })));
      
      // Save updated asset prices to database
      console.log(`📊 Processing ${updatedAssets.length} assets for database update`);
      
      for (let i = 0; i < updatedAssets.length; i++) {
        const updatedAsset = updatedAssets[i];
        const originalAsset = portfolio.assets[i];
        
        console.log(`🔍 Asset ${updatedAsset.symbol}: currentPrice=${updatedAsset.currentPrice}, _id=${updatedAsset._id}`);
        
        if (updatedAsset.currentPrice && updatedAsset.currentPrice > 0) {
          try {
            console.log(`💾 Attempting to save price for ${updatedAsset.symbol}: $${updatedAsset.currentPrice} (ID: ${updatedAsset._id})`);
            
            const result = await Asset.findByIdAndUpdate(updatedAsset._id, {
              currentPrice: updatedAsset.currentPrice,
              lastUpdated: updatedAsset.lastUpdated
            }, { new: true });
            
            if (result) {
              console.log(`✅ Successfully saved price for ${updatedAsset.symbol}: $${updatedAsset.currentPrice}`);
              
              // Update the original asset in place with the new currentPrice
              if (originalAsset) {
                originalAsset.currentPrice = updatedAsset.currentPrice;
                originalAsset.lastUpdated = updatedAsset.lastUpdated;
                console.log(`🔄 Updated asset ${updatedAsset.symbol} in portfolio with new price: $${updatedAsset.currentPrice}`);
              }
            } else {
              console.log(`⚠️ No document found to update for ${updatedAsset.symbol}`);
            }
          } catch (error) {
            console.error(`❌ Error saving price for ${updatedAsset.symbol}:`, error.message);
            console.error(`❌ Full error:`, error);
          }
        } else {
          console.log(`⚠️ Skipping save for ${updatedAsset.symbol} - no valid currentPrice: ${updatedAsset.currentPrice}`);
        }
      }
      
      // DON'T replace the entire assets array - this corrupts the data!
      // Instead, just update the currentPrice in the existing assets
      console.log(`✅ Portfolio ${portfolio.name} updated with real-time prices (assets preserved)`);
    } else {
      console.log(`ℹ️ Portfolio ${portfolio.name} has no assets to update`);
    }
  }

  console.log('✅ All portfolios updated, sending response');
  res.json({
    success: true,
    data: portfolios
  });
});

// Create a new portfolio
const createPortfolio = asyncHandler(async (req, res) => {
  const portfolioData = {
    ...req.body,
    userId: req.user.id
  };

  const portfolio = await Portfolio.create(portfolioData);
  
  // Send notification for portfolio creation
  try {
    await notificationService.notifyPortfolioChange(req.user.id, 'created', portfolio);
  } catch (notificationError) {
    console.warn('⚠️ Failed to send portfolio creation notification:', notificationError.message);
  }
  
  res.status(201).json({
    success: true,
    data: portfolio
  });
});

// Update a portfolio
const updatePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    });
  }

  if (portfolio.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this portfolio'
    });
  }

  const updatedPortfolio = await Portfolio.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedPortfolio
  });
});

// Delete a portfolio
const deletePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  
  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio not found'
    });
  }

  if (portfolio.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this portfolio'
    });
  }

  // Delete all assets in the portfolio
  await Asset.deleteMany({ portfolioId: req.params.id });
  
  // Delete the portfolio
  await Portfolio.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Portfolio deleted successfully'
  });
});

// Get portfolio with analytics
const getPortfolioWithAnalytics = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id).populate('assets');
  
  if (!portfolio) {
    return res.status(404).json({ success: false, message: 'Portfolio not found' });
  }
  
  if (portfolio.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  if (portfolio.assets && portfolio.assets.length > 0) {
    console.log(`🔄 Updating prices for portfolio analytics: ${portfolio.name}`);
    
    // Convert Mongoose documents to plain objects to preserve all properties
    const plainAssets = portfolio.assets.map(asset => asset.toObject ? asset.toObject() : asset);
    const updatedAssets = await marketDataService.updateAssetPrices(plainAssets);
    
    // Save updated asset prices to database and update in place
    for (let i = 0; i < updatedAssets.length; i++) {
      const updatedAsset = updatedAssets[i];
      const originalAsset = portfolio.assets[i];
      
      if (updatedAsset.currentPrice && updatedAsset.currentPrice > 0) {
        try {
          await Asset.findByIdAndUpdate(updatedAsset._id, {
            currentPrice: updatedAsset.currentPrice,
            lastUpdated: updatedAsset.lastUpdated
          });
          console.log(`💾 Saved updated price for ${updatedAsset.symbol}: $${updatedAsset.currentPrice}`);
          
          // Update the original asset in place with the new currentPrice
          if (originalAsset) {
            originalAsset.currentPrice = updatedAsset.currentPrice;
            originalAsset.lastUpdated = updatedAsset.lastUpdated;
            console.log(`🔄 Updated asset ${updatedAsset.symbol} in portfolio with new price: $${updatedAsset.currentPrice}`);
          }
        } catch (error) {
          console.error(`❌ Error saving price for ${updatedAsset.symbol}:`, error.message);
        }
      }
    }
    
    // DON'T replace the entire assets array - this corrupts the data!
    console.log(`✅ Portfolio analytics updated with real-time prices (assets preserved)`);
  }
  
  res.json({ success: true, data: portfolio });
});

module.exports = {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioWithAnalytics
};