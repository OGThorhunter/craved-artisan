import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types
export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPPLIER' | 'EVENT_COORDINATOR' | 'DROPOFF';
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
    bio?: string;
    website?: string;
  } | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export interface SignupData {
  email: string;
  password: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPPLIER' | 'EVENT_COORDINATOR' | 'DROPOFF';
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  website?: string;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'FETCH_USER_START' }
  | { type: 'FETCH_USER_SUCCESS'; payload: User }
  | { type: 'FETCH_USER_FAILURE'; payload: string };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'FETCH_USER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_USER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'FETCH_USER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Set global Axios defaults
axios.defaults.withCredentials = true;

// Create Axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized responses
      console.log('Unauthorized request, user may need to login');
    }
    return Promise.reject(error);
  }
);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [, setLocation] = useLocation();

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      dispatch({ type: 'FETCH_USER_START' });

      const response = await api.get('/auth/session');
      
      if (response.data.authenticated && response.data.user) {
        dispatch({ type: 'FETCH_USER_SUCCESS', payload: response.data.user });
      } else {
        dispatch({ type: 'FETCH_USER_FAILURE', payload: 'No active session' });
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
      dispatch({ type: 'FETCH_USER_FAILURE', payload: errorMessage });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        throw new Error('Login response missing user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await api.post('/auth/register', userData);
      
      if (response.data.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        throw new Error('Registration response missing user data');
      }
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Registration failed';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.details) {
          // Handle validation errors
          const validationErrors = error.response.data.details
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(', ');
          errorMessage = `Validation failed: ${validationErrors}`;
        } else {
          errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if the request fails
    } finally {
      dispatch({ type: 'LOGOUT' });
      setLocation('/');
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    fetchUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the API instance for use in other parts of the app
export { api }; 