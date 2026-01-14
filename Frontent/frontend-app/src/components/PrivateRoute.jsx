
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" />;
  }

  // If requiredRoles are specified, check if the user's role is included
  if (requiredRoles && requiredRoles.length > 0) {
    if (!user || !requiredRoles.includes(user.role)) {
      // If authenticated but role not authorized, redirect to home page or an unauthorized page
      // For simplicity, redirecting to home page.
      console.warn(`Access denied for user role: ${user?.role}. Required roles: ${requiredRoles.join(', ')}`);
      return <Navigate to="/" />;
    }
  }

  // If authenticated and authorized by role (or no roles required), render the children
  return children;
};

export default PrivateRoute;
