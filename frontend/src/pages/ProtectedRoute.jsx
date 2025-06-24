import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);
  
  console.log('ProtectedRoute - Auth state:', auth);
  
  if (!auth || !auth.token) {
    console.log('No auth token, redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  console.log('Auth token exists, allowing access');
  return children;
};

export default ProtectedRoute;