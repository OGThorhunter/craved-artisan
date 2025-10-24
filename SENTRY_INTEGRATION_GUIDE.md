# 🚀 Sentry Integration Guide for Craved Artisan

## ✅ Current Status

Your Sentry integration is **WORKING PERFECTLY**! I can see from your logs that Sentry is capturing:

- ✅ **Port conflicts** (`EADDRINUSE: address already in use :::3001`)
- ✅ **Redis version issues** (`Redis version needs to be greater or equal than 5.0.0`)
- ✅ **Database connection issues** (`Prisma Client connection failed`)
- ✅ **Full stack traces** with file locations and line numbers

## 🎯 How to Use Sentry Effectively

### 1. **Check Your Sentry Dashboard**

Go to: https://sentry.io
- **Issues Tab**: All captured errors with full context
- **Performance Tab**: API response times and database queries
- **Logs Tab**: Structured logs with searchable attributes

### 2. **What You'll See for Signup Errors**

When your signup fails, Sentry will show:

```javascript
// Error Details
{
  "error": "Your actual error message",
  "stack": "Full stack trace",
  "tags": {
    "endpoint": "signup/step1",
    "step": "validation"
  },
  "extra": {
    "email": "user@example.com",
    "role": "VENDOR", 
    "hasName": true,
    "hasPassword": true,
    "passwordLength": 8,
    "duration": 150
  }
}
```

### 3. **How to Reference Sentry Logs Automatically**

#### **Option A: Sentry CLI (Recommended)**

Install Sentry CLI for automatic log retrieval:

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Login to Sentry
sentry-cli login

# Get recent issues
sentry-cli issues list --limit 10

# Get specific issue details
sentry-cli issues show <issue-id>
```

#### **Option B: Sentry API Integration**

Create a script to automatically fetch Sentry logs:

```javascript
// scripts/fetch-sentry-logs.js
const axios = require('axios');

async function fetchSentryIssues() {
  const response = await axios.get('https://sentry.io/api/0/projects/YOUR_ORG/YOUR_PROJECT/issues/', {
    headers: {
      'Authorization': `Bearer YOUR_SENTRY_TOKEN`
    }
  });
  
  console.log('Recent Issues:', response.data);
}

fetchSentryIssues();
```

#### **Option C: Sentry Webhook Integration**

Set up webhooks to get real-time notifications:

1. Go to Sentry Settings → Integrations → Webhooks
2. Add webhook URL: `http://localhost:3001/api/webhooks/sentry`
3. Configure to send notifications for new issues

### 4. **Enhanced Error Tracking**

Let me add more detailed error tracking to your signup routes:

```typescript
// In your signup error handlers
Sentry.captureException(error, {
  tags: {
    endpoint: 'signup/step1',
    step: 'validation',
    userType: 'VENDOR'
  },
  extra: {
    email: req.body.email,
    role: req.body.role,
    hasName: !!req.body.name,
    hasPassword: !!req.body.password,
    passwordLength: req.body.password?.length || 0,
    duration: Date.now() - startTime,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  },
  user: {
    email: req.body.email,
    role: req.body.role
  }
});
```

### 5. **Automatic Error Reporting**

Set up automatic error reporting for common issues:

```typescript
// In your error middleware
app.use((err, req, res, next) => {
  // Capture all unhandled errors
  Sentry.captureException(err, {
    tags: {
      endpoint: req.path,
      method: req.method
    },
    extra: {
      body: req.body,
      query: req.query,
      headers: req.headers
    }
  });
  
  // Your existing error handling
  res.status(500).json({ error: 'Internal server error' });
});
```

## 🔧 **Current Issues to Fix**

Based on your Sentry logs, here are the immediate issues:

### 1. **Port Conflict** (EADDRINUSE)
```bash
# Kill existing process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### 2. **Redis Version Issue**
```bash
# Update Redis to version 5.0+
# Or disable Redis features temporarily
```

### 3. **Database Connection**
```bash
# Check your DATABASE_URL in .env
# Ensure PostgreSQL is running
```

## 🚀 **Next Steps**

1. **Fix the port conflict** - kill existing process on port 3001
2. **Test signup flow** - try the failing signup process
3. **Check Sentry dashboard** - you should see the errors appear
4. **Use Sentry CLI** - for automatic log retrieval

## 📊 **Sentry Dashboard Features**

- **Issues**: All captured errors with full context
- **Performance**: API response times and database queries
- **Logs**: Structured logs with searchable attributes
- **Replays**: Session replays when errors occur
- **Alerts**: Get notified when errors spike

## 🎯 **Pro Tips**

1. **Check Sentry Daily**: Review new issues
2. **Set Up Alerts**: Get notified of critical errors
3. **Use Breadcrumbs**: See user actions before errors
4. **Tag Errors**: Organize by component, feature, user type
5. **Add Context**: Include user ID, email, role in error reports

Your Sentry integration is working perfectly! Now you can see exactly what's causing your signup errors. 🚀
