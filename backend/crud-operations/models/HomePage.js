const mongoose = require('mongoose');

// Feature Schema
const featureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Testimonial Schema
const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  avatar: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// News Schema
const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  readTime: {
    type: String,
    default: '3 min read',
    trim: true
  }
}, { timestamps: true });

// HomePage Schema
const homePageSchema = new mongoose.Schema({
  platformStats: {
    totalUsers: {
      type: Number,
      default: 15432
    },
    totalPortfolios: {
      type: Number,
      default: 45000
    },
    totalAssets: {
      type: Number,
      default: 2500000000
    },
    uptime: {
      type: Number,
      default: 99.99
    },
    countries: {
      type: Number,
      default: 150
    },
    exchanges: {
      type: Number,
      default: 50
    }
  },
  features: [featureSchema],
  testimonials: [testimonialSchema],
  news: [newsSchema]
}, { timestamps: true });

// Create default home page data if none exists
homePageSchema.statics.initializeDefaultData = async function() {
  try {
    const existingData = await this.findOne();
    
    if (!existingData) {
      const defaultData = new this({
        platformStats: {
          totalUsers: 15432,
          totalPortfolios: 45000,
          totalAssets: 2500000000,
          uptime: 99.99,
          countries: 150,
          exchanges: 50
        },
        features: [
          {
            title: 'Stocks',
            description: 'Track stocks, ETFs, and equity investments with real-time data and performance analytics.',
            icon: 'ChartBarIcon',
            isActive: true,
            priority: 1
          },
          {
            title: 'Crypto',
            description: 'Monitor cryptocurrency holdings with live price updates and portfolio tracking.',
            icon: 'CurrencyDollarIcon',
            isActive: true,
            priority: 2
          },
          {
            title: 'Global Markets',
            description: 'Access international markets and multi-currency portfolio management.',
            icon: 'GlobeAltIcon',
            isActive: true,
            priority: 3
          },
          {
            title: 'Performance Analytics',
            description: 'Advanced portfolio analytics with ROI, CAGR, and risk metrics calculations.',
            icon: 'ArrowTrendingUpIcon',
            isActive: true,
            priority: 4
          },
          {
            title: 'Secure & Private',
            description: 'Your data is protected with enterprise-grade security and privacy standards.',
            icon: 'ShieldCheckIcon',
            isActive: true,
            priority: 5
          },
          {
            title: 'Automated Updates',
            description: 'Automatic portfolio updates with real-time market data and corporate actions.',
            icon: 'CogIcon',
            isActive: true,
            priority: 6
          }
        ],
        testimonials: [
          {
            name: 'Sarah Johnson',
            role: 'Portfolio Manager',
            company: 'Tech Investments Inc.',
            content: 'PortfolioTracker has revolutionized how we manage our client portfolios. The real-time analytics and automated tracking save us hours every week.',
            rating: 5,
            avatar: 'SJ'
          },
          {
            name: 'Michael Chen',
            role: 'Individual Investor',
            company: 'Retail Investor',
            content: 'As someone managing my own retirement portfolio, this platform gives me the professional tools I need to make informed decisions.',
            rating: 5,
            avatar: 'MC'
          },
          {
            name: 'Emily Rodriguez',
            role: 'Financial Advisor',
            company: 'Wealth Management Group',
            content: 'The global market coverage and multi-currency support make this platform perfect for our international clients.',
            rating: 5,
            avatar: 'ER'
          }
        ],
        news: [
          {
            title: 'New AI-Powered Portfolio Insights',
            excerpt: 'Introducing advanced AI algorithms that provide personalized investment recommendations based on your risk profile.',
            date: '2025-01-15',
            category: 'Feature Update',
            readTime: '3 min read'
          },
          {
            title: 'Enhanced Security with 2FA',
            excerpt: 'We\'ve upgraded our security protocols with two-factor authentication and enhanced encryption standards.',
            date: '2025-01-10',
            category: 'Security',
            readTime: '2 min read'
          },
          {
            title: 'Mobile App Now Available',
            excerpt: 'Access your portfolio on the go with our new mobile application for iOS and Android devices.',
            date: '2025-01-05',
            category: 'Platform Update',
            readTime: '4 min read'
          }
        ]
      });

      await defaultData.save();
      console.log('Default home page data initialized successfully');
      return defaultData;
    }
    
    return existingData;
  } catch (error) {
    console.error('Error initializing default home page data:', error);
    throw error;
  }
};

module.exports = mongoose.model('HomePage', homePageSchema);
