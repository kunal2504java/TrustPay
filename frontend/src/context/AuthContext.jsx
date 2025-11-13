import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = apiClient.getToken();
    if (token) {
      try {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Auth check failed:', err);
        apiClient.clearAuth();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login...');
      setError(null);
      const response = await apiClient.login(email, password);
      console.log('AuthContext: Login successful, fetching user data...');
      const userData = await apiClient.getCurrentUser();
      console.log('AuthContext: User data received:', userData);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Starting registration...');
      setError(null);
      await apiClient.register(userData);
      console.log('AuthContext: Registration successful, auto-logging in...');
      // Auto-login after registration
      const loginResult = await login(userData.email, userData.password);
      console.log('AuthContext: Auto-login result:', loginResult);
      return loginResult;
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
