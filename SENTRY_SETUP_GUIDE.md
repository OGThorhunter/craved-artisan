# Sentry Error Tracking Setup Guide

## ✅ Frontend (React) Setup - COMPLETED

### What We've Done:
1. ✅ Installed `@sentry/react` package
2. ✅ Created `client/src/lib/sentry.ts` configuration file with:
   - Error tracking
   - Performance monitoring (tracing)
   - Structured logging
   - Session replay on errors
   - Console logging integration
3. ✅ Initialized Sentry in `client/src/main.tsx`
4. ✅ Enhanced SignupPage with:
   - Detailed error tracking
   - Performance tracing (spans)
   - Structured logging
   - API call tracking
5. ✅ Added DSN to `client/.env`
6. ✅ Created comprehensive test utility

### Next Steps for You:

#### 1. Add Your Sentry DSN to Environment Variables

In your Sentry dashboard, click the **"Copy DSN"** button, then paste it into:

**`client/.env`**
```bash
VITE_SENTRY_DSN=https://YOUR_DSN_HERE@o123456.ingest.sentry.io/123456
```

#### 2. Test the Setup

Your development server should already be running on port 5173. Open your browser to:
```
http://localhost:5173
```

**Quick Test (Recommended):**
1. Open browser console (F12)
2. Type: `window.testSentry()`
3. Press Enter

This will send test data to Sentry including:
- ✅ Test error
- ✅ Test logs (info, warning, error)
- ✅ Test performance traces
- ✅ Test API call span

**Real Signup Test:**
Then test by triggering the signup error. Sentry will now capture:
- The exact error message
- Stack trace
- Structured logs (info, warning, error)
- Performance traces (how long each step took)
- User's email (for context)
- Current signup step
- Role they're signing up as
- Browser and device info
- Network request details
- API response times

#### 3. View Data in Sentry Dashboard

Go to your Sentry project dashboard at https://sentry.io and you'll see:
- **Issues** tab: All captured errors with full context
- **Performance** tab: Page load times, API calls, and custom spans
- **Logs** tab: Structured logs with searchable attributes
- **Replays** tab: Session replays when errors occur (privacy-safe)

**What You'll See from the Test:**
```
Issues:
  - "Test error from Craved Artisan - Sentry is working!"

Logs:
  - INFO: "Testing Sentry logger integration"
  - WARN: "Testing warning level logging"
  - ERROR: "Test error log"

Performance:
  - Span: "Sentry Integration Test" (parent)
    - Child Span: "Test API Call"
```

---

## 🔜 Backend (Node.js) Setup - TODO

### Steps to Complete:

#### 1. Create a Second Sentry Project

1. Go to Sentry dashboard
2. Click "Create Project"
3. Select **NODE.JS** platform
4. Name it something like "craved-artisan-backend"
5. Copy the new DSN

#### 2. Install Backend Packages

```bash
cd server
npm install --save @sentry/node @sentry/profiling-node
```

#### 3. Create Backend Sentry Configuration

**`server/src/lib/sentry.ts`**
```typescript
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not found. Error tracking disabled.');
    return;
  }

  const environment = process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';

  Sentry.init({
    dsn,
    environment,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    
    beforeSend(event, hint) {
      // Log errors in development
      if (!isProduction) {
        console.error('Sentry captured error:', hint.originalException || hint.syntheticException);
      }
      return event;
    },
  });
}

export default Sentry;
```

#### 4. Initialize in Your Express App

**`server/src/index.ts`** (at the very top, before other imports):
```typescript
// Import Sentry FIRST
import { initSentry } from './lib/sentry';
import * as Sentry from '@sentry/node';

initSentry();

// ... rest of your imports
import express from 'express';
// etc.

const app = express();

// Sentry request handler must be FIRST middleware
app.use(Sentry.requestHandler());
app.use(Sentry.tracingHandler());

// ... your other middleware and routes

// Sentry error handler must be LAST middleware (before your error handler)
app.use(Sentry.errorHandler());

// Your custom error handler
app.use((err, req, res, next) => {
  // Your error handling logic
});
```

#### 5. Add to Backend Environment Variables

**`server/.env`**
```bash
SENTRY_DSN=https://YOUR_BACKEND_DSN_HERE@o123456.ingest.sentry.io/123456
```

#### 6. Enhance Signup Error Tracking

**`server/src/routes/auth.ts`** (in your signup error handlers):
```typescript
import * as Sentry from '@sentry/node';

// In your catch blocks:
catch (error) {
  Sentry.captureException(error, {
    tags: {
      endpoint: 'signup',
      step: 'step1'
    },
    extra: {
      email: req.body.email,
      role: req.body.role,
    }
  });
  
  // Your existing error handling
}
```

---

## 🎯 What You'll See for Your Signup Issue

Once both frontend and backend are set up, when a signup fails you'll see:

### Frontend Error (React Project):
```
Error: Unexpected end of JSON input
Location: SignupPage.tsx:315
User: john@example.com
Role: VENDOR
Step: final_submission
Browser: Chrome 120
Request: POST /api/auth/signup/complete
Response: Empty (0 bytes)
```

### Backend Error (Node.js Project):
```
Error: Prisma connection timeout
Location: auth.ts:475
Endpoint: /api/auth/signup/step1
Database: Connection failed after 5000ms
Redis: Not connected
Session: Failed to create
Request Body: { email: "john@example.com", role: "VENDOR" }
```

This will tell you **exactly** what's failing instead of guessing!

---

## 🔧 Production Deployment

### Environment Variables to Add:

**Render.com / Your hosting platform:**

Frontend:
```
VITE_SENTRY_DSN=your_frontend_dsn
```

Backend:
```
SENTRY_DSN=your_backend_dsn
NODE_ENV=production
```

### Sentry Features to Enable:

1. **Release Tracking**: Track which version caused errors
2. **Source Maps**: See original code in stack traces
3. **Alerts**: Get notified when errors spike
4. **Performance Monitoring**: Track slow API calls

---

## 📊 Monitoring Best Practices

1. **Check Sentry Daily**: Review new issues
2. **Set Up Alerts**: Get notified of critical errors
3. **Use Breadcrumbs**: See user actions before errors
4. **Tag Errors**: Organize by component, feature, user type
5. **Add Context**: Include user ID, email, role in error reports

---

## 🆘 Troubleshooting

### "Sentry DSN not found" Warning
- Make sure you've added the DSN to your `.env` file
- Restart your dev server after adding environment variables

### No Errors Showing in Sentry
- Check that DSN is correct
- Verify Sentry is initialized before your app code
- Check browser console for Sentry initialization errors
- Make sure you're triggering actual errors

### Too Many Errors
- Adjust sample rates in sentry config
- Add more filters in `beforeSend`
- Use `ignoreErrors` array to filter noise

---

## ✅ Current Status

- [x] Frontend Sentry installed
- [x] Frontend configuration created
- [x] Frontend initialized in main.tsx
- [x] SignupPage error tracking added
- [x] Environment variable placeholder added
- [ ] Add DSN to client/.env (YOU NEED TO DO THIS)
- [ ] Test frontend error tracking
- [ ] Backend Sentry installation
- [ ] Backend configuration
- [ ] Backend initialization
- [ ] Add backend DSN to server/.env
- [ ] Test backend error tracking

---

## 🎉 You're Almost Done!

Just paste your DSN from Sentry into `client/.env` and restart your dev server. Then try the signup flow and watch the errors appear in your Sentry dashboard!

