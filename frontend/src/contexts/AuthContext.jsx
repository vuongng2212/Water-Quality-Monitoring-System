/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Check for existing token in cookie on app start
  useEffect(() => {
    const token = getCookie('token');
    console.log('AuthContext: Checking token on app start:', token ? 'Token exists' : 'No token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('AuthContext: Token decoded successfully:', decoded);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log('AuthContext: Token is expired');
          setUser(null);
          setLoading(false);
        } else {
          console.log('AuthContext: Token is valid locally, setting initial user data');
          setUser({ token, username: decoded.sub, role: decoded.role, factoryId: decoded.factoryId });
          // Verify token with backend and get full user data
          api.get('/auth/me').then((response) => {
            console.log('AuthContext: Token verified with backend, updating with full user data:', response.data);
            setUser({ ...response.data, token });
            setLoading(false);
          }).catch((error) => {
            console.log('AuthContext: Token verification failed:', error);
            deleteCookie('token');
            setUser(null);
            setLoading(false);
          });
        }
      } catch (error) {
        console.log('AuthContext: Token decode failed:', error);
        setUser(null);
        setLoading(false);
      }
    } else {
      console.log('AuthContext: No token found');
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    console.log('Login attempt:', username, 'URL:', api.defaults.baseURL + '/auth/login');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token } = response.data;
      setCookie('token', token, 7);
      let decoded = {};
      try {
        decoded = jwtDecode(token);
      } catch (error) {
        console.log('AuthContext: Token decode failed after login:', error);
      }
      // Set initial user data from token
      const initialUser = { token, username: decoded.sub, role: decoded.role, factoryId: decoded.factoryId };
      setUser(initialUser);
      // Fetch full user data
      try {
        const userResponse = await api.get('/auth/me');
        setUser({ ...userResponse.data, token });
      } catch (error) {
        console.log('AuthContext: Failed to fetch user data after login:', error);
        // Keep initial user data
      }
      return { success: true, user: initialUser };
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