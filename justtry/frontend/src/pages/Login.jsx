import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(() => {
    // Check if suitcase was already opened
    return localStorage.getItem('suitcaseOpened') === 'true';
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Save that suitcase was opened
    if (isOpen) {
      localStorage.setItem('suitcaseOpened', 'true');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please try again.');
    }
  };

  const handleSkip = () => {
    // Store guest mode flag
    localStorage.setItem('guestMode', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      {!isOpen && (
        <div className="suitcase-container" onClick={() => setIsOpen(true)}>
          <div className="suitcase">
            <div className="suitcase-top"></div>
            <div className="suitcase-bottom"></div>
            <div className="suitcase-handle"></div>
            <div className="suitcase-lock"></div>
            </div>
            <p className="suitcase-text">Click to open FlowTask</p>
          </div>
        )}

        <div className={`auth-card ${isOpen ? 'show' : ''}`}>
          <div className="auth-header">
            <h1 className="auth-logo">FlowTask</h1>
            <p className="auth-tagline">Streamline your workflow</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Welcome Back</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="auth-button">
              Sign In
            </button>

            <p className="auth-link">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>

            <p className="auth-link" style={{ marginTop: '15px' }}>
              <span onClick={handleSkip}>
                Skip for now
              </span> - Continue as Guest
            </p>
          </form>
        </div>
      </div>
  );
};

export default Login;
