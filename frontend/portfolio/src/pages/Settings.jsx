import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { authAPI } from '../services/api';
import { notificationAPI } from '../services/api';
import { securityAPI } from '../services/api';
import MagicLoader from '../components/lightswind/magic-loader';
import { Link, useLocation } from 'react-router-dom';
import { BorderBeam } from '../components/lightswind/border-beam';


const Settings = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: ''
  });
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    priceAlerts: true,
    portfolioUpdates: true
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Security state
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // Login history state
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogins: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Message state
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  useEffect(() => {
    loadUserData();
    
    // Check if URL has tab parameter
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['profile', 'notifications', 'security', 'preferences'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Load login history when security tab is active
  useEffect(() => {
    if (activeTab === 'security') {
      loadLoginHistory();
    }
  }, [activeTab]);

  const loadUserData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || ''
        });
      }

      // Load notification preferences from backend
      try {
        const response = await notificationAPI.getPreferences();
        if (response.data.success) {
          const backendPrefs = response.data.data;
          setNotificationPrefs({
            priceAlerts: backendPrefs.priceAlerts,
            portfolioUpdates: backendPrefs.portfolioUpdates
          });
          console.log('✅ Loaded notification preferences from backend:', backendPrefs);
        }
      } catch (error) {
        console.warn('Could not load notification preferences from backend:', error);
        // Fallback to localStorage if backend fails
        const savedPrefs = localStorage.getItem('notificationPreferences');
        if (savedPrefs) {
          try {
            const parsedPrefs = JSON.parse(savedPrefs);
            setNotificationPrefs(prev => ({ ...prev, ...parsedPrefs }));
          } catch (err) {
            console.warn('Could not parse notification preferences from localStorage:', err);
          }
        }
      }
    } catch (err) {
      console.warn('Could not parse user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    // TODO: Implement profile update API call
    console.log('Saving profile:', formData);
    setEditing(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion API call
      console.log('Deleting account');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  // Notification preference handlers
  const handleNotificationChange = (key, value) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      // Save to backend
      const response = await notificationAPI.updatePreferences(notificationPrefs);
      
      if (response.data.success) {
        console.log('✅ Notification preferences saved to backend:', response.data.data);
        
        // Also save to localStorage as backup
        localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefs));
        
        // Show success message
        alert('Notification preferences saved successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      
      // Fallback to localStorage if backend fails
      try {
        localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefs));
        alert('Preferences saved locally (backend unavailable). Please try again later.');
      } catch (localError) {
        alert('Failed to save notification preferences. Please try again.');
      }
    } finally {
      setSavingNotifications(false);
    }
  };

  // Security functions
  const handlePasswordChange = (e) => {
    setChangePasswordData({
      ...changePasswordData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = async () => {
    setChangingPassword(true);
    try {
      const response = await securityAPI.changePassword(changePasswordData);
      
      if (response.data.success) {
        showMessage('success', 'Password changed successfully!');
        setShowChangePassword(false);
        setChangePasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', error.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const loadLoginHistory = async (page = 1) => {
    setLoadingHistory(true);
    try {
      const response = await securityAPI.getLoginHistory(page);
      
      if (response.data.success) {
        setLoginHistory(response.data.data.logins);
        setHistoryPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to load login history');
      }
    } catch (error) {
      console.error('Error loading login history:', error);
      setLoginHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleHistoryPageChange = (newPage) => {
    loadLoginHistory(newPage);
  };

  // Message helper function
  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => {
      setMessage({ show: false, type: '', text: '' });
    }, 5000); // Auto-hide after 5 seconds
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

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon }
  ];

  return (
    <div className="min-h-screen bg-transparent">
             {/* Page Header */}
       <div className="bg-transparent shadow-2xl backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
             <div className="text-white flex-1 min-w-0">
               <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Settings</h1>
               <p className="text-gray-100 text-base sm:text-lg break-words">Manage your account and preferences</p>
             </div>
             <div className="flex items-center space-x-4 lg:flex-shrink-0">
               <button
                 onClick={handleLogout}
                 className="inline-flex items-center justify-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm w-full sm:w-auto"
               >
                 <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                 Logout
               </button>
             </div>
           </div>
         </div>
       </div>

       {/* Message Display */}
       {message.show && (
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
           <div className={`rounded-lg p-4 border-l-4 ${
             message.type === 'success' 
               ? 'bg-green-50 border-green-400 text-green-800' 
               : 'bg-red-50 border-red-400 text-red-800'
           }`}>
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 <div className={`w-5 h-5 rounded-full mr-3 ${
                   message.type === 'success' ? 'bg-green-400' : 'bg-red-400'
                 }`}></div>
                 <p className="font-medium">{message.text}</p>
               </div>
               <button
                 onClick={() => setMessage({ show: false, type: '', text: '' })}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                 </svg>
               </button>
             </div>
           </div>
         </div>
       )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-[#010d50] border border-blue-500/30 rounded-2xl shadow-2xl">
              <div className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-400'
                            : 'text-gray-300 hover:text-blue-300 hover:bg-blue-500/10'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="break-words">{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-[#010d50] border border-blue-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-blue-500/20 bg-blue-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="break-words">Profile Information</span>
                    </h3>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-500/30 rounded-lg bg-[#010d50] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-500/30 rounded-lg bg-[#010d50] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-500/30 rounded-lg bg-[#010d50] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-500/30 rounded-lg bg-[#010d50] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={handleSaveProfile}
                          className="relative px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <BorderBeam 
                            size={35}
                            duration={3}
                            colorFrom="#FCD34D"
                            colorTo="#F59E0B"
                            glowIntensity={1}
                            pauseOnHover={true}
                          />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                          {user?.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">
                            {formData.firstName} {formData.lastName}
                          </h4>
                          <p className="text-blue-300">@{formData.username}</p>
                          <p className="text-gray-400">{formData.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Username</h5>
                          <p className="text-white">{formData.username}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Email</h5>
                          <p className="text-white">{formData.email}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-2">First Name</h5>
                          <p className="text-white">{formData.firstName || 'Not set'}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-400 mb-2">Last Name</h5>
                          <p className="text-white">{formData.lastName || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-[#010d50] border border-blue-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-blue-500/20 bg-blue-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="break-words">Notification Preferences</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={async () => {
                          try {
                            const response = await notificationAPI.resetPreferences();
                            if (response.data.success) {
                              const resetPrefs = response.data.data;
                              setNotificationPrefs({
                                priceAlerts: resetPrefs.priceAlerts,
                                portfolioUpdates: resetPrefs.portfolioUpdates
                              });
                              alert('Notification preferences reset to defaults!');
                            }
                          } catch (error) {
                            console.error('Error resetting preferences:', error);
                            alert('Failed to reset preferences. Please try again.');
                          }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 border border-blue-500/30 text-sm font-medium rounded-lg text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto"
                      >
                        Reset to Defaults
                      </button>
                      <button
                        onClick={handleSaveNotifications}
                        disabled={savingNotifications}
                        className="inline-flex items-center justify-center px-4 py-2 border border-blue-500/30 text-sm font-medium rounded-lg text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        <BorderBeam 
                          size={35}
                          duration={3}
                          colorFrom="#FCD34D"
                          colorTo="#F59E0B"
                          glowIntensity={1}
                          pauseOnHover={true}
                        />
                        {savingNotifications ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
                      <div>
                        <h4 className="font-medium text-white">Price Alerts</h4>
                        <p className="text-sm text-gray-300">Get notified when assets reach target prices</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notificationPrefs.priceAlerts}
                          onChange={(e) => handleNotificationChange('priceAlerts', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
                      <div>
                        <h4 className="font-medium text-white">Portfolio Updates</h4>
                        <p className="text-sm text-gray-300">Receive daily portfolio performance summaries</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notificationPrefs.portfolioUpdates}
                          onChange={(e) => handleNotificationChange('portfolioUpdates', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-[#010d50] border border-green-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-green-500/20 bg-green-500/10">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="break-words">Security Settings</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Change Password Section */}
                    <div className="border border-green-500/20 rounded-lg bg-green-500/5 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-white">Change Password</h4>
                          <p className="text-sm text-gray-300">Update your account password</p>
                        </div>
                        <button
                          onClick={() => setShowChangePassword(!showChangePassword)}
                          className="inline-flex items-center px-3 py-2 border border-green-500/30 text-sm font-medium rounded-lg text-green-300 bg-green-500/10 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                        >
                          {showChangePassword ? 'Cancel' : 'Change Password'}
                        </button>
                      </div>
                      
                      {showChangePassword && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                name="currentPassword"
                                value={changePasswordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-green-500/30 rounded-lg bg-[#010d50] text-white focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                placeholder="Enter current password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                name="newPassword"
                                value={changePasswordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-green-500/30 rounded-lg bg-[#010d50] text-white focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                placeholder="Enter new password"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={changePasswordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-3 py-2 border border-green-500/30 rounded-lg bg-[#010d50] text-white focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                              placeholder="Confirm new password"
                            />
                          </div>
                          <div className="flex space-x-3 pt-2">
                            <button
                              onClick={handleChangePassword}
                              disabled={changingPassword || !changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword}
                              className="relative px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <BorderBeam 
                                size={35}
                                duration={3}
                                colorFrom="#FCD34D"
                                colorTo="#F59E0B"
                                glowIntensity={1}
                                pauseOnHover={true}
                              />
                              {changingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Login History Section */}
                    <div className="border border-green-500/20 rounded-lg bg-green-500/5 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-white">Login History</h4>
                          <p className="text-sm text-gray-300">View recent login activity and sessions</p>
                        </div>
                        <button
                          onClick={() => loadLoginHistory()}
                          disabled={loadingHistory}
                          className="inline-flex items-center px-3 py-2 border border-green-500/30 text-sm font-medium rounded-lg text-green-300 bg-green-500/10 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                        >
                          {loadingHistory ? 'Loading...' : 'Refresh'}
                        </button>
                      </div>
                      
                      {loadingHistory ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                          <p className="text-gray-400 mt-2">Loading login history...</p>
                        </div>
                      ) : loginHistory.length > 0 ? (
                        <div className="space-y-3">
                          {loginHistory.map((login, index) => (
                            <div key={login._id} className="flex items-center justify-between p-3 border border-green-500/20 rounded-lg bg-green-500/5">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${login.status === 'success' ? 'bg-green-400' : login.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                                <div>
                                  <p className="text-sm text-white font-medium">
                                    {login.browser} on {login.operatingSystem}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {login.deviceType} • {login.ipAddress}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(login.loginTime).toLocaleString()}
                                    {login.sessionDuration > 0 && ` • ${login.sessionDuration} min session`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  login.status === 'success' ? 'bg-green-500/20 text-green-300' :
                                  login.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                  'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                  {login.status}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {/* Pagination */}
                          {historyPagination.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-green-500/20">
                              <button
                                onClick={() => handleHistoryPageChange(historyPagination.currentPage - 1)}
                                disabled={!historyPagination.hasPrevPage}
                                className="px-3 py-2 text-sm text-green-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              <span className="text-sm text-gray-400">
                                Page {historyPagination.currentPage} of {historyPagination.totalPages}
                              </span>
                              <button
                                onClick={() => handleHistoryPageChange(historyPagination.currentPage + 1)}
                                disabled={!historyPagination.hasNextPage}
                                className="px-3 py-2 text-sm text-green-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No login history found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-[#010d50] border border-purple-500/30 rounded-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-purple-500/20 bg-purple-500/10">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="break-words">App Preferences</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-purple-500/20 rounded-lg bg-purple-500/5">
                      <div>
                        <h4 className="font-medium text-white">Dark Mode</h4>
                        <p className="text-sm text-gray-300">Switch to dark theme</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-purple-500/20 rounded-lg bg-purple-500/5">
                      <div>
                        <h4 className="font-medium text-white">Email Notifications</h4>
                        <p className="text-sm text-gray-300">Receive email updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-purple-500/20 rounded-lg bg-purple-500/5">
                      <div>
                        <h4 className="font-medium text-white">Auto-refresh</h4>
                        <p className="text-sm text-gray-300">Automatically refresh data</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            


          </div>
        </div>
      </div>

      {/* Deep Navy Background Section for Footer Transition */}
      <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Customize Your Experience</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Manage your account settings, preferences, and security to personalize your portfolio tracking experience.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0b0a22] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pages</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white text-sm">Home</Link></li>
                <li><Link to="/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link></li>
                <li><Link to="/portfolio" className="text-gray-300 hover:text-white text-sm">Portfolio</Link></li>
                <li><Link to="/market" className="text-gray-300 hover:text-white text-sm">Market</Link></li>
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

export default Settings;
