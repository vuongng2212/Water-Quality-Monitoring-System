/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Check for existing token in cookie on app start
  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      // Optionally verify token or fetch user info here
      setUser({ token }); // Or fetch user details using the token
    }
    setLoading(false); // Set loading to false after checking
  }, []);

  const login = async (username, password) => {
    console.log('Login attempt:', username, 'URL:', api.defaults.baseURL + '/auth/login');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userInfo } = response.data;

      // Store token in cookie for 7 days
      setCookie('token', token, 7);

      // Set user info in context
      setUser({ token, ...userInfo });
      return { success: true, user: { token, ...userInfo } };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear user and remove token from cookie
    deleteCookie('token');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isEmployee: user?.role === 'EMPLOYEE',
    login,
    logout,
    loading, // Expose loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}