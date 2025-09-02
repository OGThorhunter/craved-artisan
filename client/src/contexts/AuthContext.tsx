import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

// Types
interface User {
  userId: string;
  email: string;
  role: 'VENDOR' | 'ADMIN' | 'CUSTOMER';
  isAuthenticated: boolean;
  lastActivity: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/session');
      
      if (response.data.success && response.data.user) {
        setUser({
          userId: response.data.user.userId,
          email: response.data.user.email,
          role: response.data.user.role,
          isAuthenticated: true,
          lastActivity: new Date(response.data.user.lastActivity)
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('No active session found');
      setUser(null);
    } finally {
      setLoading(false);
    }
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth,
    isAuthenticated: !!user?.isAuthenticated
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
