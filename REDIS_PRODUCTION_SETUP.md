# Redis Production Setup

## Overview

The application uses Redis for session storage and caching in production. Currently, the application is running with memory store (not suitable for production) because Redis is not configured.

## Required Environment Variable

Add this environment variable in your Render dashboard:

### `REDIS_URL`

**Value:** Your Redis connection string

**Examples:**
- **Render Redis (Recommended):** `redis://red-xxxxxxxxx:6379`
- **External Redis:** `redis://username:password@host:port`
- **Redis with SSL:** `rediss://username:password@host:port`

## How to Add in Render

1. Go to your Render dashboard
2. Navigate to your backend service (`craved-artisan-api`)
3. Click on "Environment" tab
4. Add new environment variable:
   - **Key:** `REDIS_URL`
   - **Value:** Your Redis connection string
5. Save changes
6. Redeploy the service

## Recommended: Use Render Redis

For best performance and reliability, use Render's managed Redis service:

1. Create a new Redis service in Render
2. Copy the connection string from the Redis service
3. Add it as `REDIS_URL` environment variable to your backend service

## Expected Results

After adding `REDIS_URL`:

✅ **Sessions will persist across restarts**  
✅ **No more memory store warnings**  
✅ **Better performance and scalability**  
✅ **Proper session management for production**

## Current Status

❌ **Redis not configured** - Using memory store (sessions lost on restart)  
⚠️ **Warning in logs:** `Redis not available - using memory store`

## Application Code

The application already has Redis support built-in:
- `server/src/config/redis.ts` - Redis client configuration
- `server/src/middleware/session-redis.ts` - Session store with Redis fallback

No code changes needed - just add the environment variable!
