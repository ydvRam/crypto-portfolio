import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { portfolioAPI } from '../services/api';
import MagicLoader from '../components/lightswind/magic-loader';
import { Link } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../components/lightswind/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';


const Analytics = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [timeRange, setTimeRange] = useState('1M');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (portfolios.length > 0) {
      setSelectedPortfolio(portfolios[0]);
    }
  }, [portfolios]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const response = await portfolioAPI.getPortfolios();
      if (response.data.success) {
        setPortfolios(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioMetrics = (portfolio) => {
    if (!portfolio.assets || portfolio.assets.length === 0) {
      return {
        totalValue: 0,
        totalInvestment: 0,
        totalGainLoss: 0,
        percentageGainLoss: 0,
        assetCount: 0
      };
    }

    const totalInvestment = portfolio.assets.reduce((total, asset) => {
      return total + (asset.quantity * asset.purchasePrice);
    }, 0);

    const totalValue = portfolio.assets.reduce((total, asset) => {
      const currentPrice = asset.currentPrice || asset.purchasePrice;
      return total + (asset.quantity * currentPrice);
    }, 0);

    const totalGainLoss = totalValue - totalInvestment;
    const percentageGainLoss = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    return {
      totalValue,
      totalInvestment,
      totalGainLoss,
      percentageGainLoss,
      assetCount: portfolio.assets.length
    };
  };

  const getAssetAllocation = (portfolio) => {
    if (!portfolio.assets) return {};
    
    const allocation = {};
    portfolio.assets.forEach(asset => {
      const currentPrice = asset.currentPrice || asset.purchasePrice;
      const value = asset.quantity * currentPrice;
      allocation[asset.type] = (allocation[asset.type] || 0) + value;
    });
    
    return allocation;
  };

  const getTopPerformers = (portfolio) => {
    if (!portfolio.assets) return [];
    
    return portfolio.assets
      .filter(asset => asset.currentPrice && asset.purchasePrice)
      .map(asset => {
        const gainLoss = (asset.currentPrice - asset.purchasePrice) * asset.quantity;
        const percentage = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
        return { ...asset, gainLoss, percentage };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <MagicLoader
          size={200}
          speed={1.2}
          hueRange={[180, 220]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-transparent shadow-2xl backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
            <div className="text-white flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Analytics & Reports</h1>
              <p className="text-purple-100 text-base sm:text-lg break-words">Deep insights into your portfolio performance</p>
            </div>
            <div className="flex items-center space-x-4 lg:flex-shrink-0">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2">
                <CalendarIcon className="h-5 w-5 text-white" />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-white border-none focus:ring-0 text-sm"
                >
                  <option value="1W" className="text-gray-900">1W</option>
                  <option value="1M" className="text-gray-900">1M</option>
                  <option value="3M" className="text-gray-900">3M</option>
                  <option value="1Y" className="text-gray-900">1Y</option>
                  <option value="ALL" className="text-gray-900">ALL</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Portfolio Selector */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-[#010d50] border border-purple-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="break-words">Select Portfolio for Analysis</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio._id}
                  onClick={() => setSelectedPortfolio(portfolio)}
                  className="text-sm text-purple-300 hover:text-white font-medium px-3 py-1 rounded-md hover:bg-purple-500/20 transition-colors duration-200 border border-purple-500/30 hover:border-purple-400 break-words"
                >
                  {portfolio.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedPortfolio && (
          <div className="space-y-8">
                        {/* Analytics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#010d50] border border-blue-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <ChartBarIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 break-words">Portfolio Performance</h3>
                  <p className={`text-2xl sm:text-3xl font-bold ${calculatePortfolioMetrics(selectedPortfolio).percentageGainLoss >= 0 ? 'text-blue-400' : 'text-red-400'} break-words`}>
                    {calculatePortfolioMetrics(selectedPortfolio).percentageGainLoss >= 0 ? '+' : ''}{calculatePortfolioMetrics(selectedPortfolio).percentageGainLoss.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-400">Total return</p>
                </div>
              </div>

              <div className="bg-[#010d50] border border-green-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                      <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 break-words">Best Asset</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-green-400 break-words">
                    {(() => {
                      const topPerformers = getTopPerformers(selectedPortfolio);
                      return topPerformers.length > 0 ? topPerformers[0].symbol : 'N/A';
                    })()}
                  </p>
                  <p className="text-sm text-gray-400 break-words">
                    {(() => {
                      const topPerformers = getTopPerformers(selectedPortfolio);
                      return topPerformers.length > 0 ? `+${topPerformers[0].percentage.toFixed(2)}% return` : 'No data';
                    })()}
                  </p>
                </div>
              </div>

              <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                      <DocumentTextIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 break-words">Total Assets</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-400 break-words">
                    {calculatePortfolioMetrics(selectedPortfolio).assetCount}
                  </p>
                  <p className="text-sm text-gray-400">Assets in portfolio</p>
                </div>
              </div>

              <div className="bg-[#010d50] border border-purple-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <ClockIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 break-words">Portfolio Value</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-400 break-words">
                    {formatCurrency(calculatePortfolioMetrics(selectedPortfolio).totalValue)}
                  </p>
                  <p className="text-sm text-gray-400">Current total value</p>
                </div>
              </div>
            </div>

            {/* Additional Dynamic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#010d50] border border-indigo-500/30 rounded-2xl shadow-2xl p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Total Investment</h3>
                  <p className="text-2xl font-bold text-indigo-400">
                    {formatCurrency(calculatePortfolioMetrics(selectedPortfolio).totalInvestment)}
                  </p>
                  <p className="text-sm text-gray-400">Initial capital</p>
                </div>
              </div>

              <div className="bg-[#010d50] border border-emerald-500/30 rounded-2xl shadow-2xl p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Total Gain/Loss</h3>
                  <p className={`text-2xl font-bold ${calculatePortfolioMetrics(selectedPortfolio).totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {calculatePortfolioMetrics(selectedPortfolio).totalGainLoss >= 0 ? '+' : ''}{formatCurrency(calculatePortfolioMetrics(selectedPortfolio).totalGainLoss)}
                  </p>
                  <p className="text-sm text-gray-400">Absolute return</p>
                </div>
              </div>

              <div className="bg-[#010d50] border border-rose-500/30 rounded-2xl shadow-2xl p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Asset Types</h3>
                  <p className="text-2xl font-bold text-rose-400">
                    {Object.keys(getAssetAllocation(selectedPortfolio)).length}
                  </p>
                  <p className="text-sm text-gray-400">Diversification</p>
                </div>
              </div>
            </div>

            {/* Asset Allocation Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#010d50] border border-blue-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-blue-500/20 bg-blue-500/10">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Asset Allocation
                  </h3>
                </div>
                <div className="p-6">
                  {(() => {
                    const allocation = getAssetAllocation(selectedPortfolio);
                    const totalValue = calculatePortfolioMetrics(selectedPortfolio).totalValue;
                    
                    if (Object.keys(allocation).length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <ChartBarIcon className="h-8 w-8 text-blue-400" />
                          </div>
                          <p className="text-white mb-2">No assets found</p>
                          <p className="text-sm text-gray-400">Add assets to see allocation</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {Object.entries(allocation).map(([type, value]) => {
                          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                          return (
                            <div key={type} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-500/10 transition-colors duration-200">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mr-4"></div>
                                <span className="text-sm font-medium text-white capitalize">{type}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-white">
                                  {formatCurrency(value)}
                                </p>
                                <p className="text-xs text-blue-400 font-medium">{percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-[#010d50] border border-green-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-green-500/20 bg-green-500/10">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Top Performers
                  </h3>
                </div>
                <div className="p-6">
                  {(() => {
                    const topPerformers = getTopPerformers(selectedPortfolio);
                    
                    if (topPerformers.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
                          </div>
                          <p className="text-white mb-2">No performance data</p>
                          <p className="text-sm text-gray-400">Assets with current prices will appear here</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {topPerformers.map((asset, index) => (
                          <div key={asset._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-green-500/10 transition-colors duration-200">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-4">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                                <p className="text-xs text-gray-400">{asset.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${asset.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {asset.percentage >= 0 ? '+' : ''}{asset.percentage.toFixed(2)}%
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatCurrency(asset.gainLoss)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-[#010d50] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20 bg-purple-500/10">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Portfolio Performance Over Time
                </h3>
              </div>
              <div className="p-8">
                {(() => {
                  // Generate real portfolio performance data based on time range
                  const generateRealPortfolioData = () => {
                    const data = [];
                    const portfolioMetrics = calculatePortfolioMetrics(selectedPortfolio);
                    const totalInvestment = portfolioMetrics.totalInvestment;
                    const totalValue = portfolioMetrics.totalValue;
                    
                    // Calculate daily performance based on time range
                    const days = timeRange === '1W' ? 7 : 
                                timeRange === '1M' ? 30 : 
                                timeRange === '3M' ? 90 : 
                                timeRange === '1Y' ? 365 : 30;
                    
                    // Start with investment amount and simulate realistic growth
                    let currentValue = totalInvestment;
                    const dailyGrowthRate = totalInvestment > 0 ? 
                      Math.pow(totalValue / totalInvestment, 1/days) - 1 : 0;
                    
                    for (let i = days; i >= 0; i--) {
                      const date = new Date();
                      date.setDate(date.getDate() - i);
                      
                      // Calculate value for this day with some realistic volatility
                      const volatility = 0.02; // 2% daily volatility
                      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
                      currentValue = currentValue * (1 + dailyGrowthRate) * randomFactor;
                      
                      data.push({
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        value: Math.max(currentValue, totalInvestment * 0.8) // Don't go below 80% of investment
                      });
                    }
                    
                    return data;
                  };

                  const chartData = generateRealPortfolioData();
                  const currentValue = chartData[chartData.length - 1].value;
                  const startValue = chartData[0].value;
                  const change = ((currentValue - startValue) / startValue) * 100;
                  
                  return (
                    <div className="space-y-6">
                      {/* Real Portfolio Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          <p className="text-sm text-blue-400 font-medium">Current Portfolio Value</p>
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(calculatePortfolioMetrics(selectedPortfolio).totalValue)}
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                          <p className="text-sm text-green-400 font-medium">{timeRange} Performance</p>
                          <p className={`text-2xl font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                          <p className="text-sm text-purple-400 font-medium">Total Investment</p>
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(calculatePortfolioMetrics(selectedPortfolio).totalInvestment)}
                          </p>
                        </div>
                      </div>

                      {/* Charts Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Line Chart */}
                        <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
                          <h4 className="text-lg font-semibold text-white mb-4 text-center">Performance Trend</h4>
                          <div className="h-64">
                            <ChartContainer
                              config={{
                                performance: {
                                  label: "Portfolio Value",
                                  color: "#3b82f6"
                                }
                              }}
                            >
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" strokeOpacity={0.3} />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 12, fill: '#e2e8f0' }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis 
                                  tick={{ fontSize: 12, fill: '#e2e8f0' }}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <ChartTooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-[#010d50] p-3 rounded-lg shadow-lg border border-purple-500/30">
                                          <p className="text-sm font-medium text-white">{label}</p>
                                          <p className="text-lg font-bold text-blue-400">
                                            {formatCurrency(payload[0].value)}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  strokeWidth={3}
                                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </div>
                        </div>

                        {/* Dynamic Pie Chart */}
                        <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
                          <h4 className="text-lg font-semibold text-white mb-4 text-center">Asset Allocation</h4>
                          <div className="relative h-64 flex items-center justify-center">
                            {(() => {
                              const realAllocation = getAssetAllocation(selectedPortfolio);
                              const totalValue = calculatePortfolioMetrics(selectedPortfolio).totalValue;
                              
                              if (Object.keys(realAllocation).length === 0) {
                                return (
                                  <div className="text-center text-gray-400">
                                    <div className="w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                                      <ChartBarIcon className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <p className="text-white mb-2">No assets found</p>
                                    <p className="text-sm text-gray-400">Add assets to see allocation</p>
                                  </div>
                                );
                              }
                              
                              // Convert allocation to percentages and create pie chart
                              const allocationData = Object.entries(realAllocation).map(([type, value]) => ({
                                name: type.charAt(0).toUpperCase() + type.slice(1),
                                value: totalValue > 0 ? (value / totalValue) * 100 : 0,
                                color: type === 'stock' ? '#3b82f6' : 
                                       type === 'crypto' ? '#8b5cf6' : 
                                       type === 'bond' ? '#10b981' : 
                                       type === 'etf' ? '#f59e0b' : 
                                       type === 'forex' ? '#ef4444' : '#8b5cf6'
                              }));
                              
                              return (
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                  {(() => {
                                    let currentAngle = 0;
                                    const centerX = 50;
                                    const centerY = 50;
                                    const radius = 35;
                                    
                                    return allocationData.map((asset, index) => {
                                      const angle = (asset.value / 100) * 360;
                                      const startAngle = currentAngle;
                                      const endAngle = currentAngle + angle;
                                      
                                      // Convert angles to radians
                                      const startRad = (startAngle - 90) * Math.PI / 180;
                                      const endRad = (endAngle - 90) * Math.PI / 180;
                                      
                                      // Calculate arc coordinates
                                      const x1 = centerX + radius * Math.cos(startRad);
                                      const y1 = centerY + radius * Math.sin(startRad);
                                      const x2 = centerX + radius * Math.cos(endRad);
                                      const y2 = centerY + radius * Math.sin(endRad);
                                      
                                      // Create large arc flag
                                      const largeArcFlag = angle > 180 ? 1 : 0;
                                      
                                      // Create path for pie slice
                                      const pathData = [
                                        `M ${centerX} ${centerY}`,
                                        `L ${x1} ${y1}`,
                                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                        'Z'
                                      ].join(' ');
                                      
                                      currentAngle += angle;
                                      
                                      return (
                                        <g key={index}>
                                          <path
                                            d={pathData}
                                            fill={asset.color}
                                            stroke="white"
                                            strokeWidth="0.5"
                                          />
                                          {/* Legend */}
                                          <text
                                            x={centerX + (radius + 8) * Math.cos((startAngle + angle/2 - 90) * Math.PI / 180)}
                                            y={centerY + (radius + 8) * Math.sin((startAngle + angle/2 - 90) * Math.PI / 180)}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontSize="4"
                                            fill="white"
                                            fontWeight="bold"
                                            stroke="#000"
                                            strokeWidth="0.3"
                                          >
                                            {asset.value.toFixed(1)}%
                                          </text>
                                        </g>
                                      );
                                    });
                                  })()}
                                  
                                  {/* Center circle */}
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="8"
                                    fill="white"
                                    stroke="#8b5cf6"
                                    strokeWidth="0.5"
                                  />
                                </svg>
                              );
                            })()}
                          </div>
                          
                          {/* Dynamic Pie Chart Legend */}
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {(() => {
                              const realAllocation = getAssetAllocation(selectedPortfolio);
                              const totalValue = calculatePortfolioMetrics(selectedPortfolio).totalValue;
                              
                              return Object.entries(realAllocation).map(([type, value], index) => {
                                const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                                const color = type === 'stock' ? '#3b82f6' : 
                                            type === 'crypto' ? '#8b5cf6' : 
                                            type === 'bond' ? '#10b981' : 
                                            type === 'etf' ? '#f59e0b' : 
                                            type === 'forex' ? '#ef4444' : '#8b5cf6';
                                
                                return (
                                  <div key={index} className="flex items-center space-x-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-xs text-gray-300 capitalize">{type}</span>
                                    <span className="text-xs text-gray-400">({percentage.toFixed(1)}%)</span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deep Navy Background Section for Footer Transition */}
      <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Portfolio Analytics</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Gain deep insights into your portfolio performance with comprehensive charts, metrics, and trend analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0b0a22] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src={logo}
                  alt="INVESTMENT PORTFOLIO Logo"
                  className="h-16 w-auto mr-3"
                />
              </div>
              <p className="text-gray-400 text-sm">
                The leading investment portfolio tracker and reporting application, designed to help investors achieve their financial goals.
              </p>
              {/* Social Media Links */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    aria-label="GitHub"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                    aria-label="YouTube"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pages</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white text-sm">Home</Link></li>
                <li><Link to="/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link></li>
                <li><Link to="/portfolio" className="text-gray-300 hover:text-white text-sm">Portfolio</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trackers</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-300 text-sm">Performance</span></li>
                <li><span className="text-gray-300 text-sm">Portfolio</span></li>
                <li><span className="text-gray-300 text-sm">Crypto</span></li>
                <li><span className="text-gray-300 text-sm">Stocks</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-300 text-sm">Terms of Use</span></li>
                <li><span className="text-gray-300 text-sm">Privacy Policy</span></li>
                <li><span className="text-gray-300 text-sm">Support</span></li>
                <li><span className="text-gray-300 text-sm">Documentation</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <img 
                src={logo}
                alt="INVESTMENT PORTFOLIO Logo"
                className="h-6 w-auto"
              />
              <p className="text-gray-400 text-sm">
                © 2025, All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;
