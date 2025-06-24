import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state with auth from localStorage if available
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('auth');
        return null;
      }
    }
    return null;
  });

  // Log the auth state changes
  useEffect(() => {
    if (auth) {
      console.log('Auth Token:', auth.token);
      console.log("Auth structure:", auth);
    } else {
      console.log('No auth token available');
    }
  }, [auth]);

  // Login function to set the token and store it in localStorage
  const login = (data) => {
    console.log('Login function called with:', data);
    setAuth(data);
    localStorage.setItem('auth', JSON.stringify(data));
    console.log('Auth state updated and saved to localStorage');
  };

  // Logout function to clear auth state and localStorage
  const logout = () => {
    console.log('Logout function called');
    setAuth(null);
    localStorage.removeItem('auth');
    console.log('Auth state cleared');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;