import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { portfolioAPI, assetAPI } from '../services/api';
import MagicLoader from '../components/lightswind/magic-loader';
import { BorderBeam } from '../components/lightswind/border-beam';

import CreatePortfolioModal from '../components/CreatePortfolioModal';
import AddAssetModal from '../components/AddAssetModal';

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] = useState(false);
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
    setError('');
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
      setError('Failed to load portfolios. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async (portfolioId) => {
    setAssetsLoading(true);
    try {
      const response = await assetAPI.getAssets(portfolioId);
      if (response.data.success) {
        setAssets(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setAssetsLoading(false);
    }
  };

  const handlePortfolioCreated = (newPortfolio) => {
    setPortfolios(prev => [...prev, newPortfolio]);
    setSelectedPortfolio(newPortfolio);
  };

  const handleAssetAdded = (newAsset) => {
    setAssets(prev => [...prev, newAsset]);
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio? This will also delete all assets in it.')) {
      return;
    }

    try {
      await portfolioAPI.deletePortfolio(portfolioId);
      setPortfolios(prev => prev.filter(p => p._id !== portfolioId));
      if (selectedPortfolio?._id === portfolioId) {
        setSelectedPortfolio(portfolios.length > 1 ? portfolios.find(p => p._id !== portfolioId) : null);
        setAssets([]);
      }
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      alert('Failed to delete portfolio. Please try again.');
    }
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

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show logout message
    console.log('👋 User logged out successfully');
    
    // Redirect to login page
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
                   {/* Page Header */}
      <div className="bg-transparent shadow-2xl backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
            <div className="text-white flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Portfolio Management</h1>
              <p className="text-blue-100 text-base sm:text-lg break-words">Manage your investment portfolios and assets</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:flex-shrink-0">
              <button 
                onClick={() => setShowAddAssetModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg w-full sm:w-auto"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Asset
              </button>
              <button
                onClick={() => setShowCreatePortfolioModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg w-full sm:w-auto"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

                 {portfolios.length === 0 ? (
           <div className="text-center py-20 bg-[#010d50] border border-blue-500/30 rounded-2xl shadow-2xl">
             <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-8 animate-float">
               <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
             </div>
             <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No portfolios yet</h3>
             <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed px-4">
               Start building your investment journey by creating your first portfolio. 
               Track your assets, monitor performance, and make informed decisions.
             </p>
             <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
               <button
                 onClick={() => setShowCreatePortfolioModal(true)}
                 className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
               >
                 <PlusIcon className="h-5 w-5 mr-2" />
                 Create Portfolio
               </button>
               <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto">
                 <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 Learn More
               </button>
             </div>
           </div>
        ) : (
          <div className="space-y-6">
                         {/* Enhanced Portfolio Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {portfolios.map((portfolio) => (
                <div 
                  key={portfolio._id} 
                  className="bg-[#010d50] border border-blue-500/30 cursor-pointer hover:border-blue-400/50 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-blue-500/20 p-4 sm:p-6"
                  onClick={() => setSelectedPortfolio(portfolio)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 break-words">{portfolio.name}</h3>
                      <p className="text-gray-300 text-sm mb-3 break-words">{portfolio.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            portfolio.riskLevel === 'conservative' ? 'bg-green-500' :
                            portfolio.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          {portfolio.riskLevel}
                        </span>
                        <span>Target: {portfolio.targetReturn}%</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePortfolio(portfolio._id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200 ml-2 flex-shrink-0"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Assets Section */}
            {selectedPortfolio && (
              <div className="bg-[#010d50] border border-indigo-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-indigo-500/20">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <h2 className="text-lg font-medium text-white break-words">
                      Assets in {selectedPortfolio.name}
                    </h2>
                    <button
                      onClick={() => setShowAddAssetModal(true)}
                      className="relative inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 w-full sm:w-auto"
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

                {assetsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <MagicLoader
                      size={100}
                      speed={1.2}
                      hueRange={[180, 220]}
                    />
                  </div>
                ) : assets.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    No assets in this portfolio yet. Add your first asset to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-indigo-500/20">
                      <thead className="bg-indigo-500/10">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                            Asset
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                            Purchase Price
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                            Total Value
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                            Purchase Date
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent divide-y divide-indigo-500/20">
                        {assets.map((asset) => (
                          <tr key={asset._id} className="hover:bg-indigo-500/5 transition-colors duration-200">
                            <td className="px-3 sm:px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-white break-words">
                                  {asset.symbol}
                                </div>
                                {asset.notes && (
                                  <div className="text-sm text-gray-400 break-words">{asset.notes}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {asset.type}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-white">
                              {asset.quantity}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-white">
                              {formatCurrency(asset.purchasePrice)}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-white">
                              {formatCurrency(asset.quantity * asset.purchasePrice)}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-400">
                              {asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A'}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                              <button
                                onClick={() => handleDeleteAsset(asset._id)}
                                className="text-red-400 hover:text-red-300 transition-colors duration-200"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deep Navy Background Section for Footer Transition */}
      <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Manage Your Investment Portfolios</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Create, organize, and track multiple portfolios to diversify your investments and achieve your financial goals.
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

      {/* Modals */}
      <CreatePortfolioModal
        isOpen={showCreatePortfolioModal}
        onClose={() => setShowCreatePortfolioModal(false)}
        onPortfolioCreated={handlePortfolioCreated}
      />

      <AddAssetModal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        onAssetAdded={handleAssetAdded}
      />
    </div>
  );
};

export default Portfolio;
