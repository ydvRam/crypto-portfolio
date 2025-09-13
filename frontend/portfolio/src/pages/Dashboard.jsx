import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { portfolioAPI, assetAPI, marketDataAPI } from '../services/api';
import MagicLoader from '../components/lightswind/magic-loader';
import { AuroraTextEffect } from '../components/lightswind/aurora-text-effect';
import { BorderBeam } from '../components/lightswind/border-beam';


const Dashboard = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [assets, setAssets] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Utility functions
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateGainLoss = (asset) => {
    if (!asset.currentPrice || !asset.purchasePrice) return 0;
    return (asset.currentPrice - asset.purchasePrice) * asset.quantity;
  };

  const calculateGainLossPercentage = (asset) => {
    if (!asset.currentPrice || !asset.purchasePrice) return 0;
    return ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Check authentication
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user = null;

      try {
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          user = JSON.parse(userStr);
        }
      } catch (err) {
        console.warn('Could not parse user data from localStorage:', err);
        user = null;
      }

      // Clean up invalid data
      if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      if (!user) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch portfolios (which already include assets)
      const portfoliosResponse = await portfolioAPI.getPortfolios();

      let allPortfolios = [];
      let allAssets = [];

      if (portfoliosResponse.data.success) {
        allPortfolios = portfoliosResponse.data.data;

        // Debug: Log the portfolios data
        console.log('📊 Portfolios received from backend:', allPortfolios);

        // Extract assets from portfolios (they're already embedded)
        allPortfolios.forEach(portfolio => {
          if (portfolio.assets && portfolio.assets.length > 0) {
            const portfolioAssets = portfolio.assets.map(asset => ({
              ...asset,
              portfolioName: portfolio.name,
              portfolioId: portfolio._id
            }));
            allAssets = [...allAssets, ...portfolioAssets];
          }
        });

        // Debug: Log the extracted assets
        console.log('📈 Assets extracted from portfolios:', allAssets);
        console.log('🔍 Sample asset with currentPrice:', allAssets[0]);

        // Debug: Check each asset's structure
        allAssets.forEach((asset, index) => {
          console.log(`🔍 Asset ${index}:`, {
            _id: asset._id,
            symbol: asset.symbol,
            type: asset.type,
            quantity: asset.quantity,
            purchasePrice: asset.purchasePrice,
            currentPrice: asset.currentPrice,
            portfolioName: asset.portfolioName
          });
        });
      }

      // Fetch market overview
      let marketData = null;
      try {
        const marketResponse = await marketDataAPI.getMarketOverview();
        if (marketResponse.data.success) {
          marketData = marketResponse.data.data;
        }
      } catch (err) {
        console.error('Error fetching market overview:', err);
      }

      setPortfolios(allPortfolios);
      setAssets(allAssets);
      setMarketOverview(marketData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Show logout message
    console.log('👋 User logged out successfully');

    // Redirect to login page
    navigate('/login');
  };

  const calculateTotalValue = () => {
    if (!assets || assets.length === 0) return 0;
    
    const total = assets.reduce((total, asset) => {
      if (!asset || !asset.quantity) return total;
      
      // Use real current price if available, otherwise fall back to purchase price
      const currentPrice = asset.currentPrice && asset.currentPrice > 0 ? asset.currentPrice : asset.purchasePrice;
      if (!currentPrice) return total;
      
      const assetValue = asset.quantity * currentPrice;
      return total + (assetValue || 0);
    }, 0);
    
    return total || 0;
  };

  const calculateTotalInvestment = () => {
    if (!assets || assets.length === 0) return 0;
    
    const total = assets.reduce((total, asset) => {
      if (!asset || !asset.quantity || !asset.purchasePrice) return total;
      
      const assetInvestment = asset.quantity * asset.purchasePrice;
      return total + (assetInvestment || 0);
    }, 0);
    
    return total || 0;
  };

  const calculateTotalGainLoss = () => {
    const totalValue = calculateTotalValue();
    const totalInvestment = calculateTotalInvestment();
    const gainLoss = totalValue - totalInvestment;
    return gainLoss || 0;
  };

  const calculatePercentageGainLoss = () => {
    const totalInvestment = calculateTotalInvestment();
    if (totalInvestment === 0) {
      return 0;
    }
    const totalGainLoss = calculateTotalGainLoss();
    const percentage = (totalGainLoss / totalInvestment) * 100;
    return percentage || 0;
  };

  const getTopPerformers = () => {
    if (!assets || assets.length === 0) return [];

    return assets
      .filter(asset => 
        asset && 
        asset.symbol && 
        asset.currentPrice && 
        asset.currentPrice > 0 && 
        asset.purchasePrice && 
        asset.purchasePrice > 0 && 
        asset.quantity && 
        asset.quantity > 0
      )
      .map(asset => {
        const gainLoss = (asset.currentPrice - asset.purchasePrice) * asset.quantity;
        const percentage = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
        return { 
          ...asset, 
          gainLoss: gainLoss || 0, 
          percentage: percentage || 0 
        };
      })
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 5);
  };

  const getAssetAllocation = () => {
    if (!assets || assets.length === 0) return [];

    const allocation = {};
    assets.forEach(asset => {
      if (!asset || !asset.symbol || !asset.type || !asset.quantity) {
        return;
      }

      // Use real current price if available, otherwise fall back to purchase price
      const currentPrice = asset.currentPrice && asset.currentPrice > 0 ? asset.currentPrice : asset.purchasePrice;
      if (!currentPrice) return;

      const value = asset.quantity * currentPrice;
      allocation[asset.type] = (allocation[asset.type] || 0) + value;
    });

    // Convert to array format for easier mapping
    return Object.entries(allocation).map(([type, value]) => ({
      type,
      value,
      color: getColorForType(type)
    }));
  };

  const getColorForType = (type) => {
    const colors = {
      'stock': '#3B82F6',
      'crypto': '#10B981',
      'etf': '#F59E0B',
      'bond': '#8B5CF6',
      'forex': '#EF4444',
      'commodity': '#06B6D4'
    };
    return colors[type.toLowerCase()] || '#6B7280';
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-500 mb-6 animate-bounce-gentle">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-800 mb-3">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalValue = calculateTotalValue();
  const totalInvestment = calculateTotalInvestment();
  const totalGainLoss = calculateTotalGainLoss();
  const percentageGainLoss = calculatePercentageGainLoss();
  const topPerformers = getTopPerformers();
  const assetAllocation = getAssetAllocation();

  return (
    <div className="min-h-screen bg-transparent">
      {/* Page Header */}
      <div className="bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
            <div className="text-white flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Dashboard</h1>
              <p className="text-blue-100 text-base sm:text-lg break-words">Overview of your investment portfolio</p>
            </div>
            <div className="flex items-center space-x-4 lg:flex-shrink-0">
              {/* Create Portfolio button removed */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Portfolio Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#010d50] border border-blue-300 rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-300">Total Value</p>
                <p className="text-xl sm:text-2xl font-bold text-white break-words">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#010d50] border border-green-300 rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-300">Total Gain/Loss</p>
                <p className={`text-xl sm:text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'} break-words`}>
                  {formatCurrency(Math.abs(totalGainLoss))}
                </p>
                <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalGainLoss >= 0 ? '+' : '-'}{percentageGainLoss.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#010d50] border border-amber-300 rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-300">Performance</p>
                <p className={`text-xl sm:text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'} break-words`}>
                  {percentageGainLoss.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#010d50] border border-purple-300 rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-300">Portfolios</p>
                <p className="text-xl sm:text-2xl font-bold text-white break-words">{portfolios.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Enhanced Asset Allocation */}
          <div className="bg-[#010d50] border border-blue-300 rounded-2xl shadow-2xl my-6 lg:my-8">
            <div className="px-4 sm:px-6 py-4 border-b border-blue-500/20 bg-blue-500/10">
              <h2 className="text-lg font-medium text-white">Asset Allocation</h2>
            </div>
            <div className="p-4 sm:p-6">
              {assetAllocation.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No assets to display allocation
                </div>
              ) : (
                <div className="space-y-4">
                  {assetAllocation.map((item, index) => (
                    <div key={`allocation-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-white font-medium capitalize break-words">{item.type}</span>
                      </div>
                      <div className="flex-1 mx-4 min-w-0">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(item.value / totalValue) * 100}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-white font-medium text-sm sm:text-base break-words ml-2">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Top Performers */}
          <div className="bg-[#010d50] border border-green-300 rounded-2xl shadow-2xl my-6 lg:my-8">
            <div className="px-4 sm:px-6 py-4 border-b border-green-500/20 bg-green-500/10">
              <h2 className="text-lg font-medium text-white">Top Performers</h2>
            </div>
            <div className="p-4 sm:p-6">
              {topPerformers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No top performers to display
                </div>
              ) : (
                <div className="space-y-4">
                  {topPerformers.map((asset, index) => (
                    <div key={asset._id} className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium break-words">{asset.symbol}</div>
                          <div className="text-gray-400 text-sm break-words">{asset.portfolioName}</div>
                        </div>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className="text-green-400 font-medium text-sm sm:text-base">{formatCurrency(asset.gainLoss)}</div>
                        <div className="text-green-400 text-sm">+{asset.percentage.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Recent Assets */}
        <div className="bg-[#010d50] border border-purple-300 rounded-2xl shadow-2xl mt-6 lg:mt-8">
          <div className="px-4 sm:px-6 py-4 border-b border-purple-500/20 bg-purple-500/10">
            <h2 className="text-lg font-medium text-white">Recent Assets</h2>
          </div>
          <div className="p-4 sm:p-6">
            {assets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No recent assets to display
              </div>
            ) : (
              <div className="space-y-3">
                {assets.slice(0, 10).map((asset) => (
                  <div key={asset._id} className="flex items-center justify-between p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">{asset.symbol?.charAt(0) || '?'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium break-words">{asset.symbol}</div>
                        {asset.notes && (
                          <div className="text-gray-400 text-sm break-words">{asset.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <div className="text-white font-medium text-sm sm:text-base break-words">{formatCurrency(asset.quantity * asset.purchasePrice)}</div>
                      <div className="text-gray-400 text-sm">{asset.quantity} units</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Market Overview */}
        {marketOverview && (
          <div className="bg-[#010d50] border border-purple-300 rounded-2xl shadow-2xl mt-6 lg:mt-8">
            <div className="px-4 sm:px-6 py-4 border-b border-purple-500/20 bg-purple-500/10">
              <h2 className="text-lg font-medium text-white">Market Overview</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 rounded-lg bg-blue-900/30 border border-blue-300/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-blue-200 mb-1">S&P 500</p>
                  <p className="text-xl sm:text-2xl font-bold text-white break-words">
                    {marketOverview.sp500 ? `$${marketOverview.sp500.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-900/30 border border-green-300/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-green-200 mb-1">NASDAQ</p>
                  <p className="text-xl sm:text-2xl font-bold text-white break-words">
                    {marketOverview.nasdaq ? `$${marketOverview.nasdaq.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-900/30 border border-amber-300/50 sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-amber-200 mb-1">Bitcoin</p>
                  <p className="text-xl sm:text-2xl font-bold text-white break-words">
                    {marketOverview.bitcoin ? `$${marketOverview.bitcoin.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Portfolio Modal removed */}

      {/* Deep Navy Background Section for Footer Transition */}
      <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 break-words">Track Your Portfolio Performance</h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-4 break-words">
              Monitor your investments in real-time with comprehensive analytics and insights to make informed decisions.
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

export default Dashboard;

