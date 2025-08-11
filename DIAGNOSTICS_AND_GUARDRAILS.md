# Diagnostics & Guardrails Documentation

## Overview

This document describes the diagnostics and guardrails implemented in the Craved Artisan application to ensure security, debugging capabilities, and proper CORS handling across development and production environments.

## CORS Flow

### Development Environment

**Allowed Origins:**
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite fallback)
- `http://localhost:5175` (Vite fallback)
- `http://localhost:3000` (Alternative dev server)
- `http://127.0.0.1:*` (IPv4 localhost variants)
- Environment variable `CLIENT_URL` (if set)
- Environment variable `ADDITIONAL_CORS_ORIGINS` (comma-separated list)

**CORS Configuration:**
```javascript
{
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin', 'X-Requested-With', 'Content-Type', 'Accept',
    'Authorization', 'X-CSRF-Token', 'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
}
```

### Production Environment

**Allowed Origins:**
- Environment variable `CLIENT_URL` (required)
- Environment variable `ADDITIONAL_CORS_ORIGINS` (comma-separated list)

**Security Enhancements:**
- Stricter CSP policies
- HSTS enabled
- Secure cookies
- SameSite=strict for cookies

## Cookie Matrix

### Development Cookies
```javascript
{
  secure: false,           // HTTP allowed in dev
  httpOnly: true,          // Prevent XSS
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  sameSite: 'lax'          // Allow cross-site requests
}
```

### Production Cookies
```javascript
{
  secure: true,            // HTTPS only
  httpOnly: true,          // Prevent XSS
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  sameSite: 'strict'       // Block cross-site requests
}
```

## Debug Endpoints (Development Only)

### `/api/_debug/cookies`
Echoes request cookies and session information.

**Response:**
```json
{
  "timestamp": "2025-08-11T05:37:18.718Z",
  "cookies": {},
  "signedCookies": {},
  "sessionId": "session-id",
  "sessionData": {},
  "cookieHeader": "[REDACTED]",
  "userAgent": "Mozilla/5.0...",
  "ip": "::1"
}
```

### `/api/_debug/headers`
Echoes request and response headers.

**Response:**
```json
{
  "timestamp": "2025-08-11T05:37:18.718Z",
  "method": "GET",
  "url": "/api/_debug/headers",
  "path": "/headers",
  "requestHeaders": {
    "host": "localhost:3001",
    "user-agent": "Mozilla/5.0...",
    "accept": "application/json",
    "authorization": "[REDACTED]",
    "cookie": "[REDACTED]"
  },
  "responseHeaders": {
    "content-type": "application/json",
    "vary": "Origin"
  },
  "userAgent": "Mozilla/5.0...",
  "ip": "::1",
  "origin": "http://localhost:5173",
  "referer": "http://localhost:5173/"
}
```

### `/api/_debug/cors-config`
Shows current CORS configuration.

**Response:**
```json
{
  "timestamp": "2025-08-11T05:37:18.718Z",
  "environment": "development",
  "allowedOrigins": [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000"
  ],
  "clientUrl": "http://localhost:5173",
  "additionalCorsOrigins": null,
  "currentOrigin": "http://localhost:5173",
  "isAllowed": true
}
```

### `/api/_debug/session-config`
Shows session configuration.

**Response:**
```json
{
  "timestamp": "2025-08-11T05:37:18.718Z",
  "environment": "development",
  "sessionId": "session-id",
  "sessionData": {},
  "cookieSecure": false,
  "cookieHttpOnly": true,
  "cookieSameSite": "lax",
  "sessionSecret": "[SET]"
}
```

## Content Security Policy (CSP)

### Development CSP
```javascript
{
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",     // Vite HMR
    "'unsafe-eval'",       // Vite development
    "http://localhost:*",  // Vite dev server
    "https://localhost:*"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'"      // Vite HMR
  ],
  connectSrc: [
    "'self'",
    "ws://localhost:*",    // Vite HMR WebSocket
    "wss://localhost:*",
    "http://localhost:*",  // API calls
    "https://localhost:*"
  ],
  // ... other directives
}
```

### Production CSP
```javascript
{
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "https://js.stripe.com"  // Payment processing
  ],
  styleSrc: ["'self'"],
  connectSrc: [
    "'self'",
    "https://your-production-domain.com"
  ],
  frameSrc: [
    "'self'",
    "https://js.stripe.com",
    "https://hooks.stripe.com"
  ],
  // ... other directives
}
```

## Troubleshooting Checklist

### CORS Issues

1. **Preflight 204 Response**
   - ✅ OPTIONS requests return 204
   - ✅ Access-Control-Allow-Origin header set
   - ✅ Access-Control-Allow-Methods header set
   - ✅ Access-Control-Allow-Headers header set

2. **Credentials Issues**
   - ✅ `credentials: true` in CORS config
   - ✅ `Access-Control-Allow-Credentials: true` header
   - ✅ Frontend includes `credentials: 'include'` in fetch

3. **SameSite Cookie Issues**
   - ✅ Development: `sameSite: 'lax'`
   - ✅ Production: `sameSite: 'strict'`
   - ✅ Secure flag set in production

4. **Origin Issues**
   - ✅ Origin in allowed list
   - ✅ Vary: Origin header set
   - ✅ No wildcard origins in production

### Debugging Steps

1. **Check CORS Logs**
   ```bash
   # View CORS logs
   tail -f logs/cors.log
   ```

2. **Test Debug Endpoints**
   ```bash
   # Test cookies
   curl http://localhost:3001/api/_debug/cookies
   
   # Test headers
   curl http://localhost:3001/api/_debug/headers
   
   # Test CORS config
   curl http://localhost:3001/api/_debug/cors-config
   ```

3. **Check Browser Network Tab**
   - Look for CORS errors
   - Verify preflight requests
   - Check response headers

4. **Environment Variables**
   ```bash
   # Required for production
   CLIENT_URL=https://your-domain.com
   
   # Optional additional origins
   ADDITIONAL_CORS_ORIGINS=https://admin.your-domain.com,https://api.your-domain.com
   ```

### Common Issues & Solutions

1. **"CORS policy: No 'Access-Control-Allow-Origin' header"**
   - Check if origin is in allowed list
   - Verify CORS middleware is applied
   - Check logs for blocked origins

2. **"Credentials flag is 'true', but the 'Access-Control-Allow-Credentials' header is ''"**
   - Ensure `credentials: true` in CORS config
   - Check if origin is not wildcard

3. **"Cookie not sent with request"**
   - Verify `credentials: 'include'` in frontend
   - Check SameSite cookie setting
   - Ensure secure flag matches environment

4. **CSP Violations**
   - Check browser console for CSP errors
   - Adjust CSP directives in helmet config
   - Use report-only mode for testing

## Security Considerations

1. **Never expose debug endpoints in production**
   - Debug routes are automatically disabled in production
   - Environment check prevents accidental exposure

2. **Sensitive data redaction**
   - Authorization headers are redacted in logs
   - Cookie values are redacted in debug responses
   - Session secrets are masked

3. **CORS security**
   - No wildcard origins in production
   - Explicit origin allowlist
   - Proper Vary header for caching

4. **CSP security**
   - Report-only mode in development
   - Strict policies in production
   - Regular CSP violation monitoring

## Monitoring & Logging

### CORS Logs
- Location: `logs/cors.log`
- Format: JSON with timestamps
- Includes: Origin, method, path, allowed status

### Application Logs
- Location: `logs/combined.log`, `logs/error.log`
- Format: JSON with timestamps
- Includes: Request details, errors, performance metrics

### CSP Violations
- Monitor browser console for violations
- Consider implementing CSP violation reporting
- Adjust policies based on legitimate violations

