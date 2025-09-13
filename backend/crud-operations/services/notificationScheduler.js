const cron = require('node-cron');
const Asset = require('../models/assetModel');
const Portfolio = require('../models/portfolioModel');
const notificationService = require('./notificationService');
const marketDataService = require('./marketDataService');

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Notification scheduler is already running');
      return;
    }

    console.log('🚀 Starting notification scheduler...');
    this.isRunning = true;

    // Check for price alerts every 5 minutes during market hours
    cron.schedule('*/5 * * * *', async () => {
      await this.checkPriceAlerts();
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    // Clean up old notifications daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    console.log('✅ Notification scheduler started successfully');
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Notification scheduler is not running');
      return;
    }

    console.log('🛑 Stopping notification scheduler...');
    cron.destroy();
    this.isRunning = false;
    console.log('✅ Notification scheduler stopped');
  }

  async checkPriceAlerts() {
    try {
      console.log('🔍 Checking for price alerts...');
      
      // Get all portfolios with their assets
      const portfolios = await Portfolio.find({})
        .populate('assets')
        .lean();

      let totalNotifications = 0;

      for (const portfolio of portfolios) {
        if (!portfolio.assets || portfolio.assets.length === 0) {
          continue;
        }

        // Get updated prices for all assets
        const updatedAssets = await marketDataService.updateAssetPrices(portfolio.assets);
        
        for (let i = 0; i < updatedAssets.length; i++) {
          const updatedAsset = updatedAssets[i];
          const originalAsset = portfolio.assets[i];
          
          if (!updatedAsset.currentPrice || !originalAsset.currentPrice) {
            continue;
          }

          // Calculate price change percentage
          const changePercent = ((updatedAsset.currentPrice - originalAsset.currentPrice) / originalAsset.currentPrice) * 100;
          
          // Only notify for significant changes (5% or more)
          if (Math.abs(changePercent) >= 5) {
            try {
              await notificationService.notifyAssetPriceChange(
                portfolio.userId,
                {
                  symbol: updatedAsset.symbol,
                  name: updatedAsset.name
                },
                originalAsset.currentPrice,
                updatedAsset.currentPrice,
                changePercent
              );
              
              totalNotifications++;
              
              // Update the asset price in database
              await Asset.findByIdAndUpdate(updatedAsset._id, {
                currentPrice: updatedAsset.currentPrice,
                lastUpdated: updatedAsset.lastUpdated
              });
              
            } catch (error) {
              console.error(`❌ Failed to send price alert for ${updatedAsset.symbol}:`, error.message);
            }
          }
        }
      }

      if (totalNotifications > 0) {
        console.log(`✅ Sent ${totalNotifications} price alert notifications`);
      }
      
    } catch (error) {
      console.error('❌ Error checking price alerts:', error);
    }
  }

  async cleanupOldNotifications() {
    try {
      console.log('🧹 Cleaning up old notifications...');
      const deletedCount = await notificationService.cleanupOldNotifications(30);
      console.log(`✅ Cleaned up ${deletedCount} old notifications`);
    } catch (error) {
      console.error('❌ Error cleaning up old notifications:', error);
    }
  }

  // Manual trigger for testing
  async triggerPriceCheck() {
    console.log('🔄 Manually triggering price check...');
    await this.checkPriceAlerts();
  }
}

module.exports = new NotificationScheduler();
