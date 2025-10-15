import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

// Types
interface User {
  id: string;
  userId: string;
  email: string;
  role: 'VENDOR' | 'ADMIN' | 'CUSTOMER' | 'COORDINATOR' | 'EVENT_COORDINATOR';
  isAuthenticated: boolean;
  lastActivity: Date;
  betaTester?: boolean;
}

interface AgreementAcceptance {
  documentId: string;
  documentType: string;
  documentVersion: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: 'VENDOR' | 'CUSTOMER', agreements?: AgreementAcceptance[]) => Promise<void>;
  checkAuth: () => Promise<void>;
  // New multi-step signup methods
  signupStep1: (email: string, password: string, name: string, role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR') => Promise<any>;
  signupProfile: (profileData: any) => Promise<any>;
  acceptAgreements: (agreements: AgreementAcceptance[]) => Promise<any>;
  checkSignupStatus: () => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
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
          id: sessionData.user.id || sessionData.user.userId,
          userId: sessionData.user.userId,
          email: sessionData.user.email,
          role: sessionData.user.role,
          isAuthenticated: true,
          lastActivity: new Date(sessionData.user.lastActivity),
          betaTester: sessionData.user.betaTester || false
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
          id: response.data.user.id || response.data.user.userId,
          userId: response.data.user.userId,
          email: response.data.user.email,
          role: response.data.user.role,
          isAuthenticated: true,
          lastActivity: new Date(response.data.user.lastActivity),
          betaTester: response.data.user.betaTester || false
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

  // Register function (legacy - for backward compatibility)
  const register = async (email: string, password: string, name: string, role: 'VENDOR' | 'CUSTOMER', agreements?: AgreementAcceptance[]) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        name, 
        role,
        agreements: agreements || []
      });
      
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

  // New multi-step signup methods
  const signupStep1 = async (email: string, password: string, name: string, role: 'VENDOR' | 'CUSTOMER' | 'EVENT_COORDINATOR') => {
    try {
      setLoading(true);
      const response = await api.post('/auth/signup/step1', {
        email,
        password,
        name,
        role
      });
      
      if (response.data.success) {
        // Update user state with the partial user data
        setUser({
          id: response.data.user.id || response.data.user.userId,
          userId: response.data.user.userId,
          email: response.data.user.email,
          role: response.data.user.role,
          isAuthenticated: true,
          lastActivity: new Date(),
          betaTester: response.data.user.betaTester || false
        });
        return response.data;
      } else {
        throw new Error(response.data.message || 'Account creation failed');
      }
    } catch (error: any) {
      console.error('Signup step 1 error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  const signupProfile = async (profileData: any) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/signup/profile', profileData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Profile setup failed');
      }
    } catch (error: any) {
      console.error('Signup profile error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Profile setup failed');
    } finally {
      setLoading(false);
    }
  };

  const acceptAgreements = async (agreements: AgreementAcceptance[]) => {
    try {
      setLoading(true);
      const response = await api.post('/legal/agreements', { agreements });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Agreement acceptance failed');
      }
    } catch (error: any) {
      console.error('Accept agreements error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Agreement acceptance failed');
    } finally {
      setLoading(false);
    }
  };

  const checkSignupStatus = async () => {
    try {
      const response = await api.get('/auth/signup-status');
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Status check failed');
      }
    } catch (error: any) {
      console.error('Signup status check error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Status check failed');
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/verify-email', { token });
      
      if (response.data.success) {
        // If user is already authenticated, we can update their email verification status
        if (user) {
          setUser(prev => prev ? { ...prev } : null);
        }
        return response.data;
      } else {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Email verification failed');
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
    checkAuth,
    // New multi-step signup methods
    signupStep1,
    signupProfile,
    acceptAgreements,
    checkSignupStatus,
    verifyEmail
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
