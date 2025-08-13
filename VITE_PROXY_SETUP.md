# Vite Proxy Setup for Development

## Overview

This project now uses Vite's built-in proxy feature to eliminate CORS issues during development while maintaining tight CORS policies for production environments.

## Configuration

### Vite Proxy Configuration (`client/vite.config.ts`)

```typescript
server: {
  port: 5173,
  strictPort: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      ws: true,
    },
    '/auth': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    },
    '/health': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

### Environment Configuration (`client/.env`)

```env
VITE_API_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### CORS Configuration (`server/src/middleware/logCors.ts`)

The server now has environment-specific CORS policies:

- **Development**: Allows localhost origins only
- **Staging**: Allows only `https://staging.cravedartisan.com`
- **Production**: Allows only `https://cravedartisan.com`

## How It Works

### Development Mode
1. **Frontend** runs on `http://localhost:5173`
2. **Backend** runs on `http://localhost:3001`
3. **Vite Proxy** forwards all `/api/*`, `/auth/*`, and `/health` requests from the frontend to the backend
4. **No CORS issues** because requests appear to come from the same origin

### Production Mode
1. **Frontend** and **Backend** are served from the same domain
2. **Tight CORS policies** prevent unauthorized cross-origin requests
3. **Secure cookies** and **HTTPS** are enforced

## Benefits

### Development
- ✅ **No CORS headaches** - All requests go through the proxy
- ✅ **Simplified debugging** - Single origin for all requests
- ✅ **Hot reload** - Changes reflect immediately
- ✅ **Consistent behavior** - Same as production but without CORS complexity

### Production
- ✅ **Security** - Tight CORS policies prevent unauthorized access
- ✅ **Performance** - No proxy overhead
- ✅ **Compliance** - Proper security headers and policies

## API Calls

### Frontend Code
The frontend uses environment variables for API URLs:

```typescript
// services/analytics.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// contexts/AuthContext.tsx
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### Development
- `VITE_API_URL=/api` → Requests go to `http://localhost:5173/api/*`
- Vite proxy forwards to `http://localhost:3001/api/*`

### Production
- `VITE_API_URL=https://api.cravedartisan.com/api` → Direct API calls
- CORS policies ensure only authorized origins can access

## Testing the Setup

### Verify Proxy is Working
```bash
# Test health endpoint through proxy
curl http://localhost:5173/health

# Test API endpoint through proxy
curl http://localhost:5173/api/auth/session
```

### Expected Results
- ✅ Status 200 responses
- ✅ No CORS errors in browser console
- ✅ All functionality working normally

## Troubleshooting

### If Proxy Isn't Working
1. **Check Vite config** - Ensure proxy configuration is correct
2. **Restart services** - Kill and restart both client and server
3. **Check ports** - Ensure no port conflicts
4. **Clear browser cache** - Hard refresh the page

### If CORS Errors Persist
1. **Check environment** - Ensure `NODE_ENV=development`
2. **Verify origins** - Check CORS allowed origins in server logs
3. **Check proxy** - Ensure requests are going through proxy, not direct

## Migration Notes

### Before (Direct API Calls)
- Frontend made direct calls to `http://localhost:3001/api/*`
- CORS configuration needed to allow `http://localhost:5173`
- IPv6 issues with `http://[::1]:5173`

### After (Proxy)
- Frontend makes calls to `/api/*` (relative URLs)
- Vite proxy handles forwarding to backend
- No CORS issues in development
- Cleaner, more secure production setup
