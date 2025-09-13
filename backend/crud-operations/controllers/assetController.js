const Asset = require('../models/assetModel');
const Portfolio = require('../models/portfolioModel');
const { asyncHandler } = require('../../auth/src/middleware/errorHandle');

exports.addAsset = asyncHandler(async (req, res) => {
  const { portfolioId, type, symbol, quantity, purchasePrice, purchaseDate, notes, tags } = req.body;
  
  // Verify portfolio ownership
  const portfolio = await Portfolio.findOne({ _id: portfolioId, userId: req.user.id });
  if (!portfolio) {
    return res.status(404).json({ 
      success: false,
      message: 'Portfolio not found' 
    });
  }

  // Create asset
  const asset = new Asset({ 
    portfolioId, 
    type, 
    symbol: symbol, 
    quantity, 
    purchasePrice,
    purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
    notes,
    tags
  });
  
  await asset.save();
  
  // Update portfolio assets array
  portfolio.assets.push(asset._id);
  portfolio.lastUpdated = Date.now();
  await portfolio.save();
  
  res.status(201).json({
    success: true,
    data: asset
  });
});

exports.getAssets = asyncHandler(async (req, res) => {
  const { portfolioId } = req.params;
  const { type, sort, search } = req.query;
  
  // Verify portfolio ownership
  const portfolio = await Portfolio.findOne({ _id: portfolioId, userId: req.user.id });
  if (!portfolio) {
    return res.status(404).json({ 
      success: false,
      message: 'Portfolio not found' 
    });
  }
  
  // Build query
  let query = { portfolioId };
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { symbol: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Build sort
  let sortOption = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOption[field] = order === 'desc' ? -1 : 1;
  } else {
    sortOption = { createdAt: -1 }; // Default sort by creation date
  }
  
  const assets = await Asset.find(query).sort(sortOption);
  
  res.json({
    success: true,
    data: assets
  });
});

exports.updateAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find asset and verify ownership
  const asset = await Asset.findById(id);
  if (!asset) {
    return res.status(404).json({ 
      success: false,
      message: 'Asset not found' 
    });
  }
  
  // Verify portfolio ownership
  const portfolio = await Portfolio.findOne({ _id: asset.portfolioId, userId: req.user.id });
  if (!portfolio) {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied' 
    });
  }
  
  // Update asset
  const updateData = { ...req.body, lastUpdated: Date.now() };
  
  // Convert purchaseDate string to Date if provided
  if (req.body.purchaseDate && typeof req.body.purchaseDate === 'string') {
    updateData.purchaseDate = new Date(req.body.purchaseDate);
  }
  
  const updatedAsset = await Asset.findByIdAndUpdate(
    id, 
    updateData, 
    { new: true, runValidators: true }
  );
  
  // Update portfolio lastUpdated
  portfolio.lastUpdated = Date.now();
  await portfolio.save();
  
  res.json({
    success: true,
    data: updatedAsset
  });
});

exports.deleteAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find asset and verify ownership
  const asset = await Asset.findById(id);
  if (!asset) {
    return res.status(404).json({ 
      success: false,
      message: 'Asset not found' 
    });
  }
  
  // Verify portfolio ownership
  const portfolio = await Portfolio.findOne({ _id: asset.portfolioId, userId: req.user.id });
  if (!portfolio) {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied' 
    });
  }
  
  // Remove asset from portfolio and delete
  await Portfolio.updateOne(
    { _id: asset.portfolioId }, 
    { $pull: { assets: id }, lastUpdated: Date.now() }
  );
  await asset.deleteOne();
  
  res.json({
    success: true,
    message: 'Asset deleted successfully'
  });
});
