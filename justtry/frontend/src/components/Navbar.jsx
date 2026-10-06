import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from 'react-hot-toast';

const Navbar = ({ toggleTheme, isDark, activeBoard }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isGuestMode = !user && localStorage.getItem('guestMode') === 'true';
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleProfileClick = () => {
    if (isGuestMode) {
      toast.error('Please create an account to access your profile!');
      navigate('/register');
      return;
    }
    navigate('/profile');
    setMenuOpen(false);
  };

  const handleLogout = () => {
    if (isGuestMode) {
      localStorage.removeItem('guestMode');
      navigate('/login');
      return;
    }
    logout();
    navigate('/login');
  };

  const handleCreateAccount = () => {
    localStorage.removeItem('guestMode');
    navigate('/register');
  };

  return (
    <>
      {isGuestMode && (
        <div className="guest-banner">
          <span>👋 You're in Guest Mode - Your changes won't be saved</span>
          <button onClick={handleCreateAccount} className="banner-button">
            Create Account to Save
          </button>
        </div>
      )}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">FlowTask</span>
          {activeBoard && <span className="board-title"> / {activeBoard}</span>}
        </div>
        
        <div className="navbar-center">
          <button 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button 
            className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}
            onClick={() => navigate('/reports')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-label">Reports</span>
          </button>
        </div>
        
        <div className="navbar-menu">
          <button
            onClick={toggleTheme}
            className="icon-button theme-toggle"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          
          <div className="user-menu" ref={menuRef}>
            <button 
              className="user-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="user-avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" />
                ) : (
                  isGuestMode ? '👤' : (user?.name?.charAt(0).toUpperCase() || 'U')
                )}
              </span>
              <span className="user-name">{isGuestMode ? 'Guest' : (user?.name || 'User')}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
          
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={handleProfileClick}>
                <span>👤</span> Profile
              </button>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>
                <span>🚪</span> {isGuestMode ? 'Exit Guest Mode' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
