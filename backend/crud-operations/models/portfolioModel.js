const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: 'My Portfolio' },
  description: { type: String },
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  isPublic: { type: Boolean, default: false },
  riskTolerance: { 
    type: String, 
    enum: ['conservative', 'moderate', 'aggressive'], 
    default: 'moderate' 
  },
  investmentGoal: { 
    type: String, 
    enum: ['growth', 'income', 'preservation', 'speculation'], 
    default: 'growth' 
  },
  targetReturn: { type: Number, min: 0 }, // Annual target return percentage
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Virtual for total portfolio value
portfolioSchema.virtual('totalValue').get(function() {
  // This will be calculated in the controller when populating assets
  return 0;
});

// Virtual for total gain/loss
portfolioSchema.virtual('totalGainLoss').get(function() {
  // This will be calculated in the controller when populating assets
  return 0;
});

// Virtual for portfolio performance
portfolioSchema.virtual('performance').get(function() {
  // This will be calculated in the controller when populating assets
  return 0;
});

// Ensure virtual fields are serialized
portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);