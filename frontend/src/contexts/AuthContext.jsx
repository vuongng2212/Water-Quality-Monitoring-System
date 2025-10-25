import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Will hold token and user info

  // In a real app, you'd check localStorage or a cookie for an existing token
  const isAuthenticated = !!user;

  const login = (userData) => {
    // In a real app, this would come from an API call
    // and you would set the token in localStorage
    setUser(userData);
  };

  const logout = () => {
    // Clear user and remove token from localStorage
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}