import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  requestId: string;
  traceId?: string;
  actor: {
    id?: string;
    ip?: string;
    ua?: string;
    roles?: string[];
  };
}

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}

/**
 * Middleware to attach request context for audit logging
 * Captures requestId, traceId, and actor metadata
 */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  // Generate or capture requestId
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  // Capture traceId if present (for distributed tracing)
  const traceId = req.headers['x-trace-id'] as string;
  
  // Extract actor metadata
  const actor = {
    id: req.user?.userId,
    ip: req.ip || req.connection.remoteAddress,
    ua: req.get('User-Agent'),
    roles: req.user?.role ? [req.user.role] : [],
  };
  
  // Attach context to request
  req.context = {
    requestId,
    traceId,
    actor,
  };
  
  // Set response header for tracing
  res.setHeader('X-Request-Id', requestId);
  if (traceId) {
    res.setHeader('X-Trace-Id', traceId);
  }
  
  next();
}

