import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  UsersIcon,
  FolderIcon,
  CurrencyDollarIcon as DollarIcon,
  GlobeAltIcon as WorldIcon,
  ServerIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ShinyText } from '../components/lightswind/shiny-text';
import { BorderBeam } from '../components/lightswind/border-beam';


const Home = () => {
  // Icon mapping for dynamic features
  const iconMap = {
    'ChartBarIcon': ChartBarIcon,
    'CurrencyDollarIcon': CurrencyDollarIcon,
    'GlobeAltIcon': GlobeAltIcon,
    'ArrowTrendingUpIcon': ArrowTrendingUpIcon,
    'ShieldCheckIcon': ShieldCheckIcon,
    'CogIcon': CogIcon,
    'UsersIcon': UsersIcon,
    'FolderIcon': FolderIcon,
    'ServerIcon': ServerIcon
  };

  // State for dynamic content - initialized with fake data
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 15432,
    totalPortfolios: 45000,
    totalAssets: 2500000000,
    uptime: 99.99,
    countries: 150,
    exchanges: 50
  });

  const [features, setFeatures] = useState([
    {
      id: 1,
      title: 'Stocks & ETFs',
      description: 'Track stocks, ETFs, and equity investments with real-time data and performance analytics.',
      icon: 'ChartBarIcon',
      isActive: true,
      priority: 1
    },
    {
      id: 2,
      title: 'Cryptocurrency',
      description: 'Monitor cryptocurrency holdings with live price updates and portfolio tracking.',
      icon: 'CurrencyDollarIcon',
      isActive: true,
      priority: 2
    },
    {
      id: 3,
      title: 'Global Markets',
      description: 'Access international markets and multi-currency portfolio management.',
      icon: 'GlobeAltIcon',
      isActive: true,
      priority: 3
    },
    {
      id: 4,
      title: 'Performance Analytics',
      description: 'Advanced portfolio analytics with ROI, CAGR, and risk metrics calculations.',
      icon: 'ArrowTrendingUpIcon',
      isActive: true,
      priority: 4
    },
    {
      id: 5,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy standards.',
      icon: 'ShieldCheckIcon',
      isActive: true,
      priority: 5
    },
    {
      id: 6,
      title: 'Automated Updates',
      description: 'Automatic portfolio updates with real-time market data and corporate actions.',
      icon: 'CogIcon',
      isActive: true,
      priority: 6
    }
  ]);

  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Portfolio Manager',
      company: 'Tech Investments Inc.',
      content: 'PortfolioTracker has revolutionized how we manage our client portfolios. The real-time analytics and automated tracking save us hours every week.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Individual Investor',
      company: 'Retail Investor',
      content: 'As someone managing my own retirement portfolio, this platform gives me the professional tools I need to make informed decisions.',
      rating: 5,
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Financial Advisor',
      company: 'Wealth Management Group',
      content: 'The global market coverage and multi-currency support make this platform perfect for our international clients.',
      rating: 5,
      avatar: 'ER'
    }
  ]);





  // Utility function to format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Get icon component dynamically
  const getIconComponent = (iconName) => {
    return iconMap[iconName] || ChartBarIcon; // Fallback to default icon
  };

  // Filter active features and sort by priority
  const activeFeatures = features.filter(f => f.isActive).sort((a, b) => a.priority - b.priority);

  // Carousel state for testimonials
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isHovering, testimonials.length]);

  // Get testimonial animation class
  const getTestimonialClass = (index) => {
    if (index === activeTestimonial) {
      return "scale-100 opacity-100 z-20 translate-x-0";
    }
    if (index === (activeTestimonial + 1) % testimonials.length) {
      return "translate-x-[40%] scale-95 opacity-60 z-10";
    }
    if (index === (activeTestimonial - 1 + testimonials.length) % testimonials.length) {
      return "translate-x-[-40%] scale-95 opacity-60 z-10";
    }
    return "scale-90 opacity-0 z-0";
  };



  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 break-words">
            <ShinyText
              size="6xl"
              weight="extrabold"
              baseColor="hsl(0, 0%, 100%)"
              shineColor="hsl(210, 100%, 70%)"
              intensity={1}
              direction="left-to-right"
              speed={32}
              shineWidth={20}
              className="text-center"
            >
              All Your Investments, One Platform
            </ShinyText>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 break-words">
            Track stocks, ETFs, crypto, forex, and more with our advanced portfolio tracking and investment analytics tools, helping you make informed investment decisions.
          </p>

          {/* Dynamic Platform Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 mb-2 break-words">
                {platformStats.totalUsers > 0 ? `${formatNumber(platformStats.totalUsers)}+` : '0'}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mb-2 break-words">
                {platformStats.totalPortfolios > 0 ? `${formatNumber(platformStats.totalPortfolios)}+` : '0'}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">Portfolios</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400 mb-2 break-words">
                {platformStats.totalAssets > 0 ? `$${formatNumber(platformStats.totalAssets)}` : '$0'}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">Assets Managed</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-2 break-words">
                {platformStats.uptime}%
              </div>
              <div className="text-xs sm:text-sm text-gray-300">Uptime</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/register"
              className="relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
            >
              <BorderBeam
                size={50}
                duration={3}
                colorFrom="#FCD34D"
                colorTo="#F59E0B"
                glowIntensity={1}
                pauseOnHover={true}
              />
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/dashboard"
              className="relative inline-flex items-center justify-center border border-white text-white hover:bg-white hover:text-[#0b0a22] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
            >
              <BorderBeam
                size={45}
                duration={3}
                colorFrom="#FCD34D"
                colorTo="#F59E0B"
                glowIntensity={1}
                pauseOnHover={true}
              />
              Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 sm:py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 break-words">
              Track all your investments in one place
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4 break-words">
              Comprehensive portfolio management with real-time tracking, advanced analytics, and professional insights.
            </p>
          </div>

          {activeFeatures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {activeFeatures.map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon);
                return (
                  <div key={feature._id || feature.id} className="bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4 sm:p-6 hover:bg-blue-800/40 hover:border-blue-300/50 transition-all duration-300 group shadow-lg hover:shadow-xl">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-8 w-8 text-blue-300 group-hover:text-blue-200 transition-colors" />
                      </div>
                      <h3 className="ml-3 text-base sm:text-lg font-semibold text-white group-hover:text-blue-100 transition-colors break-words">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-200 group-hover:text-gray-100 transition-colors text-sm sm:text-base break-words">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No features available at the moment.</div>
              <div className="text-gray-500 text-sm mt-2">Features will appear here once they are added to the platform.</div>
            </div>
          )}
        </div>
      </section>

      {/* Gradient Transition Section */}
      <div className="h-8 bg-gradient-to-b from-transparent via-[#010d50]/10 via-[#010d50]/20 to-[#010d50]/40"></div>

      {/* User Testimonials Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-b from-[#010d50]/40 via-[#010d50]/60 to-[#010d50]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 break-words">
              What our users say
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4 break-words">
              Join thousands of satisfied investors who trust our platform for their portfolio management needs.
            </p>
          </div>

          {testimonials.length > 0 ? (
            <div
              className="relative overflow-hidden h-[350px] flex items-center justify-center"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              ref={carouselRef}
            >
              {/* Testimonial Cards */}
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial._id || testimonial.id}
                  className={`absolute top-0 w-full max-w-sm transform transition-all duration-700 ease-in-out ${getTestimonialClass(index)}`}
                >
                  <div className="bg-gradient-to-br from-[#010d50]/20 via-[#010d50]/40 to-[#010d50]/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 mx-auto min-h-[280px] sm:min-h-[300px]">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white font-semibold break-words">{testimonial.name}</h4>
                        <p className="text-gray-400 text-sm break-words">{testimonial.role}</p>
                        <p className="text-gray-500 text-xs break-words">{testimonial.company}</p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed break-words">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              ))}

              {/* Navigation Buttons */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all hover:scale-110"
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                aria-label="Previous"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all hover:scale-110"
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                aria-label="Next"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-3 z-30">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx
                      ? "bg-blue-400 w-5"
                      : "bg-gray-400 hover:bg-gray-300"
                      }`}
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No testimonials available yet.</div>
              <div className="text-gray-500 text-sm mt-2">User testimonials will appear here once they are added to the platform.</div>
            </div>
          )}
        </div>
      </section>

      {/* Gradient Transition Section */}
      <div className="h-8 bg-gradient-to-b from-[#010d50]/80 via-[#010d50]/40 via-[#010d50]/20 to-transparent"></div>

      {/* Benefits Section */}
      <section className="py-12 bg-gradient-to-b from-[#010d50]/40 via-[#010d50]/60 via-[#010d50]/80 to-[#010d50]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why choose our platform?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Built for long-term investors who want to stay organized and in control of their investments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#010d50]/20 via-[#010d50]/40 to-[#010d50]/60 backdrop-blur-sm border border-white/20 relative overflow-hidden group rounded-2xl shadow-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Automated Tracking</h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  Our platform automatically tracks dividends, corporate actions, and portfolio performance,
                  giving you more time to focus on your investment strategy.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#010d50]/20 via-[#010d50]/40 to-[#010d50]/60 backdrop-blur-sm border border-white/20 relative overflow-hidden group rounded-2xl shadow-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <GlobeAltIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Global Coverage</h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  Track stocks, ETFs, crypto, and forex from markets around the world with
                  real-time data and multi-currency support.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#010d50]/20 via-[#010d50]/40 to-[#010d50]/60 backdrop-blur-sm border border-white/20 relative overflow-hidden group h-full rounded-2xl shadow-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Security First</h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  Your financial data is protected with enterprise-grade security,
                  encryption, and privacy standards you can trust.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-gradient-to-br from-[#010d50]/20 via-[#010d50]/40 to-[#010d50]/60 backdrop-blur-sm border border-white/20 relative overflow-hidden group rounded-2xl shadow-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Advanced Analytics</h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  Get detailed insights with ROI calculations, CAGR analysis, risk metrics,
                  and performance comparisons to optimize your portfolio.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#010d50]/20 via-[#010d50]/40 to-[#010d50]/60 backdrop-blur-sm border border-white/20 relative overflow-hidden group rounded-2xl shadow-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <CogIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 text-center">Smart Automation</h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  Set up automated alerts, portfolio rebalancing, and real-time updates
                  to stay informed without constant monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Transition Section */}
      <div className="h-8 bg-gradient-to-b from-[#010d50]/80 via-[#010d50]/40 via-[#010d50]/20 to-transparent"></div>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 break-words">
            Get started today
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 break-words">
            Set up your portfolio in minutes and start seeing how your investments perform, grow, and evolve over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/register" className="bg-white text-[#0b0a22] hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors duration-200 w-full sm:w-auto text-center">
              Create a free account
            </Link>
            <Link to="/dashboard" className="border border-white text-white hover:bg-white hover:text-[#0b0a22] font-medium py-3 px-6 rounded-lg transition-colors duration-200 w-full sm:w-auto text-center">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Deep Navy Background Section for Footer Transition */}
      <div className="bg-gradient-to-t from-[#0b0a22] to-transparent py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 break-words">Start Your Investment Journey</h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-4 break-words">
              Join {platformStats.totalUsers > 0 ? `${formatNumber(platformStats.totalUsers)}+` : '0'} investors who trust our platform to track, analyze, and grow their investment portfolios.
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
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

export default Home;
