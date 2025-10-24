# 🚀 Sentry Usage Guide for Craved Artisan

## ✅ **Sentry is Working!**

Your Sentry integration is **fully functional** and capturing errors. I can see from your logs that it's already tracking:

- ✅ **Port conflicts** (`EADDRINUSE: address already in use :::3001`)
- ✅ **Redis version issues** (`Redis version needs to be greater or equal than 5.0.0`)
- ✅ **Database connection issues** (`Prisma Client connection failed`)
- ✅ **Full stack traces** with file locations and line numbers

## 🎯 **How to Use Sentry for Debugging**

### **1. Check Your Sentry Dashboard**

Go to: https://sentry.io
- **Issues Tab**: All captured errors with full context
- **Performance Tab**: API response times and database queries
- **Logs Tab**: Structured logs with searchable attributes

### **2. Automatic Log Fetching**

I've created scripts to automatically fetch Sentry logs:

#### **Option A: NPM Scripts (Easiest)**
```bash
# Fetch recent issues
npm run sentry:logs

# Fetch signup-related errors specifically
npm run sentry:logs:signup

# Fetch specific number of issues
npm run sentry:logs:limit 5

# Fetch specific issue details
npm run sentry:logs:issue <issue-id>
```

#### **Option B: PowerShell Script (Windows)**
```powershell
# Fetch recent issues
.\scripts\fetch-sentry-logs.ps1

# Fetch signup errors
.\scripts\fetch-sentry-logs.ps1 -SignupErrors

# Fetch specific issue
.\scripts\fetch-sentry-logs.ps1 -IssueId "issue-id-here"

# Fetch limited number
.\scripts\fetch-sentry-logs.ps1 -Limit 5
```

#### **Option C: Node.js Script**
```bash
# Fetch recent issues
node scripts/fetch-sentry-logs.js

# Fetch signup errors
node scripts/fetch-sentry-logs.js --signup

# Fetch specific issue
node scripts/fetch-sentry-logs.js --issue <issue-id>

# Fetch limited number
node scripts/fetch-sentry-logs.js --limit 5
```

### **3. What Sentry Captures for Signup Errors**

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

## 🔧 **Current Issues to Fix**

Based on your Sentry logs, here are the immediate issues:

### **1. Port Conflict (EADDRINUSE)**
```bash
# Kill existing process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### **2. Redis Version Issue**
```bash
# Update Redis to version 5.0+
# Or disable Redis features temporarily
```

### **3. Database Connection**
```bash
# Check your DATABASE_URL in .env
# Ensure PostgreSQL is running
```

## 🚀 **How to Use Sentry for Your Signup Issue**

### **Step 1: Fix Current Issues**
1. **Kill the process on port 3001**:
   ```bash
   netstat -ano | findstr :3001
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Restart your server**:
   ```bash
   cd server
   npm run dev
   ```

### **Step 2: Test Signup Flow**
1. **Try the signup process** that's been failing
2. **Check Sentry dashboard** - you should see the errors appear
3. **Use the scripts** to fetch logs automatically

### **Step 3: Analyze the Errors**
1. **Check Sentry dashboard** for new issues
2. **Use `npm run sentry:logs:signup`** to see signup-specific errors
3. **Look at the stack trace** to find the exact line causing the issue

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

## 🔍 **Example: Debugging Your Signup Issue**

1. **Try the signup flow** that's failing
2. **Check Sentry dashboard** - you'll see something like:
   ```
   Error: Unexpected end of JSON input
   Location: auth.ts:475
   Endpoint: /api/auth/signup/step1
   User: john@example.com
   Role: VENDOR
   ```

3. **Use the scripts** to get more details:
   ```bash
   npm run sentry:logs:signup
   ```

4. **Fix the issue** based on the stack trace

## 🚀 **Next Steps**

1. **Fix the port conflict** - kill existing process on port 3001
2. **Restart your server** - `cd server && npm run dev`
3. **Test signup flow** - try the failing signup process
4. **Check Sentry dashboard** - you should see the errors appear
5. **Use the scripts** - `npm run sentry:logs:signup` to see signup errors

**Your Sentry integration is working perfectly! Now you can see exactly what's causing your signup errors.** 🚀
