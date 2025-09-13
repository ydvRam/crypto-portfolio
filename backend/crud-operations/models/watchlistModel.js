const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  type: { type: String, enum: ['stock', 'crypto', 'bond'], required: true },
  name: { type: String },
  currentPrice: { type: Number, default: 0 },
  targetPrice: { type: Number },
  notes: { type: String },
  addedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: 'My Watchlist' },
  description: { type: String },
  items: [watchlistItemSchema],
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
watchlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for item count
watchlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Virtual for total value (if prices are available)
watchlistSchema.virtual('totalValue').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.currentPrice || 0);
  }, 0);
});

// Ensure virtual fields are serialized
watchlistSchema.set('toJSON', { virtuals: true });
watchlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
