import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to role-specific dashboard immediately
  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'VENDOR':
          setLocation('/dashboard/vendor/pulse');
          return;
        case 'CUSTOMER':
          setLocation('/dashboard/customer');
          return;
        case 'EVENT_COORDINATOR':
        case 'COORDINATOR':
          setLocation('/dashboard/event-coordinator');
          return;
        case 'ADMIN':
          setLocation('/dashboard/admin');
          return;
        default:
          // If no role, redirect to home
          setLocation('/');
          return;
      }
    }
  }, [user, isLoading, setLocation]);

  // Show only loading state - no dashboard selector UI
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}