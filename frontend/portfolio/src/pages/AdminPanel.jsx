import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  CogIcon,
  UsersIcon,
  FolderIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { homePageAPI } from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [platformStats, setPlatformStats] = useState({});
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Icon mapping for admin panel
  const iconOptions = [
    { name: 'ChartBarIcon', component: ChartBarIcon, label: 'Chart Bar' },
    { name: 'CurrencyDollarIcon', component: CurrencyDollarIcon, label: 'Dollar' },
    { name: 'GlobeAltIcon', component: GlobeAltIcon, label: 'Globe' },
    { name: 'ArrowTrendingUpIcon', component: ArrowTrendingUpIcon, label: 'Trending Up' },
    { name: 'ShieldCheckIcon', component: ShieldCheckIcon, label: 'Shield' },
    { name: 'CogIcon', component: CogIcon, label: 'Settings' },
    { name: 'UsersIcon', component: UsersIcon, label: 'Users' },
    { name: 'FolderIcon', component: FolderIcon, label: 'Folder' },
    { name: 'ServerIcon', component: ServerIcon, label: 'Server' }
  ];

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    setLoading(true);
    try {
      const response = await homePageAPI.getHomePageData();
      if (response.data.success) {
        const data = response.data.data;
        setPlatformStats(data.platformStats);
        setFeatures(data.features);
        setTestimonials(data.testimonials);
        setNews(data.news);
      }
    } catch (error) {
      console.error('Error fetching home page data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Platform Statistics Management
  const updatePlatformStats = async (updates) => {
    try {
      const response = await homePageAPI.updatePlatformStats(updates);
      if (response.data.success) {
        setPlatformStats(response.data.data);
        alert('Platform statistics updated successfully!');
      }
    } catch (error) {
      console.error('Error updating platform stats:', error);
      alert('Failed to update platform statistics');
    }
  };

  // Features Management
  const addFeature = async (featureData) => {
    try {
      const response = await homePageAPI.addFeature(featureData);
      if (response.data.success) {
        setFeatures([...features, response.data.data]);
        alert('Feature added successfully!');
      }
    } catch (error) {
      console.error('Error adding feature:', error);
      alert('Failed to add feature');
    }
  };

  const updateFeature = async (featureId, updates) => {
    try {
      const response = await homePageAPI.updateFeature(featureId, updates);
      if (response.data.success) {
        setFeatures(features.map(f => f._id === featureId ? response.data.data : f));
        alert('Feature updated successfully!');
      }
    } catch (error) {
      console.error('Error updating feature:', error);
      alert('Failed to update feature');
    }
  };

  const deleteFeature = async (featureId) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await homePageAPI.deleteFeature(featureId);
        setFeatures(features.filter(f => f._id !== featureId));
        alert('Feature deleted successfully!');
      } catch (error) {
        console.error('Error deleting feature:', error);
        alert('Failed to delete feature');
      }
    }
  };

  // Testimonials Management
  const addTestimonial = async (testimonialData) => {
    try {
      const response = await homePageAPI.addTestimonial(testimonialData);
      if (response.data.success) {
        setTestimonials([...testimonials, response.data.data]);
        alert('Testimonial added successfully!');
      }
    } catch (error) {
      console.error('Error adding testimonial:', error);
      alert('Failed to add testimonial');
    }
  };

  // News Management
  const addNews = async (newsData) => {
    try {
      const response = await homePageAPI.addNews(newsData);
      if (response.data.success) {
        setNews([...news, response.data.data]);
        alert('News item added successfully!');
      }
    } catch (error) {
      console.error('Error adding news:', error);
      alert('Failed to add news item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0a22] flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0a22] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel - Home Page Management</h1>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-[#010d50] p-1 rounded-lg mb-8">
          {[
            { id: 'stats', label: 'Platform Statistics' },
            { id: 'features', label: 'Features' },
            { id: 'testimonials', label: 'Testimonials' },
            { id: 'news', label: 'News & Updates' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-[#010d50]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Platform Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="bg-[#010d50] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(platformStats).map(([key, value]) => (
                <div key={key} className="bg-[#0b0a22] rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setPlatformStats({...platformStats, [key]: parseFloat(e.target.value)})}
                    className="w-full bg-[#0b0a22] border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => updatePlatformStats(platformStats)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Update Statistics
            </button>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="bg-[#010d50] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Features Management</h2>
              <button
                onClick={() => {/* Add feature modal logic */}}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Feature
              </button>
            </div>
            
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature._id} className="bg-[#0b0a22] rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        {React.createElement(iconOptions.find(io => io.name === feature.icon)?.component || ChartBarIcon, { className: "h-5 w-5 text-white" })}
                      </div>
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* Toggle active status */}}
                        className={`p-2 rounded ${feature.isActive ? 'bg-green-600' : 'bg-gray-600'}`}
                      >
                        {feature.isActive ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {/* Edit feature modal */}}
                        className="p-2 bg-blue-600 rounded hover:bg-blue-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFeature(feature._id)}
                        className="p-2 bg-red-600 rounded hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="bg-[#010d50] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Testimonials Management</h2>
              <button
                onClick={() => {/* Add testimonial modal logic */}}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Testimonial
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial._id} className="bg-[#0b0a22] rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">"{testimonial.content}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 bg-blue-600 rounded hover:bg-blue-700">
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button className="p-1 bg-red-600 rounded hover:bg-red-700">
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="bg-[#010d50] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">News & Updates Management</h2>
              <button
                onClick={() => {/* Add news modal logic */}}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add News
              </button>
            </div>
            
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item._id} className="bg-[#0b0a22] rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.excerpt}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 bg-blue-600 rounded hover:bg-blue-700">
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button className="p-1 bg-red-600 rounded hover:bg-red-700">
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded">
                      {item.category}
                    </span>
                    <span>{item.date}</span>
                    <span>{item.readTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
