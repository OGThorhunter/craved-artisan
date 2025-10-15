import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ComingSoonPage from '../pages/ComingSoonPage';

interface MaintenanceStatus {
  maintenanceMode: boolean;
  source: 'environment' | 'database';
}

interface MaintenanceGateProps {
  children: React.ReactNode;
}

const MaintenanceGate: React.FC<MaintenanceGateProps> = ({ children }) => {
  const { user } = useAuth();
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  // Check maintenance mode status
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch('/api/maintenance/status');
        if (response.ok) {
          const status = await response.json();
          setMaintenanceStatus(status);
        } else {
          // If API fails, assume no maintenance mode
          setMaintenanceStatus({ maintenanceMode: false, source: 'environment' });
        }
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
        // If API fails, assume no maintenance mode
        setMaintenanceStatus({ maintenanceMode: false, source: 'environment' });
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceMode();
  }, []);

  // Check for beta access when maintenance mode is active
  useEffect(() => {
    const checkBetaAccess = async () => {
      if (!maintenanceStatus?.maintenanceMode) {
        setHasAccess(true);
        setAccessChecked(true);
        return;
      }

      // Check URL for beta parameter
      const urlParams = new URLSearchParams(window.location.search);
      const betaKey = urlParams.get('beta');

      // Check if user is admin (always has access)
      if (user?.role === 'ADMIN') {
        setHasAccess(true);
        setAccessChecked(true);
        return;
      }

      // Check if user is a beta tester
      if (user?.betaTester) {
        setHasAccess(true);
        setAccessChecked(true);
        return;
      }

      // Validate beta key if provided
      if (betaKey) {
        try {
          const response = await fetch('/api/maintenance/validate-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              betaKey,
              userId: user?.id
            }),
          });

          if (response.ok) {
            const result = await response.json();
            setHasAccess(result.hasAccess);
            
            // Store access in sessionStorage so it persists during the session
            if (result.hasAccess) {
              sessionStorage.setItem('beta_access', 'true');
              // Remove beta parameter from URL to keep it clean
              const newUrl = window.location.href.replace(/[?&]beta=[^&]*/, '');
              window.history.replaceState({}, '', newUrl);
            }
          }
        } catch (error) {
          console.error('Failed to validate beta access:', error);
        }
      }

      // Check if access was previously granted in this session
      const sessionAccess = sessionStorage.getItem('beta_access');
      if (sessionAccess === 'true') {
        setHasAccess(true);
      }

      setAccessChecked(true);
    };

    if (maintenanceStatus !== null) {
      checkBetaAccess();
    }
  }, [maintenanceStatus, user]);

  // Show loading spinner while checking status
  if (isLoading || !accessChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show coming soon page if maintenance mode is active and user doesn't have access
  if (maintenanceStatus?.maintenanceMode && !hasAccess) {
    return <ComingSoonPage />;
  }

  // Show the main application
  return <>{children}</>;
};

export default MaintenanceGate;

