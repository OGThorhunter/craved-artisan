import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        role: string;
        vendorProfileId: string;
        isAuthenticated: boolean;
        lastActivity: Date;
        betaTester?: boolean;
      };
    }
  }
}

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAuthenticated) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  return next();
};

// Middleware to require vendor authentication
export const requireVendorAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAuthenticated) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'VENDOR') {
    return res.status(403).json({ 
      success: false, 
      message: 'Vendor access required' 
    });
  }

  // For now, set a mock vendorProfileId
  // In a real implementation, this would come from the database
  req.user.vendorProfileId = req.user.userId; // Using userId as vendorProfileId for mock
  
  return next();
};

// Middleware to require admin authentication
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAuthenticated) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  
  return next();
};

// Middleware to require specific role
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    
    return next();
  };
};

// Middleware to validate request data
export const validateRequest = (schema: any, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validation = schema.safeParse(data);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.errors
        });
      }
      
      // Replace the original data with validated data
      if (source === 'body') {
        req.body = validation.data;
      } else if (source === 'query') {
        req.query = validation.data;
      } else {
        req.params = validation.data;
      }
      
      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
};
