import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserStore from '../../store/userStore';

function ProtectedRoute({ children, requiredPermission = null, requiredResource = null }) {
  const { isAuthenticated, hasPermission, canAccess } = useUserStore();
  const location = useLocation();

  // Check authentication
  if (!isAuthenticated) {
    // Redirect to login page with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific permission if required
  if (requiredPermission && requiredResource) {
    if (!hasPermission(requiredResource, requiredPermission)) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check resource access if required
  if (requiredResource && !requiredPermission) {
    if (!canAccess(requiredResource)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;