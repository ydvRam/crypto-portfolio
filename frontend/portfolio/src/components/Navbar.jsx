import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { notificationAPI } from '../services/api';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        // Log logout activity to backend
        const token = localStorage.getItem('token');
        if (token) {
          // Make API call to log logout (this will be handled by backend)
          // The backend will automatically log logout when token expires or is invalidated
        }
      } catch (error) {
        console.error('Error logging logout:', error);
        // Continue with logout even if logging fails
      }
      
      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('👋 User logged out successfully');
      navigate('/login');
    }
  };

  const isAuthenticated = localStorage.getItem('token');

  // Fetch notification count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotificationCount = async () => {
        try {
          const response = await notificationAPI.getNotificationCount();
          if (response.data.success) {
            setNotificationCount(response.data.data.unreadCount);
          }
        } catch (error) {
          console.error('Failed to fetch notification count:', error);
        }
      };

      fetchNotificationCount();
      
      // Refresh notification count every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const navigation = [
    { name: 'Home', href: '/', public: true },
    { name: 'Dashboard', href: '/dashboard', public: false },
    { name: 'Portfolio', href: '/portfolio', public: false },
    { name: 'Assets', href: '/assets', public: false },
    { name: 'Analytics', href: '/analytics', public: false },
    { name: 'Watchlist', href: '/watchlist', public: false },
    { name: 'Settings', href: '/settings', public: false },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.public || isAuthenticated
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0a22] shadow-2xl backdrop-blur-sm font-['Inter']">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-24 py-4">
          {/* Logo */}
          <div className="flex items-center mr-10">
            <Link to="/" className="flex items-center group">
              <img 
                src={logo}
                alt="INVESTMENT PORTFOLIO Logo"
                className="h-90 w-90 group-hover:scale-110 transition-all duration-300"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-3 rounded-lg text-lg font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side - Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => window.location.href = '/settings?tab=notifications'}
                  className="relative text-white/80 hover:text-white p-3 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300"
                >
                  <BellIcon className="h-6 w-6" />
                  {/* Notification Badge */}
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-5 py-3 border border-white/30 text-lg font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-300 backdrop-blur-sm hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white px-5 py-3 rounded-lg text-lg font-medium transition-all duration-300 hover:bg-white/10 border border-transparent hover:border-white/20"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-5 py-3 border border-white/30 text-lg font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-300 backdrop-blur-sm hover:scale-105"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0b0a22] border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-3 rounded-lg text-lg font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = '/settings?tab=notifications';
                      }}
                      className="w-full text-left px-3 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 text-lg font-medium flex items-center"
                    >
                      <BellIcon className="h-5 w-5 mr-3" />
                      Notifications
                      {notificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 text-lg font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
