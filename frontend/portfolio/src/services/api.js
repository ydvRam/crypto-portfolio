import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || 'https://portfolio-1md9.onrender.com/api'
    : 'http://localhost:8001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

export const portfolioAPI = {
  getPortfolios: () => api.get('/portfolios'),
  createPortfolio: (portfolioData) => api.post('/portfolios', portfolioData),
  updatePortfolio: (id, portfolioData) => api.put(`/portfolios/${id}`, portfolioData),
  deletePortfolio: (id) => api.delete(`/portfolios/${id}`),
  getPortfolioWithAnalytics: (id) => api.get(`/portfolios/${id}/analytics`),
};

export const assetAPI = {
  getAssets: (portfolioId) => api.get(`/assets/${portfolioId}`),
  createAsset: (assetData) => api.post('/assets', assetData),
  updateAsset: (id, assetData) => api.put(`/assets/${id}`, assetData),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
};

export const marketDataAPI = {
  getStockQuote: (symbol) => api.get(`/market/stocks/quote/${symbol}`),
  getCryptoQuote: (symbol) => api.get(`/market/crypto/quote/${symbol}`),
  searchStocks: (query) => api.get(`/market/stocks/search?query=${query}`),
  searchCrypto: (query) => api.get(`/market/crypto/search?query=${query}`),
  getMarketOverview: () => api.get('/market/overview'),
};

export const watchlistAPI = {
  getWatchlists: () => api.get('/watchlists'),
  getWatchlist: (id) => api.get(`/watchlists/${id}`),
  createWatchlist: (watchlistData) => api.post('/watchlists', watchlistData),
  updateWatchlist: (id, watchlistData) => api.put(`/watchlists/${id}`, watchlistData),
  deleteWatchlist: (id) => api.delete(`/watchlists/${id}`),
  addItemToWatchlist: (watchlistId, itemData) => api.post(`/watchlists/${watchlistId}/items`, itemData),
  updateWatchlistItem: (watchlistId, itemId, itemData) => api.put(`/watchlists/${watchlistId}/items/${itemId}`, itemData),
  removeItemFromWatchlist: (watchlistId, itemId) => api.delete(`/watchlists/${watchlistId}/items/${itemId}`),
  removeWatchlistItem: (watchlistId, itemId) => api.delete(`/watchlists/${watchlistId}/items/${itemId}`),
  refreshPrices: (watchlistId) => api.post(`/watchlists/${watchlistId}/refresh-prices`),
  getPublicWatchlists: () => api.get('/watchlists/public/discover'),
};

// Notification API
export const notificationAPI = {
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
  resetPreferences: () => api.post('/notifications/preferences/reset'),
  
  // Notification management
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getNotificationCount: () => api.get('/notifications/count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Security API
export const securityAPI = {
  changePassword: (passwordData) => api.put('/security/change-password', passwordData),
  getLoginHistory: (page = 1, limit = 10) => api.get(`/security/login-history?page=${page}&limit=${limit}`),
};

// Home Page API
export const homePageAPI = {
  // Get all home page data
  getHomePageData: () => axios.get('/api/home-page'),
  
  // Platform Statistics
  getPlatformStats: () => axios.get('/api/home-page/stats'),
  updatePlatformStats: (data) => axios.put('/api/home-page/stats', data),
  
  // Features
  getFeatures: () => axios.get('/api/home-page/features'),
  addFeature: (data) => axios.post('/api/home-page/features', data),
  updateFeature: (featureId, data) => axios.put(`/api/home-page/features/${featureId}`, data),
  deleteFeature: (featureId) => axios.delete(`/api/home-page/features/${featureId}`),
  
  // Testimonials
  getTestimonials: () => axios.get('/api/home-page/testimonials'),
  addTestimonial: (data) => axios.post('/api/home-page/testimonials', data),
  
  // News
  getNews: () => axios.get('/api/home-page/news'),
  addNews: (data) => axios.post('/api/home-page/news', data)
};

export default api;
