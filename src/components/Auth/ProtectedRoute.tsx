import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'guest' | 'learner' | 'subscriber' | 'admin' | 'translator';
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredRole && profile) {
    const roleHierarchy = {
      guest: 0,
      learner: 1,
      subscriber: 2,
      translator: 2,
      admin: 3,
    };

    const userRoleLevel = roleHierarchy[profile.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Special check for subscriber-only content
    if (requiredRole === 'subscriber' && profile.role === 'subscriber' && profile.subscription_status !== 'active') {
      return <Navigate to="/subscribe" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;