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

  // Debug logging
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute: isLoading:', isLoading);
  console.log('ProtectedRoute: user:', user);
  console.log('ProtectedRoute: required role:', role);

  // Show loading spinner while determining authentication state
  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Redirect to={redirectTo} />;
  }

  // Check role if required
  if (role && user.role.toLowerCase() !== role.toLowerCase()) {
    console.log('ProtectedRoute: Role mismatch, redirecting to home');
    return <Redirect to="/" />;
  }

  console.log('ProtectedRoute: Access granted, rendering children');
  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 