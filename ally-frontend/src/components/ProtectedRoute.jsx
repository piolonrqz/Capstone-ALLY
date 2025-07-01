import { Navigate, useLocation } from 'react-router-dom';
import { getAuthData, isAdmin } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRole }) => {
  const location = useLocation();
  const authData = getAuthData();

  // Check if user is authenticated
  if (!authData) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Special check for admin routes
  if (allowedRole === 'ADMIN') {
    if (!isAdmin()) {
      // If user is not an admin with ADMIN department, redirect to home
      return <Navigate to="/" replace />;
    }
  }
  // For other roles, just check the role
  else if (allowedRole && authData.accountType !== allowedRole.toUpperCase()) {
    // If user is logged in but doesn't have the right role, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
