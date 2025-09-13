const { z } = require('zod');

// Create watchlist validation
const createWatchlistValidation = z.object({
  name: z.string()
    .min(1, 'Watchlist name is required')
    .max(100, 'Watchlist name too long'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  isPublic: z.boolean().optional()
});

// Update watchlist validation
const updateWatchlistValidation = z.object({
  name: z.string()
    .min(1, 'Watchlist name is required')
    .max(100, 'Watchlist name too long')
    .optional(),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  isPublic: z.boolean().optional()
});

// Add item to watchlist validation
const addToWatchlistValidation = z.object({
  symbol: z.string()
    .min(1, 'Symbol is required')
    .max(20, 'Symbol too long'),
  type: z.enum(['stock', 'crypto', 'bond']),
  name: z.string()
    .max(100, 'Name too long')
    .optional(),
  targetPrice: z.number()
    .positive('Target price must be positive')
    .optional(),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional()
});

// Update watchlist item validation
const updateWatchlistItemValidation = z.object({
  name: z.string()
    .max(100, 'Name too long')
    .optional(),
  targetPrice: z.number()
    .positive('Target price must be positive')
    .optional(),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional()
});

module.exports = {
  createWatchlistValidation,
  updateWatchlistValidation,
  addToWatchlistValidation,
  updateWatchlistItemValidation
};
