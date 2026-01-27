import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sync_token'));
  const [loading, setLoading] = useState(true);

  // Create API instance that updates when token changes
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
    });
    
    // Add token to all requests
    instance.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('sync_token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });
    
    return instance;
  }, []);

  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem('sync_token');
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('sync_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('sync_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name) => {
    const response = await axios.post(`${API_URL}/auth/register`, { email, password, name });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('sync_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('sync_token');
    setToken(null);
    setUser(null);
    window.location.href = '/auth';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    api,
    isAuthenticated: !!user
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
