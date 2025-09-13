import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { portfolioAPI } from '../services/api';
import MagicLoader from '../components/lightswind/magic-loader';


const CreatePortfolioModal = ({ isOpen, onClose, onPortfolioCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    riskTolerance: 'moderate',
    investmentGoal: 'growth',
    targetReturn: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean up the form data before sending
      const cleanFormData = {
        ...formData,
        targetReturn: formData.targetReturn === '' ? undefined : parseFloat(formData.targetReturn)
      };

      console.log('Submitting portfolio data:', cleanFormData);
      const response = await portfolioAPI.createPortfolio(cleanFormData);
      console.log('Portfolio creation response:', response);
      
      if (response.data.success) {
        onPortfolioCreated(response.data.data);
        onClose();
        setFormData({
          name: '',
          description: '',
          isPublic: false,
          riskTolerance: 'moderate',
          investmentGoal: 'growth',
          targetReturn: ''
        });
      }
    } catch (err) {
      console.error('Error creating portfolio:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.message).join(', ');
        setError(errorMessages);
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check if your backend is running.');
      } else {
        setError(`Failed to create portfolio: ${err.message}`);
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
          <h2 className="text-xl font-semibold text-white">Create New Portfolio</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
              Portfolio Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
              placeholder="Enter portfolio name"
              data-magnetic
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
              placeholder="Enter portfolio description"
              data-magnetic
            />
          </div>

          <div>
            <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-200 mb-1">
              Risk Tolerance
            </label>
            <select
              id="riskTolerance"
              name="riskTolerance"
              value={formData.riskTolerance}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
              data-magnetic
            >
              <option value="conservative" className="bg-[#010d50] text-white">Conservative</option>
              <option value="moderate" className="bg-[#010d50] text-white">Moderate</option>
              <option value="aggressive" className="bg-[#010d50] text-white">Aggressive</option>
            </select>
          </div>

          <div>
            <label htmlFor="investmentGoal" className="block text-sm font-medium text-gray-200 mb-1">
              Investment Goal
            </label>
            <select
              id="investmentGoal"
              name="investmentGoal"
              value={formData.investmentGoal}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
              data-magnetic
            >
              <option value="income" className="bg-[#010d50] text-white">Income</option>
              <option value="growth" className="bg-[#010d50] text-white">Growth</option>
              <option value="balanced" className="bg-[#010d50] text-white">Balanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetReturn" className="block text-sm font-medium text-gray-200 mb-1">
              Target Return (%)
            </label>
            <input
              type="number"
              id="targetReturn"
              name="targetReturn"
              step="0.1"
              min="0"
              max="100"
              value={formData.targetReturn}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-300"
              placeholder="e.g., 8.5"
              data-magnetic
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-white/20 rounded bg-white/10"
              data-magnetic
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-200">
              Make this portfolio public
            </label>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-white/20">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/20 rounded-md text-sm font-medium text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#0426de] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#0426de]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <span className="ml-2">Creating...</span>
                </div>
              ) : (
                'Create Portfolio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;
