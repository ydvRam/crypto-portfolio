const HomePage = require('../models/HomePage');

// Get all home page data (static)
const getHomePageData = async (req, res) => {
  try {
    const homePageData = await HomePage.findOne().populate('features testimonials news');
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Home page data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: homePageData
    });
  } catch (error) {
    console.error('Error fetching home page data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home page data'
    });
  }
};

// Get platform statistics (static)
const getPlatformStats = async (req, res) => {
  try {
    const homePageData = await HomePage.findOne();
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Home page data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: homePageData.platformStats
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics'
    });
  }
};

// Update platform statistics (admin only)
const updatePlatformStats = async (req, res) => {
  try {
    const { totalUsers, totalPortfolios, totalAssets, uptime, countries, exchanges } = req.body;
    
    const homePageData = await HomePage.findOne();
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Home page data not found'
      });
    }

    homePageData.platformStats = {
      totalUsers: totalUsers || homePageData.platformStats.totalUsers,
      totalPortfolios: totalPortfolios || homePageData.platformStats.totalPortfolios,
      totalAssets: totalAssets || homePageData.platformStats.totalAssets,
      uptime: uptime || homePageData.platformStats.uptime,
      countries: countries || homePageData.platformStats.countries,
      exchanges: exchanges || homePageData.platformStats.exchanges
    };

    await homePageData.save();

    res.status(200).json({
      success: true,
      message: 'Platform statistics updated successfully',
      data: homePageData.platformStats
    });
  } catch (error) {
    console.error('Error updating platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update platform statistics'
    });
  }
};

// Get features
const getFeatures = async (req, res) => {
  try {
    const homePageData = await HomePage.findOne().populate('features');
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Features not found'
      });
    }

    res.status(200).json({
      success: true,
      data: homePageData.features
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch features'
    });
  }
};

// Add new feature
const addFeature = async (req, res) => {
  try {
    const { title, description, icon, isActive, priority } = req.body;
    
    const homePageData = await HomePage.findOne();
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Home page data not found'
      });
    }

    const newFeature = {
      title,
      description,
      icon,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || homePageData.features.length + 1
    };

    homePageData.features.push(newFeature);
    await homePageData.save();

    res.status(201).json({
      success: true,
      message: 'Feature added successfully',
      data: newFeature
    });
  } catch (error) {
    console.error('Error adding feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feature'
    });
  }
};

// Update feature
const updateFeature = async (req, res) => {
  try {
    const { featureId } = req.params;
    const updates = req.body;
    
    const homePageData = await HomePage.findOne();
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Home page data not found'
      });
    }

    const feature = homePageData.features.id(featureId);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    Object.assign(feature, updates);
    await homePageData.save();

    res.status(200).json({
      success: true,
      message: 'Feature updated successfully',
      data: feature
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature'
    });
  }
};

// Delete feature
const deleteFeature = async (req, res) => {
  try {
    const { featureId } = req.params;
    
    const homePageData = await HomePage.findOne();
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    const feature = homePageData.features.id(featureId);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    feature.remove();
    await homePageData.save();

    res.status(200).json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feature'
    });
  }
};

// Get testimonials
const getTestimonials = async (req, res) => {
  try {
    const homePageData = await HomePage.findOne().populate('testimonials');
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Testimonials not found'
      });
    }

    res.status(200).json({
      success: true,
      data: homePageData.testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials'
    });
  }
};

// Add testimonial
const addTestimonial = async (req, res) => {
  try {
    const { name, role, company, content, rating, avatar } = req.body;
    
    const homePageData = await HomePage.findOne();
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Home page data not found'
      });
    }

    const newTestimonial = {
      name,
      role,
      company,
      content,
      rating: rating || 5,
      avatar: avatar || name.substring(0, 2).toUpperCase()
    };

    homePageData.testimonials.push(newTestimonial);
    await homePageData.save();

    res.status(201).json({
      success: true,
      message: 'Testimonial added successfully',
      data: newTestimonial
    });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add testimonial'
    });
  }
};

// Get news
const getNews = async (req, res) => {
  try {
    const homePageData = await HomePage.findOne().populate('news');
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    res.status(200).json({
      success: true,
      data: homePageData.news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
};

// Add news item
const addNews = async (req, res) => {
  try {
    const { title, excerpt, category, readTime } = req.body;
    
    const homePageData = await HomePage.findOne();
    
    if (!homePageData) {
      return res.status(404).json({
        success: false,
        message: 'Home page data not found'
      });
    }

    const newNews = {
      title,
      excerpt,
      date: new Date().toISOString().split('T')[0],
      category,
      readTime: readTime || '3 min read'
    };

    homePageData.news.push(newNews);
    await homePageData.save();

    res.status(200).json({
      success: true,
      message: 'News item added successfully',
      data: newNews
    });
  } catch (error) {
    console.error('Error adding news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add news item'
    });
  }
};

module.exports = {
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
};
