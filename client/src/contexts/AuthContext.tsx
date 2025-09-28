import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

// Types
interface User {
  userId: string;
  email: string;
  role: 'VENDOR' | 'ADMIN' | 'CUSTOMER' | 'COORDINATOR' | 'EVENT_COORDINATOR';
  isAuthenticated: boolean;
  lastActivity: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: 'VENDOR' | 'CUSTOMER') => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // React Query for session check
  const { data: sessionData, isLoading: queryLoading, error } = useQuery({
    queryKey: ['session'],
    queryFn: async ({ signal }) => {
      const response = await api.get('/auth/session', { signal });
      
      // Handle cancellation
      if (response.canceled) {
        return { success: false, user: null };
      }
      
      return response.data;
    },
    staleTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 0,
  });

  // Handle session data changes
  useEffect(() => {
    if (sessionData) {
      if (sessionData.success && sessionData.user?.isAuthenticated) {
        console.log('AuthContext: Session resolved', {
          userId: sessionData.user.userId,
          role: sessionData.user.role
        });
        setUser({
          userId: sessionData.user.userId,
          email: sessionData.user.email,
          role: sessionData.user.role,
          isAuthenticated: true,
          lastActivity: new Date(sessionData.user.lastActivity)
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [sessionData]);

  // Handle query loading state
  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
    }
  }, [queryLoading]);

  // Handle query error
  useEffect(() => {
    if (error) {
      console.log('AuthContext: Session check failed:', error);
      setUser(null);
      setLoading(false);
    }
  }, [error]);


  // Check if user is authenticated (legacy method for compatibility)
  const checkAuth = async () => {
    // This method is now handled by React Query
    // Keeping for backward compatibility
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.user) {
        setUser({
          userId: response.data.user.userId,
          email: response.data.user.email,
          role: response.data.user.role,
          isAuthenticated: true,
          lastActivity: new Date(response.data.user.lastActivity)
        });
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string, role: 'VENDOR' | 'CUSTOMER') => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { email, password, name, role });
      
      if (response.data.success) {
        // After successful registration, log the user in
        await login(email, password);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Determine loading state - use React Query loading if available, otherwise fallback to local state
  const isLoading = queryLoading || loading;
  const isAuthenticated = !!user && user.isAuthenticated;

  const value: AuthContextType = {
    user,
    loading: isLoading,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
