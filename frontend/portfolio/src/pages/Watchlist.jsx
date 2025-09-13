import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  BellIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { watchlistAPI, marketDataAPI } from '../services/api';
import MagicLoader from '../components/lightswind/magic-loader';
import { Link, useNavigate } from 'react-router-dom';


const Watchlist = () => {
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [newItemData, setNewItemData] = useState({
    symbol: '',
    type: 'stock',
    name: '',
    targetPrice: '',
    notes: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    setIsAuthenticated(true);
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    setLoading(true);
    try {
      const response = await watchlistAPI.getWatchlists();
      if (response.data.success) {
        setWatchlists(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedWatchlist(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching watchlists:', err);
      if (err.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }
      // For other errors, show empty state
      setWatchlists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) return;
    
    try {
      const response = await watchlistAPI.createWatchlist({ name: newWatchlistName });
      if (response.data.success) {
        setWatchlists(prev => [...prev, response.data.data]);
        setNewWatchlistName('');
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Error creating watchlist:', err);
    }
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    if (!window.confirm('Are you sure you want to delete this watchlist?')) {
      return;
    }

    try {
      await watchlistAPI.deleteWatchlist(watchlistId);
      setWatchlists(prev => prev.filter(w => w._id !== watchlistId));
      if (selectedWatchlist?._id === watchlistId) {
        setSelectedWatchlist(watchlists.length > 1 ? watchlists.find(w => w._id !== watchlistId) : null);
      }
    } catch (err) {
      console.error('Error deleting watchlist:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!selectedWatchlist) return;
    
    try {
      await watchlistAPI.removeWatchlistItem(selectedWatchlist._id, itemId);
      // Refresh the watchlist
      const response = await watchlistAPI.getWatchlist(selectedWatchlist._id);
      if (response.data.success) {
        setSelectedWatchlist(response.data.data);
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Search both stocks and crypto
      const [stockResults, cryptoResults] = await Promise.all([
        marketDataAPI.searchStocks(searchQuery),
        marketDataAPI.searchCrypto(searchQuery)
      ]);
      
      const results = [
        ...(stockResults.data?.data || []).map(item => ({ ...item, type: 'stock' })),
        ...(cryptoResults.data?.data || []).map(item => ({ ...item, type: 'crypto' }))
      ];
      
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddItemToWatchlist = async (item) => {
    if (!selectedWatchlist) return;
    
    try {
      const itemData = {
        symbol: item.symbol || item.Symbol,
        type: item.type,
        name: item.name || item.Name,
        currentPrice: item.price || item.Price || 0,
        targetPrice: newItemData.targetPrice || null,
        notes: newItemData.notes || ''
      };
      
      await watchlistAPI.addItemToWatchlist(selectedWatchlist._id, itemData);
      
      // Refresh the watchlist
      const response = await watchlistAPI.getWatchlist(selectedWatchlist._id);
      if (response.data.success) {
        setSelectedWatchlist(response.data.data);
      }
      
      setShowAddItemModal(false);
      setNewItemData({ symbol: '', type: 'stock', name: '', targetPrice: '', notes: '' });
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const handleRefreshPrices = async () => {
    if (!selectedWatchlist) return;
    
    try {
      await watchlistAPI.refreshPrices(selectedWatchlist._id);
      // Refresh the watchlist
      const response = await watchlistAPI.getWatchlist(selectedWatchlist._id);
      if (response.data.success) {
        setSelectedWatchlist(response.data.data);
      }
    } catch (err) {
      console.error('Error refreshing prices:', err);
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl p-12 text-center">
            <BellIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
            <p className="text-gray-400 mb-6">Please log in to access your watchlists</p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>

        {/* Deep Navy Background Section for Footer Transition */}
        <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Access Your Watchlists</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Log in to manage your personalized watchlists and track your favorite assets.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#0b0a22] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
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
              <p className="text-gray-400 text-sm">
                © 2025, All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Watchlist</h1>
              <p className="text-yellow-100 text-base sm:text-lg break-words">Track your favorite assets and opportunities</p>
            </div>
            <div className="flex items-center space-x-4 lg:flex-shrink-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm w-full sm:w-auto"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Search Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                <input
                  type="text"
                  placeholder="Search for stocks, crypto, or other assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-500/10 text-white placeholder-yellow-300 focus:bg-yellow-500/20"
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                Search Results ({searchResults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((item, index) => (
                  <div key={index} className="border border-yellow-500/20 rounded-lg p-4 hover:bg-yellow-500/10 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                          {item.symbol?.charAt(0) || item.Symbol?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{item.symbol || item.Symbol}</div>
                          <div className="text-sm text-gray-400 capitalize">{item.type}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewItemData({
                            symbol: item.symbol || item.Symbol,
                            type: item.type,
                            name: item.name || item.Name,
                            targetPrice: '',
                            notes: ''
                          });
                          setShowAddItemModal(true);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white text-sm rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-colors duration-200"
                      >
                        Add to Watchlist
                      </button>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div className="mb-1">{item.name || item.Name || 'N/A'}</div>
                      <div className="text-yellow-400 font-medium">
                        {item.price || item.Price ? formatCurrency(item.price || item.Price) : 'Price N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Watchlists and Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Watchlists Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl">
              <div className="px-6 py-4 border-b border-yellow-500/20 bg-yellow-500/10">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Your Watchlists
                </h3>
              </div>
              <div className="p-4">
                {watchlists.length === 0 ? (
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white mb-4">No watchlists yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-colors duration-200"
                    >
                      Create First Watchlist
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {watchlists.map((watchlist) => (
                      <div
                        key={watchlist._id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedWatchlist?._id === watchlist._id
                            ? 'bg-yellow-500/20 border-2 border-yellow-500'
                            : 'hover:bg-yellow-500/10 border-2 border-transparent hover:border-yellow-500/30'
                        }`}
                        onClick={() => setSelectedWatchlist(watchlist)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                            <span className="font-medium text-white">{watchlist.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWatchlist(watchlist._id);
                            }}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {watchlist.items?.length || 0} items
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Watchlist Items */}
          <div className="lg:col-span-2">
            {selectedWatchlist ? (
              <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-yellow-500/20 bg-yellow-500/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      {selectedWatchlist.name}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">
                        {selectedWatchlist.items?.length || 0} items
                      </span>
                      <button
                        onClick={() => setShowAddItemModal(true)}
                        className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white text-sm rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-colors duration-200"
                      >
                        <PlusIcon className="h-4 w-4 mr-1 inline" />
                        Add Item
                      </button>
                      <button
                        onClick={handleRefreshPrices}
                        className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-colors duration-200"
                      >
                        <EyeIcon className="h-4 w-4 mr-1 inline" />
                        Refresh Prices
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {!selectedWatchlist.items || selectedWatchlist.items.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-yellow-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <EyeIcon className="h-10 w-10 text-yellow-400" />
                      </div>
                      <p className="text-white mb-2 text-lg font-medium">No items in watchlist</p>
                      <p className="text-sm text-gray-400">Search and add assets to start tracking</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedWatchlist.items.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/10 transition-colors duration-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4">
                              {item.symbol?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{item.symbol}</div>
                              <div className="text-sm text-gray-400 capitalize">{item.type}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-semibold text-white">
                                {item.currentPrice ? formatCurrency(item.currentPrice) : 'N/A'}
                              </div>
                              {item.change && (
                                <div className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {item.change >= 0 ? '+' : ''}{formatCurrency(item.change)} ({item.changePercent?.toFixed(2)}%)
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#010d50] border border-yellow-500/30 rounded-2xl shadow-2xl p-12 text-center">
                <BellIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select a Watchlist</h3>
                <p className="text-gray-400">Choose a watchlist from the sidebar to view its items</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#010d50] border border-yellow-500/30 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Create New Watchlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Watchlist Name
              </label>
              <input
                type="text"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="Enter watchlist name"
                className="w-full px-3 py-2 border border-yellow-500/30 rounded-lg bg-yellow-500/10 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateWatchlist()}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWatchlist}
                disabled={!newWatchlistName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#010d50] border border-yellow-500/30 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Add Item to Watchlist</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={newItemData.symbol}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="e.g., AAPL, BTC"
                  className="w-full px-3 py-2 border border-yellow-500/30 rounded-lg bg-yellow-500/10 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newItemData.type}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-yellow-500/30 rounded-lg bg-yellow-500/10 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="bond">Bond</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Company/Asset name"
                  className="w-full px-3 py-2 border border-yellow-500/30 rounded-lg bg-yellow-500/10 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Price (Optional)
                </label>
                <input
                  type="number"
                  value={newItemData.targetPrice}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, targetPrice: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-yellow-500/30 rounded-lg bg-yellow-500/10 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newItemData.notes}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add your notes here..."
                  rows="3"
                  className="w-full px-3 py-2 border border-yellow-500/30 rounded-lg bg-yellow-500/10 text-white placeholder-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddItemToWatchlist(newItemData)}
                disabled={!newItemData.symbol.trim()}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deep Navy Background Section for Footer Transition */}
      <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Monitor Your Watchlist</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Keep track of potential investments and market opportunities with your personalized watchlist.
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

export default Watchlist;
