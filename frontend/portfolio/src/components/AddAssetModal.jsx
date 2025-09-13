import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { assetAPI, portfolioAPI } from '../services/api';

const AddAssetModal = ({ isOpen, onClose, onAssetAdded }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [formData, setFormData] = useState({
    portfolioId: '',
    type: 'stock',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    notes: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPortfolios();
    }
  }, [isOpen]);

  const fetchPortfolios = async () => {
    try {
      const response = await portfolioAPI.getPortfolios();
      if (response.data.success) {
        setPortfolios(response.data.data);
        if (response.data.data.length > 0) {
          setFormData(prev => ({ ...prev, portfolioId: response.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.portfolioId) {
      setError('Please select a portfolio');
      setLoading(false);
      return;
    }

    try {
      const assetData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await assetAPI.createAsset(assetData);
      if (response.data.success) {
        onAssetAdded(response.data.data);
        onClose();
        setFormData({
          portfolioId: portfolios.length > 0 ? portfolios[0]._id : '',
          type: 'stock',
          symbol: '',
          quantity: '',
          purchasePrice: '',
          purchaseDate: '',
          notes: '',
          tags: ''
        });
      }
    } catch (err) {
      console.error('Error adding asset:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.message).join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to add asset. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#010d50] backdrop-blur-sm border border-white/20 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Add New Asset</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="portfolioId" className="block text-sm font-medium text-gray-200 mb-1">
              Portfolio *
            </label>
            <select
              id="portfolioId"
              name="portfolioId"
              required
              value={formData.portfolioId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
            >
              <option value="" className="bg-[#010d50] text-white">Select a portfolio</option>
              {portfolios.map(portfolio => (
                <option key={portfolio._id} value={portfolio._id} className="bg-[#010d50] text-white">
                  {portfolio.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-200 mb-1">
              Asset Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
            >
              <option value="stock" className="bg-[#010d50] text-white">Stock</option>
              <option value="crypto" className="bg-[#010d50] text-white">Cryptocurrency</option>
              <option value="bond" className="bg-[#010d50] text-white">Bond</option>
              <option value="etf" className="bg-[#010d50] text-white">ETF</option>
              <option value="mutual-fund" className="bg-[#010d50] text-white">Mutual Fund</option>
              <option value="real-estate" className="bg-[#010d50] text-white">Real Estate</option>
              <option value="commodity" className="bg-[#010d50] text-white">Commodity</option>
              <option value="other" className="bg-[#010d50] text-white">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-200 mb-1">
              Symbol/Ticker *
            </label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              required
              value={formData.symbol}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
              placeholder="e.g., AAPL, BTC, SPY"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-200 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                step="0.000001"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-200 mb-1">
                Purchase Price *
              </label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                required
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
                placeholder="e.g., 150.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-200 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-200 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
              placeholder="Any additional notes about this asset"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-200 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
              placeholder="e.g., tech, large-cap, dividend (comma separated)"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0426de] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#0426de]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
