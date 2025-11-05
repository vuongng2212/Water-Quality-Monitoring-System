import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Check for existing token in localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally verify token or fetch user info here
      setUser({ token }); // Or fetch user details using the token
    }
    setLoading(false); // Set loading to false after checking
  }, []);

  const login = async (username, password) => {
    console.log('API Base URL:', import.meta.env.NEXT_PUBLIC_API_BASE_URL); // Thêm dòng này để debug
    try {
      const response = await fetch(`${import.meta.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { token, user: userInfo } = data; // Assuming backend returns {token, user}

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set user info in context
      setUser({ token, ...userInfo });
      return { success: true, user: { token, ...userInfo } };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear user and remove token from localStorage
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading, // Expose loading state
 };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}