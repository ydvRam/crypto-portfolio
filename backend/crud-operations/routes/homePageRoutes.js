const express = require('express');
const router = express.Router();
const {
  getHomePageData,
  getPlatformStats,
  updatePlatformStats,
  getFeatures,
  addFeature,
  updateFeature,
  deleteFeature,
  getTestimonials,
  addTestimonial,
  getNews,
  addNews
} = require('../controllers/homePageController');

// Get all home page data
router.get('/', getHomePageData);

// Platform Statistics routes
router.get('/stats', getPlatformStats);
router.put('/stats', updatePlatformStats);

// Features routes
router.get('/features', getFeatures);
router.post('/features', addFeature);
router.put('/features/:featureId', updateFeature);
router.delete('/features/:featureId', deleteFeature);

// Testimonials routes
router.get('/testimonials', getTestimonials);
router.post('/testimonials', addTestimonial);

// News routes
router.get('/news', getNews);
router.post('/news', addNews);

module.exports = router;
