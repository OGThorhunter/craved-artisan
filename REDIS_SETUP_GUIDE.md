# Redis Setup Guide for Craved Artisan

This guide will help you set up Redis for your Craved Artisan application using **Upstash** (free tier) or other Redis providers.

---

## 🚀 Quick Start with Upstash (Recommended - Free Tier)

### Step 1: Create Upstash Account

1. Go to [https://upstash.com/](https://upstash.com/)
2. Sign up for a free account (no credit card required)
3. Verify your email

### Step 2: Create Redis Database

1. Click **"Create Database"**
2. Configure:
   - **Name**: `craved-artisan-redis`
   - **Type**: `Regional` (faster, recommended)
   - **Region**: Choose closest to your Render deployment (e.g., `us-east-1`)
   - **TLS**: `Enabled` (recommended)
3. Click **"Create"**

### Step 3: Get Connection URL

1. Click on your database name
2. Copy the **"UPSTASH_REDIS_REST_URL"** or **"Redis Connect URL"**
3. It will look like: `rediss://default:xxxxx@us1-xxxxx.upstash.io:6379`

### Step 4: Add to Environment Variables

#### Local Development (.env)
```bash
# Add to server/.env
REDIS_URL=rediss://default:YOUR_PASSWORD@us1-xxxxx.upstash.io:6379
```

#### Render Production
1. Go to your Render dashboard
2. Select your **API service** (craved-artisan-api)
3. Go to **"Environment"** tab
4. Add new environment variable:
   - **Key**: `REDIS_URL`
   - **Value**: `rediss://default:YOUR_PASSWORD@us1-xxxxx.upstash.io:6379`
5. Click **"Save Changes"**
6. Your service will automatically redeploy

---

## 📊 Upstash Free Tier Limits

The free tier is generous for development and small-scale production:

- ✅ **10,000 commands/day** (resets daily)
- ✅ **256 MB storage**
- ✅ **Up to 100 concurrent connections**
- ✅ **TLS/SSL encryption**
- ✅ **Global replication available**

**This is enough for:**
- ~100-200 vendors with moderate activity
- Session storage for ~500 concurrent users
- Analytics caching with 5-minute TTL

**Upgrade when:**
- You exceed 10K commands/day consistently
- You need more than 256 MB storage
- You have 200+ active vendors

---

## 🔧 Alternative: Redis Labs

If you prefer Redis Labs:

1. Go to [https://redis.com/try-free/](https://redis.com/try-free/)
2. Create free account
3. Create database (30 MB free)
4. Copy connection URL
5. Add to environment variables (same as Upstash)

---

## 🔧 Alternative: Render Redis (Paid)

If you want Redis on the same platform:

1. In Render dashboard, click **"New +"** → **"Redis"**
2. Configure:
   - **Name**: `craved-artisan-redis`
   - **Plan**: Starter ($10/month) or Free (256 MB)
   - **Region**: Same as your API service
3. Once created, copy **Internal Redis URL**
4. Add to API service environment variables

---

## ✅ Verify Redis Connection

### Check Server Logs

After deploying with `REDIS_URL`, check your server logs in Render:

Look for:
```
✅ Redis client connected successfully
✅ Redis client ready to accept commands
✅ CacheService initialized with Redis client
✅ Using Redis session store
```

If you see warnings:
```
⚠️  No REDIS_URL configured. Using in-memory cache
⚠️  Using mock Redis client - sessions will not persist
```

This means Redis URL is not properly configured.

### Test Endpoint

Once deployed, test the cache by calling your analytics endpoint twice:

```bash
# First call - should hit database (slower)
curl https://your-api.onrender.com/api/vendor/analytics/snapshot?dateFrom=2025-01-01&dateTo=2025-01-31

# Second call - should hit cache (faster)
curl https://your-api.onrender.com/api/vendor/analytics/snapshot?dateFrom=2025-01-01&dateTo=2025-01-31
```

Check logs for:
```
⚡ Serving business snapshot from cache
```

---

## 🔍 Monitoring Redis Usage

### Upstash Dashboard

1. Go to your Upstash database
2. Click **"Metrics"** tab
3. Monitor:
   - **Commands/day**: Should stay under 10K on free tier
   - **Memory usage**: Should stay under 256 MB
   - **Latency**: Should be < 50ms

### Redis CLI (Optional)

Connect to your Redis instance to inspect data:

```bash
# Install Redis CLI
brew install redis  # macOS
apt-get install redis-tools  # Linux

# Connect
redis-cli -u "rediss://default:YOUR_PASSWORD@us1-xxxxx.upstash.io:6379"

# Commands
> KEYS *  # List all keys
> DBSIZE  # Total keys
> INFO memory  # Memory usage
> TTL sess:xxxxx  # Check session TTL
> GET analytics:vendor123:snapshot:...  # Get cached data
```

---

## 🎯 What Redis Stores in Your App

### 1. Sessions (sess:*)
```
sess:abc123def456...  # User login sessions
TTL: 24 hours
```

### 2. Analytics Cache (analytics:*)
```
analytics:{vendorId}:snapshot:dateFrom:2025-01-01:dateTo:2025-01-31
TTL: 5 minutes (300 seconds)
```

### 3. Tag Sets (tag:*)
```
tag:vendor:{vendorId}  # Set of keys for vendor
tag:analytics  # Set of keys for analytics
tag:products  # Set of keys for products
```

---

## 🚨 Troubleshooting

### Error: "Connection timeout"

**Cause**: Firewall blocking Redis connection or wrong URL

**Fix**:
1. Check Redis URL is correct
2. Ensure TLS is enabled (`rediss://` not `redis://`)
3. Check Upstash/Redis Labs dashboard for connection issues

### Error: "Too many connections"

**Cause**: Connection pool exhaustion

**Fix**:
1. Reduce `maxRetriesPerRequest` in `redis.ts`
2. Upgrade Redis plan for more connections
3. Check for connection leaks in your code

### Sessions not persisting

**Cause**: Redis not connected or memory store fallback

**Fix**:
1. Check `REDIS_URL` is set correctly
2. Check server logs for Redis connection errors
3. Verify Redis service is running (Upstash dashboard)

### Cache not invalidating

**Cause**: Cache invalidation middleware not applied

**Fix**:
1. Check routes have `invalidateProductCache` middleware
2. Check Winston logs for cache invalidation messages
3. Manually clear cache: `curl -X DELETE https://your-api.onrender.com/api/cache/clear`

---

## 📈 Scaling Redis

### Free Tier → Paid Tier ($10-20/month)

**When to upgrade:**
- Exceeding 10K commands/day
- Need more than 256 MB storage
- Want better performance/uptime SLA

**Upstash Pro Benefits:**
- 1M commands/day
- 1 GB storage
- Higher throughput
- Better SLA

### Single Instance → Redis Cluster

**When to upgrade (200+ vendors):**
- High availability required (99.99% uptime)
- Need horizontal scaling
- Multi-region deployment

**Options:**
- Upstash Global (multi-region)
- AWS ElastiCache Cluster
- Redis Enterprise

---

## 🔐 Security Best Practices

1. **Always use TLS/SSL** (`rediss://` not `redis://`)
2. **Keep credentials secret** - never commit to git
3. **Rotate passwords** regularly
4. **Use strong passwords** (Upstash generates these)
5. **Restrict access** by IP if possible
6. **Monitor access logs** in Upstash dashboard

---

## 🎉 You're Done!

Your application now has:
- ✅ Redis-backed sessions (no random logouts!)
- ✅ Analytics caching (10x faster dashboards)
- ✅ Cache invalidation (data stays fresh)
- ✅ Winston logging for monitoring

**Next Steps:**
1. Monitor Redis usage in Upstash dashboard
2. Check Winston logs for cache hit rates [[memory:3752752]]
3. Adjust cache TTL based on your needs
4. Scale up when you hit free tier limits

---

## 📚 Resources

- [Upstash Documentation](https://docs.upstash.com/redis)
- [Redis Commands Reference](https://redis.io/commands/)
- [Node Redis (ioredis) Guide](https://github.com/luin/ioredis)
- [Render Environment Variables](https://render.com/docs/environment-variables)

