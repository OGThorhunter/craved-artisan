import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Singleton interceptor registration guard
let interceptorsInstalled = false;

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Ignore cancellation errors
    if (error.code === 'ERR_CANCELED') {
      return Promise.resolve({ canceled: true });
    }
    
    console.error('[API Response Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Install interceptors only once
if (!interceptorsInstalled) {
  interceptorsInstalled = true;
}

export default api;
