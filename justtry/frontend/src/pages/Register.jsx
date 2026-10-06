import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(() => {
    // Check if suitcase was already opened
    return localStorage.getItem('suitcaseOpened') === 'true';
  });
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    // Save that suitcase was opened
    if (isOpen) {
      localStorage.setItem('suitcaseOpened', 'true');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Server may be unavailable.');
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
          <p className="suitcase-text">Click to start with FlowTask</p>
        </div>
        )}

        <div className={`auth-card ${isOpen ? 'show' : ''}`}>
          <div className="auth-header">
            <h1 className="auth-logo">FlowTask</h1>
            <p className="auth-tagline">Streamline your workflow</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Create Account</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>

          
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
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

export default Register;
