const express = require('express');
const router = express.Router();
const { protect } = require('../../auth/src/middleware/authMiddleware');
const { validateRequest } = require('../../auth/src/middleware/validationMiddleware');
const {
  createWatchlist,
  getWatchlists,
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  updateWatchlist,
  deleteWatchlist,
  getPublicWatchlists,
  refreshPrices
} = require('../controllers/watchlistController');
const {
  createWatchlistValidation,
  updateWatchlistValidation,
  addToWatchlistValidation,
  updateWatchlistItemValidation
} = require('../validations/watchlistValidations');

// Public routes (no authentication required) - must come before parameterized routes
router.get('/public/discover', getPublicWatchlists);

// All other routes require authentication
router.use(protect);

// Watchlist CRUD operations
router.post('/', validateRequest(createWatchlistValidation), createWatchlist);
router.get('/', getWatchlists);

// Watchlist item operations - these must come before the generic :id route
router.post('/:id/items', validateRequest(addToWatchlistValidation), addToWatchlist);
router.put('/:id/items/:itemId', validateRequest(updateWatchlistItemValidation), updateWatchlistItem);
router.delete('/:id/items/:itemId', removeFromWatchlist);

// Special operations - these must come before the generic :id route
router.post('/:id/refresh', refreshPrices);

// Generic watchlist operations - these must come last to avoid conflicts
router.get('/:id', getWatchlist);
router.put('/:id', validateRequest(updateWatchlistValidation), updateWatchlist);
router.delete('/:id', deleteWatchlist);

module.exports = router;
