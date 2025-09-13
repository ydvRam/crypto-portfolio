const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const { errorHandler } = require("./auth/src/middleware/errorHandle");
const authRoutes = require("./auth/src/routes/authRoutes");
const portfolioRoutes = require('./crud-operations/routes/portfolioRoute');
const assetRoutes = require('./crud-operations/routes/assetRoutes');
const marketDataRoutes = require('./crud-operations/routes/marketDataRoutes');
const watchlistRoutes = require('./crud-operations/routes/watchlistRoutes');
const homePageRoutes = require('./crud-operations/routes/homePageRoutes');
const notificationRoutes = require('./crud-operations/routes/notificationRoutes');
const securityRoutes = require('./crud-operations/routes/securityRoutes');
const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://crypto-portfolio-frontend-52gk.onrender.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit requests
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    }
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/market', marketDataRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/home-page', homePageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security', securityRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true,
    status: "OK", 
    message: "Backend is running...",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect DB
connectDB();
module.exports = app;