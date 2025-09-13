import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Assets from './pages/Assets';
import Analytics from './pages/Analytics';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import SmoothCursor from './components/lightswind/smooth-cursor';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Router>
      <div className="App min-h-screen" style={{
        background: 'linear-gradient(to bottom, #0b0a22 0%, #0426de 25%, #0b0a22 50%, #0426de 75%, #0b0a22 100%)',
        backgroundSize: '100% 3000px',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: '0 128px'
      }}>
        {!isMobile && (
          <SmoothCursor 
            size={25}
            color="transparent"
            borderColor="#0b0a22"
            borderWidth={2}
            springConfig={{
              damping: 45,
              stiffness: 400,
              mass: 1,
              restDelta: 0.001,
            }}
            showTrail={true}
            trailLength={5}
            rotateOnMove={true}
            scaleOnClick={true}
            glowEffect={false}
            magneticDistance={50}
            magneticElements="[data-magnetic], button, a, .btn-primary, .card"
          />
        )}
        <Navbar />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
