# Deployment Guide - Render + Neon

## Overview
This guide covers deploying the Craved Artisan application to Render with Neon PostgreSQL database.

## Prerequisites
- Render account (free tier available)
- Neon PostgreSQL database (already configured)
- GitHub repository with your code

## Backend Deployment (Render Node Service)

### 1. Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `craved-artisan`

### 2. Configure Backend Service
- **Name**: `craved-artisan-api`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (root of repo)
- **Build Command**: `cd server && npm install && npm run build`
- **Start Command**: `cd server && npm start`

### 3. Environment Variables
Add these in the Render dashboard:

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_s5e7xQdYCApy@ep-noisy-breeze-aeoidthx-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long
CLIENT_URL=https://craved-artisan-frontend.onrender.com
```

### 4. Health Check
- **Health Check Path**: `/health`
- The backend already includes a health endpoint that returns:
  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "service": "craved-artisan-server"
  }
  ```

## Frontend Deployment (Render Static Site)

### 1. Create New Static Site
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository (same repo)
4. Select the repository: `craved-artisan`

### 2. Configure Frontend Service
- **Name**: `craved-artisan-frontend`
- **Branch**: `main`
- **Root Directory**: Leave empty (root of repo)
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/dist`

### 3. Environment Variables
Add these in the Render dashboard:

```
VITE_API_URL=https://craved-artisan-api.onrender.com
```

## Database Setup (Neon)

### 1. Verify Database Connection
Your Neon database is already configured with the connection string:
```
postgresql://neondb_owner:npg_s5e7xQdYCApy@ep-noisy-breeze-aeoidthx-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Run Migrations
After deployment, the backend will automatically connect to the database. If you need to run migrations manually:

```bash
cd server
npx prisma migrate deploy
```

## Deployment Steps

### 1. Deploy Backend First
1. Create the backend web service in Render
2. Set environment variables
3. Deploy and verify health check: `https://craved-artisan-api.onrender.com/health`

### 2. Deploy Frontend
1. Create the frontend static site in Render
2. Set environment variables
3. Deploy and verify the site loads

### 3. Update URLs
After both services are deployed:
1. Update `CLIENT_URL` in backend to point to your frontend URL
2. Update `VITE_API_URL` in frontend to point to your backend URL

## Verification

### Backend Health Check
```bash
curl https://craved-artisan-api.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "craved-artisan-server"
}
```

### Frontend Load Test
Visit your frontend URL and verify:
- Homepage loads correctly
- Navigation works
- API calls to backend succeed

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all dependencies are in `package.json`
   - Ensure TypeScript compilation succeeds

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check Neon database is active
   - Ensure SSL mode is set correctly

3. **CORS Issues**
   - Verify `CLIENT_URL` matches your frontend URL exactly
   - Check backend CORS configuration

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify `SESSION_SECRET` is at least 32 characters

### Logs
- Backend logs: Available in Render dashboard under your web service
- Frontend build logs: Available in Render dashboard under your static site

## Security Notes

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Session Secret**: Use a strong, random string for `SESSION_SECRET`
3. **Database**: Keep your Neon connection string secure
4. **CORS**: Only allow your frontend domain in CORS configuration

## Cost Optimization

- Both services use Render's free tier
- Neon database has a generous free tier
- Monitor usage to stay within free limits

## Next Steps

After successful deployment:
1. Set up custom domains (optional)
2. Configure SSL certificates (automatic with Render)
3. Set up monitoring and alerts
4. Implement CI/CD pipeline
5. Add staging environment 