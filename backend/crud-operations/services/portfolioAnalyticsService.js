class PortfolioAnalyticsService {
  constructor() {}

  // Calculate total portfolio value
  calculateTotalValue(assets) {
    return assets.reduce((total, asset) => {
      return total + (asset.currentPrice * asset.quantity);
    }, 0);
  }

  // Calculate total investment amount
  calculateTotalInvestment(assets) {
    return assets.reduce((total, asset) => {
      return total + (asset.purchasePrice * asset.quantity);
    }, 0);
  }

  // Calculate total gain/loss
  calculateTotalGainLoss(assets) {
    return assets.reduce((total, asset) => {
      const currentValue = asset.currentPrice * asset.quantity;
      const purchaseValue = asset.purchasePrice * asset.quantity;
      return total + (currentValue - purchaseValue);
    }, 0);
  }

  // Calculate total percentage gain/loss
  calculateTotalPercentageGainLoss(assets) {
    const totalInvestment = this.calculateTotalInvestment(assets);
    const totalGainLoss = this.calculateTotalGainLoss(assets);
    
    if (totalInvestment === 0) return 0;
    return (totalGainLoss / totalInvestment) * 100;
  }

  // Calculate asset allocation by type
  calculateAssetAllocation(assets) {
    const allocation = {};
    const totalValue = this.calculateTotalValue(assets);
    
    assets.forEach(asset => {
      const assetValue = asset.currentPrice * asset.quantity;
      const percentage = totalValue > 0 ? (assetValue / totalValue) * 100 : 0;
      
      if (!allocation[asset.type]) {
        allocation[asset.type] = {
          count: 0,
          totalValue: 0,
          percentage: 0
        };
      }
      
      allocation[asset.type].count++;
      allocation[asset.type].totalValue += assetValue;
      allocation[asset.type].percentage += percentage;
    });
    
    return allocation;
  }

  // Calculate individual asset performance
  calculateAssetPerformance(asset) {
    const currentValue = asset.currentPrice * asset.quantity;
    const purchaseValue = asset.purchasePrice * asset.quantity;
    const gainLoss = currentValue - purchaseValue;
    const percentageGainLoss = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
    
    return {
      symbol: asset.symbol,
      type: asset.type,
      currentValue,
      purchaseValue,
      gainLoss,
      percentageGainLoss,
      quantity: asset.quantity,
      currentPrice: asset.currentPrice,
      purchasePrice: asset.purchasePrice
    };
  }

  // Calculate portfolio performance metrics
  calculatePortfolioMetrics(assets, portfolio) {
    const totalValue = this.calculateTotalValue(assets);
    const totalInvestment = this.calculateTotalInvestment(assets);
    const totalGainLoss = this.calculateTotalGainLoss(assets);
    const totalPercentageGainLoss = this.calculateTotalPercentageGainLoss(assets);
    
    // Calculate time-weighted return (simplified)
    const timeWeightedReturn = this.calculateTimeWeightedReturn(assets);
    
    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(assets);
    
    // Calculate sector allocation (for stocks)
    const sectorAllocation = this.calculateSectorAllocation(assets);
    
    return {
      portfolio: {
        id: portfolio._id,
        name: portfolio.name,
        description: portfolio.description,
        riskTolerance: portfolio.riskTolerance,
        investmentGoal: portfolio.investmentGoal,
        targetReturn: portfolio.targetReturn
      },
      summary: {
        totalValue,
        totalInvestment,
        totalGainLoss,
        totalPercentageGainLoss,
        timeWeightedReturn,
        assetCount: assets.length
      },
      allocation: {
        byType: this.calculateAssetAllocation(assets),
        bySector: sectorAllocation
      },
      risk: riskMetrics,
      assets: assets.map(asset => this.calculateAssetPerformance(asset)),
      lastUpdated: new Date()
    };
  }

  // Calculate time-weighted return (simplified version)
  calculateTimeWeightedReturn(assets) {
    if (assets.length === 0) return 0;
    
    // This is a simplified calculation
    // In a real application, you'd need historical data for accurate TWR
    const totalPercentageGainLoss = this.calculateTotalPercentageGainLoss(assets);
    const averageHoldingPeriod = this.calculateAverageHoldingPeriod(assets);
    
    if (averageHoldingPeriod === 0) return totalPercentageGainLoss;
    
    // Annualized return (simplified)
    return (totalPercentageGainLoss / averageHoldingPeriod) * 365;
  }

  // Calculate average holding period in days
  calculateAverageHoldingPeriod(assets) {
    if (assets.length === 0) return 0;
    
    const totalDays = assets.reduce((sum, asset) => {
      const purchaseDate = new Date(asset.purchaseDate);
      const currentDate = new Date();
      const daysDiff = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24);
      return sum + Math.max(0, daysDiff);
    }, 0);
    
    return totalDays / assets.length;
  }

  // Calculate risk metrics
  calculateRiskMetrics(assets) {
    if (assets.length === 0) {
      return {
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        beta: 0
      };
    }
    
    // Calculate volatility (standard deviation of returns)
    const returns = assets.map(asset => {
      const currentValue = asset.currentPrice * asset.quantity;
      const purchaseValue = asset.purchasePrice * asset.quantity;
      return purchaseValue > 0 ? (currentValue - purchaseValue) / purchaseValue : 0;
    });
    
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    // Simplified Sharpe ratio (assuming risk-free rate of 0)
    const sharpeRatio = meanReturn > 0 ? meanReturn / volatility : 0;
    
    // Simplified max drawdown
    const maxDrawdown = Math.min(...returns);
    
    // Simplified beta (assuming market return of 0)
    const beta = 1; // Placeholder - would need market data for accurate calculation
    
    return {
      volatility: volatility * 100, // Convert to percentage
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100, // Convert to percentage
      beta
    };
  }

  // Calculate sector allocation (for stocks)
  calculateSectorAllocation(assets) {
    const sectorAllocation = {};
    const totalValue = this.calculateTotalValue(assets);
    
    // This is a placeholder - in a real app, you'd need sector data from an API
    // For now, we'll categorize by asset type
    assets.forEach(asset => {
      if (asset.type === 'stock') {
        const sector = this.categorizeStockSector(asset.symbol);
        const assetValue = asset.currentPrice * asset.quantity;
        
        if (!sectorAllocation[sector]) {
          sectorAllocation[sector] = {
            totalValue: 0,
            percentage: 0,
            count: 0
          };
        }
        
        sectorAllocation[sector].totalValue += assetValue;
        sectorAllocation[sector].count++;
      }
    });
    
    // Calculate percentages
    Object.keys(sectorAllocation).forEach(sector => {
      sectorAllocation[sector].percentage = totalValue > 0 
        ? (sectorAllocation[sector].totalValue / totalValue) * 100 
        : 0;
    });
    
    return sectorAllocation;
  }

  // Categorize stock sector (simplified - in real app, use API data)
  categorizeStockSector(symbol) {
    // This is a very basic categorization
    // In a real application, you'd use a financial API to get actual sector data
    const techStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'];
    const financeStocks = ['JPM', 'BAC', 'WFC', 'GS', 'MS'];
    const healthcareStocks = ['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO'];
    
    if (techStocks.includes(symbol)) return 'Technology';
    if (financeStocks.includes(symbol)) return 'Financial Services';
    if (healthcareStocks.includes(symbol)) return 'Healthcare';
    
    return 'Other';
  }

  // Generate performance report
  generatePerformanceReport(assets, portfolio, period = 'all') {
    const metrics = this.calculatePortfolioMetrics(assets, portfolio);
    
    const report = {
      period,
      generatedAt: new Date(),
      portfolio: metrics.portfolio,
      summary: metrics.summary,
      topPerformers: this.getTopPerformers(assets, 5),
      worstPerformers: this.getWorstPerformers(assets, 5),
      recommendations: this.generateRecommendations(metrics),
      allocation: metrics.allocation,
      risk: metrics.risk
    };
    
    return report;
  }

  // Get top performing assets
  getTopPerformers(assets, limit = 5) {
    return assets
      .map(asset => this.calculateAssetPerformance(asset))
      .sort((a, b) => b.percentageGainLoss - a.percentageGainLoss)
      .slice(0, limit);
  }

  // Get worst performing assets
  getWorstPerformers(assets, limit = 5) {
    return assets
      .map(asset => this.calculateAssetPerformance(asset))
      .sort((a, b) => a.percentageGainLoss - b.percentageGainLoss)
      .slice(0, limit);
  }

  // Generate investment recommendations
  generateRecommendations(metrics) {
    const recommendations = [];
    
    // Check asset allocation
    if (metrics.allocation.byType.stock && metrics.allocation.byType.stock.percentage > 70) {
      recommendations.push({
        type: 'warning',
        message: 'Portfolio is heavily concentrated in stocks. Consider diversifying with bonds or crypto.',
        priority: 'medium'
      });
    }
    
    // Check risk tolerance vs actual risk
    if (metrics.portfolio.riskTolerance === 'conservative' && metrics.risk.volatility > 15) {
      recommendations.push({
        type: 'warning',
        message: 'Portfolio volatility is higher than expected for conservative risk tolerance.',
        priority: 'high'
      });
    }
    
    // Check performance vs target
    if (metrics.portfolio.targetReturn && metrics.summary.totalPercentageGainLoss < metrics.portfolio.targetReturn) {
      recommendations.push({
        type: 'info',
        message: 'Portfolio is below target return. Review asset allocation and consider rebalancing.',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
}

module.exports = new PortfolioAnalyticsService();
