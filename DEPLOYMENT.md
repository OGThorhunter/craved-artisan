# Deployment Guide - Render

This guide will help you deploy the Craved Artisan application to Render.

## Prerequisites

- Render account (free tier available)
- Neon PostgreSQL database (already configured)
- GitHub repository with your code

## 1. Backend Deployment (Node.js Web Service)

### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `craved-artisan-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`

### Step 2: Environment Variables
Add these environment variables in the Render dashboard:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_s5e7xQdYCApy@ep-noisy-breeze-aeoidthx-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://neondb_owner:npg_s5e7xQdYCApy@ep-noisy-breeze-aeoidthx-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=your-super-secret-session-key-here-minimum-32-chars
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-url.onrender.com
```

### Step 3: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Note the service URL (e.g., `https://craved-artisan-api.onrender.com`)

## 2. Frontend Deployment (Static Site)

### Step 1: Create New Static Site
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `craved-artisan-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

### Step 2: Environment Variables
Add this environment variable:

```bash
VITE_API_URL=https://craved-artisan-api.onrender.com
```

### Step 3: Deploy
1. Click "Create Static Site"
2. Wait for the build to complete
3. Your site will be available at the provided URL

## 3. Database Setup

### Prisma Migration
The database is already set up with Neon. If you need to run migrations:

```bash
# In the server directory
npx prisma migrate deploy
```

## 4. Health Check

Test your deployment:

```bash
# Backend health check
curl https://craved-artisan-api.onrender.com/health

# Frontend
# Visit your static site URL
```

## 5. Custom Domain (Optional)

1. In your Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain and configure DNS

## 6. Environment Variables Reference

### Backend (.env)
```bash
# Database
DATABASE_URL=your-neon-connection-string
DIRECT_URL=your-neon-connection-string

# Server
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-here-minimum-32-chars

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Client
CLIENT_URL=https://your-frontend-url.onrender.com
```

### Frontend (.env)
```bash
VITE_API_URL=https://craved-artisan-api.onrender.com
```

## 7. Troubleshooting

### Build Issues
- Check the build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript compilation passes locally

### Environment Variables
- Double-check all required variables are set
- Ensure DATABASE_URL is correct
- Verify JWT_SECRET and SESSION_SECRET are strong

### Database Connection
- Test database connection locally first
- Ensure Neon database is active
- Check firewall settings if applicable

## 8. Monitoring

- Use Render's built-in logs for debugging
- Set up health checks for your API
- Monitor database performance in Neon dashboard

## 9. Scaling

- Upgrade to paid plans for better performance
- Add Redis for caching (optional)
- Consider CDN for static assets

## 10. Security

- Use strong secrets for JWT and sessions
- Enable HTTPS (automatic on Render)
- Regularly update dependencies
- Monitor for security vulnerabilities

---

**Note**: The free tier of Render has limitations:
- Services may sleep after inactivity
- Limited bandwidth and build minutes
- No custom domains on free tier

For production use, consider upgrading to a paid plan. 