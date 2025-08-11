# CORS Configuration Documentation

## Overview

The Craved Artisan server implements environment-specific CORS (Cross-Origin Resource Sharing) configuration with proper security settings for development, staging, and production environments.

## Environment-Specific Configuration

### Development Environment
- **Allowed Origins**: `http://localhost:5173` only
- **Credentials**: `true`
- **Cookie Settings**:
  - `sameSite`: `lax`
  - `secure`: `false`
  - `httpOnly`: `true`
  - `domain`: `undefined`

### Staging Environment
- **Allowed Origins**: `https://staging.cravedartisan.com` only
- **Credentials**: `true`
- **Cookie Settings**:
  - `sameSite`: `lax`
  - `secure`: `true`
  - `httpOnly`: `true`
  - `domain`: `.cravedartisan.com`

### Production Environment
- **Allowed Origins**: `https://cravedartisan.com` only
- **Credentials**: `true`
- **Cookie Settings**:
  - `sameSite`: `strict`
  - `secure`: `true`
  - `httpOnly`: `true`
  - `domain`: `.cravedartisan.com`

## Security Features

### Origin Validation
- **Development**: Allows requests with no origin header (for testing tools)
- **Staging/Production**: Requires valid origin header
- **Strict Origin Checking**: Only pre-approved domains are allowed

### Cookie Security
- **HttpOnly**: Prevents XSS attacks on cookies
- **Secure**: HTTPS-only in staging/production
- **SameSite**: Prevents CSRF attacks
  - Development: `lax` (allows some cross-site requests)
  - Production: `strict` (blocks all cross-site requests)

### CORS Headers
- **Access-Control-Allow-Origin**: Set dynamically based on request origin
- **Access-Control-Allow-Credentials**: `true` for session support
- **Access-Control-Allow-Methods**: `GET, POST, PUT, DELETE, OPTIONS, PATCH`
- **Access-Control-Allow-Headers**: Standard headers + custom headers
- **Access-Control-Max-Age**: 24 hours for preflight caching

## Implementation Details

### Middleware Location
- **File**: `server/src/middleware/logCors.ts`
- **Functions**:
  - `logCors`: Logs all CORS requests
  - `corsWithLogging`: Main CORS configuration
  - `getCorsConfigForSession`: Cookie settings for sessions

### Integration Points
- **Main Server**: `server/src/index.ts`
- **Mock Server**: `server/src/index-mock.ts`
- **Session Middleware**: Uses CORS cookie configuration

### Logging
- **CORS Log File**: `logs/cors.log`
- **Console Output**: Development environment
- **Request Details**: Origin, method, path, environment, user agent, IP

## Testing

### Test Script
Run the CORS configuration test:
```bash
./test-cors-config.ps1
```

### Manual Testing
Test different origins:
```bash
# Should work
curl -H "Origin: http://localhost:5173" http://localhost:3001/health

# Should be blocked
curl -H "Origin: http://localhost:3000" http://localhost:3001/health

# Preflight request
curl -X OPTIONS -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3001/health
```

## Environment Variables

### Required
- `NODE_ENV`: Set to `development`, `staging`, or `production`

### Optional
- `CLIENT_URL`: Legacy support (not used in new configuration)
- `ADDITIONAL_CORS_ORIGINS`: Legacy support (not used in new configuration)

## Migration Notes

### From Old Configuration
The new configuration replaces the previous flexible CORS setup with:
- **Strict Origin Control**: Only one origin per environment
- **Environment-Aware Settings**: Automatic configuration based on NODE_ENV
- **Enhanced Security**: Stricter cookie settings in production
- **Better Logging**: Environment context in all CORS logs

### Breaking Changes
- **Development**: Only `localhost:5173` allowed (was multiple ports)
- **Production**: Requires explicit `NODE_ENV=production`
- **Cookies**: Stricter settings in production environments

## Troubleshooting

### Common Issues

#### CORS Blocked in Development
- Verify `NODE_ENV` is set to `development`
- Check that origin is exactly `http://localhost:5173`
- Ensure server is running and accessible

#### CORS Blocked in Production
- Verify `NODE_ENV` is set to `production`
- Check that origin is exactly `https://cravedartisan.com`
- Ensure HTTPS is properly configured

#### Cookie Issues
- Check `secure` flag matches environment (HTTPS requirement)
- Verify `domain` setting for subdomain support
- Test `sameSite` behavior in target browsers

### Debug Endpoints
In development mode, access debug information:
- `/api/_debug/cors-config`: Show current CORS configuration
- `/api/_debug/session-config`: Show session configuration

## Best Practices

### Development
- Use exact origin matching (`localhost:5173`)
- Test with real browser requests
- Monitor CORS logs for debugging

### Staging
- Test production-like settings
- Verify HTTPS and cookie security
- Validate subdomain support

### Production
- Monitor CORS logs for blocked requests
- Use strict cookie settings
- Regular security audits of CORS policy
