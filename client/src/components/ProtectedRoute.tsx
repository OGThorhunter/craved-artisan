import React from 'react';
import type { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while determining authentication state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect to={redirectTo} />;
  }

  // Check role if required
  if (role && user.role.toLowerCase() !== role.toLowerCase()) {
    return <Redirect to="/" />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 