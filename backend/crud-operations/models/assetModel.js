const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
  type: { 
    type: String, 
    enum: ['stock', 'crypto', 'bond', 'etf', 'mutual-fund', 'real-estate', 'commodity', 'other'], 
    required: true 
  },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, default: Date.now },
  currentPrice: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  notes: { type: String },
  tags: [String]
}, { timestamps: true });

// Virtual for current value
assetSchema.virtual('currentValue').get(function() {
  return this.quantity * this.currentPrice;
});

// Virtual for total gain/loss
assetSchema.virtual('totalGainLoss').get(function() {
  return (this.currentPrice - this.purchasePrice) * this.quantity;
});

// Virtual for percentage gain/loss
assetSchema.virtual('percentageGainLoss').get(function() {
  if (this.purchasePrice === 0) return 0;
  return ((this.currentPrice - this.purchasePrice) / this.purchasePrice) * 100;
});

// Ensure virtual fields are serialized
assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Asset', assetSchema);
