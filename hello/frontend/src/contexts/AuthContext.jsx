import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by verifying token
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setAuthToken(data.token);
      
      const userInfo = {
        id: data._id,
        name: data.name,
        email: data.email,
      };
      
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      return userInfo;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authAPI.register(name, email, password);
      setAuthToken(data.token);
      
      const userInfo = {
        id: data._id,
        name: data.name,
        email: data.email,
      };
      
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      return userInfo;
    } catch (error) {
      console.error('Registration failed:', error);
      // Throw the error with message for UI to display
      throw new Error(error.message || 'Failed to register. Please check your connection.');
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('tasks');
    localStorage.removeItem('projects');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
