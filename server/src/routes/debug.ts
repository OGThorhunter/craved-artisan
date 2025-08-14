import { Router, Request, Response } from 'express';

const router = Router();

// Debug endpoint to echo cookies (dev only)
router.get('/cookies', (req: Request, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(400).json({ error: 'Debug endpoints not available in production' });
  }

  const cookies = req.cookies || {};
  const signedCookies = req.signedCookies || {};
  const sessionCookie = req.sessionID;

  return res.json({
    timestamp: new Date().toISOString(),
    cookies,
    signedCookies,
    sessionId: sessionCookie,
    sessionData: req.session,
    cookieHeader: req.headers.cookie,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });
});

// Debug endpoint to echo request/response headers (dev only)
router.get('/headers', (req: Request, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(400).json({ error: 'Debug endpoints not available in production' });
  }

  // Capture response headers after they're set
  const originalSend = res.send;
  const responseHeaders: Record<string, string> = {};

  res.send = function(body: any) {
    // Capture headers that have been set
    const headers = res.getHeaders();
    Object.keys(headers).forEach(key => {
      responseHeaders[key] = headers[key] as string;
    });
    
    return originalSend.call(this, body);
  };

  const requestHeaders = {
    ...req.headers,
    // Remove sensitive headers
    authorization: req.headers.authorization ? '[REDACTED]' : undefined,
    cookie: req.headers.cookie ? '[REDACTED]' : undefined
  };

  return res.json({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    requestHeaders,
    responseHeaders,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    origin: req.get('Origin'),
    referer: req.get('Referer')
  });
});

// Debug endpoint to show CORS configuration (dev only)
router.get('/cors-config', (req: Request, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(400).json({ error: 'Debug endpoints not available in production' });
  }

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL
  ].filter(Boolean);

  return res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    allowedOrigins,
    clientUrl: process.env.CLIENT_URL,
    additionalCorsOrigins: process.env.ADDITIONAL_CORS_ORIGINS,
    currentOrigin: req.get('Origin'),
    isAllowed: !req.get('Origin') || allowedOrigins.includes(req.get('Origin') || '')
  });
});

// Debug endpoint to show session configuration (dev only)
router.get('/session-config', (req: Request, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(400).json({ error: 'Debug endpoints not available in production' });
  }

  return res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    sessionId: req.sessionID,
    sessionData: req.session,
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieHttpOnly: true,
    cookieSameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    sessionSecret: process.env.SESSION_SECRET ? '[SET]' : '[NOT SET]'
  });
});

export default router;

