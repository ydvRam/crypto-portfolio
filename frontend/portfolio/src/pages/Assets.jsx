import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { portfolioAPI, assetAPI } from '../services/api';
import MagicLoader from '../components/lightswind/magic-loader';
import { BorderBeam } from '../components/lightswind/border-beam';

import AddAssetModal from '../components/AddAssetModal';

const Assets = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      fetchAssets(selectedPortfolio._id);
    }
  }, [selectedPortfolio]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const response = await portfolioAPI.getPortfolios();
      if (response.data.success) {
        setPortfolios(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedPortfolio(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async (portfolioId) => {
    try {
      const response = await assetAPI.getAssets(portfolioId);
      if (response.data.success) {
        setAssets(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  };

  const handleAssetAdded = (newAsset) => {
    setAssets(prev => [...prev, newAsset]);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      await assetAPI.deleteAsset(assetId);
      setAssets(prev => prev.filter(a => a._id !== assetId));
    } catch (err) {
      console.error('Error deleting asset:', err);
      alert('Failed to delete asset. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const calculateAssetValue = (asset) => {
    if (!asset || !asset.quantity) return 0;
    const currentPrice = asset.currentPrice || asset.purchasePrice;
    if (!currentPrice) return 0;
    return asset.quantity * currentPrice;
  };

  const calculateGainLoss = (asset) => {
    if (!asset || !asset.currentPrice || !asset.purchasePrice || !asset.quantity) return 0;
    const currentValue = asset.quantity * asset.currentPrice;
    const purchaseValue = asset.quantity * asset.purchasePrice;
    return currentValue - purchaseValue;
  };

  const calculateGainLossPercentage = (asset) => {
    if (!asset || !asset.currentPrice || !asset.purchasePrice || !asset.quantity) return 0;
    const gainLoss = calculateGainLoss(asset);
    const purchaseValue = asset.quantity * asset.purchasePrice;
    return purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
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

  const totalValue = assets.reduce((total, asset) => total + calculateAssetValue(asset), 0) || 0;
  const totalGain = assets.reduce((total, asset) => total + calculateGainLoss(asset), 0) || 0;
  const totalCost = assets.reduce((total, asset) => total + (asset.quantity * asset.purchasePrice), 0) || 0;
  const totalQuantity = assets.reduce((total, asset) => total + (asset.quantity || 0), 0) || 0;
  const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  const totalReturn = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const totalAssets = assets.length || 0;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-transparent shadow-2xl backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
            <div className="text-white flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Asset Management</h1>
              <p className="text-green-100 text-base sm:text-lg break-words">Manage and track your individual assets</p>
            </div>
            <div className="flex items-center space-x-4 lg:flex-shrink-0">
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm w-full sm:w-auto"
              >
                <BorderBeam 
                  size={35}
                  duration={3}
                  colorFrom="#FCD34D"
                  colorTo="#F59E0B"
                  glowIntensity={1}
                  pauseOnHover={true}
                />
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Asset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Portfolio Selector */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-[#010d50] border border-green-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="break-words">Select Portfolio</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio._id}
                  onClick={() => setSelectedPortfolio(portfolio)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedPortfolio?._id === portfolio._id
                      ? 'border-green-400 bg-green-500/10'
                      : 'border-green-500/20 hover:border-green-400/40 hover:bg-green-500/5'
                  }`}
                >
                  <h3 className="font-medium text-white mb-1 break-words">{portfolio.name}</h3>
                  <p className="text-sm text-gray-300 break-words">{portfolio.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedPortfolio && (
          <div className="space-y-6">
            {/* Assets Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#010d50] border border-blue-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Total Assets</p>
                    <p className="text-xl sm:text-2xl font-bold text-white break-words">{totalAssets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#010d50] border border-green-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Total Value</p>
                    <p className="text-xl sm:text-2xl font-bold text-white break-words">{formatCurrency(totalValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Avg. Price</p>
                    <p className="text-xl sm:text-2xl font-bold text-white break-words">{formatCurrency(averagePrice)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#010d50] border border-purple-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Total Cost</p>
                    <p className="text-xl sm:text-2xl font-bold text-white break-words">{formatCurrency(totalCost)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets List */}
            <div className="bg-[#010d50] border border-green-500/30 rounded-2xl shadow-2xl">
              <div className="px-4 sm:px-6 py-4 border-b border-green-500/20 bg-green-500/10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <h2 className="text-lg font-medium text-white break-words">
                    Assets in {selectedPortfolio.name}
                  </h2>
                  <button
                    onClick={() => setShowAddAssetModal(true)}
                    className="relative inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 w-full sm:w-auto"
                  >
                    <BorderBeam 
                      size={35}
                      duration={3}
                      colorFrom="#FCD34D"
                      colorTo="#F59E0B"
                      glowIntensity={1}
                      pauseOnHover={true}
                    />
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Asset
                  </button>
                </div>
              </div>

              {assets.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CurrencyDollarIcon className="h-10 w-10 text-green-400" />
                  </div>
                  <p className="text-white mb-2 text-lg font-medium">No assets found</p>
                  <p className="text-sm text-gray-400">Add your first asset to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-500/20">
                    <thead className="bg-green-500/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">
                          Asset
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">
                          Purchase Price
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">
                          Gain/Loss
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-green-500/20">
                      {assets.map((asset) => {
                        const gainLoss = calculateGainLoss(asset);
                        const gainLossPercentage = calculateGainLossPercentage(asset);

                        return (
                          <tr key={asset._id} className="hover:bg-green-500/5 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                                  {asset.symbol?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-white">{asset.symbol}</div>
                                  {asset.notes && (
                                    <div className="text-sm text-gray-400">{asset.notes}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 capitalize border border-green-500/30">
                                {asset.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                              {asset.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {formatCurrency(asset.purchasePrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                              {formatCurrency(calculateAssetValue(asset))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-right">
                                <p className={`text-sm font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                </p>
                                <p className={`text-xs ${gainLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                  {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors duration-200">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-500/10 transition-colors duration-200">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAsset(asset._id)}
                                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        onAssetAdded={handleAssetAdded}
      />

      {/* Deep Navy Background Section for Footer Transition */}
      <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Track Your Investment Assets</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Monitor individual assets across all your portfolios with detailed performance metrics and real-time updates.
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

export default Assets;
