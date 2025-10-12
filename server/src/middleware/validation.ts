import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Middleware to validate request data
export const validateRequest = (schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
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
























