import helmet from 'helmet';

// CSP configuration for Vite development and production
const getCspConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Base CSP directives
  const baseDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Vite HMR
      "'unsafe-eval'",   // Required for Vite development
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Vite HMR
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https:",
    ],
    fontSrc: [
      "'self'",
      "data:",
      "https:",
    ],
    connectSrc: [
      "'self'",
      "ws://localhost:*", // Vite HMR WebSocket
      "wss://localhost:*",
      "http://localhost:*", // API calls
      "https://localhost:*",
    ],
    frameSrc: [
      "'self'",
    ],
    objectSrc: [
      "'none'",
    ],
    mediaSrc: [
      "'self'",
    ],
    manifestSrc: [
      "'self'",
    ],
    workerSrc: [
      "'self'",
      "blob:",
    ],
    childSrc: [
      "'self'",
    ],
    formAction: [
      "'self'",
    ],
    baseUri: [
      "'self'",
    ],
    upgradeInsecureRequests: [],
  };

  // Development-specific additions
  if (isDev) {
    baseDirectives.connectSrc.push(
      "ws://127.0.0.1:*",
      "wss://127.0.0.1:*",
      "http://127.0.0.1:*",
      "https://127.0.0.1:*"
    );
    
    // Allow Vite dev server
    baseDirectives.scriptSrc.push(
      "http://localhost:*",
      "https://localhost:*",
      "http://127.0.0.1:*",
      "https://127.0.0.1:*"
    );
  }

  // Production-specific additions
  if (!isDev) {
    // Remove unsafe directives in production
    baseDirectives.scriptSrc = baseDirectives.scriptSrc.filter(
      src => !src.includes('unsafe-inline') && !src.includes('unsafe-eval')
    );
    
    // Add production domains
    if (process.env.CLIENT_URL) {
      baseDirectives.connectSrc.push(process.env.CLIENT_URL);
    }
    
    // Add Stripe domains for payment processing
    baseDirectives.frameSrc.push(
      "https://js.stripe.com",
      "https://hooks.stripe.com"
    );
    
    baseDirectives.scriptSrc.push(
      "https://js.stripe.com"
    );
  }

  return baseDirectives;
};

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: getCspConfig(),
    reportOnly: false, // Set to true for testing CSP violations
  },
  crossOriginEmbedderPolicy: false, // Disable for Vite compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// Development-specific helmet configuration
export const devHelmetConfig = helmet({
  contentSecurityPolicy: {
    directives: getCspConfig(),
    reportOnly: true, // Report-only mode for development
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: false, // Disable HSTS in development
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
});

