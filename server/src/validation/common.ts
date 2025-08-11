import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Common validation schemas
export const zLimitOffset = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export const zId = z.object({
  id: z.string().min(1)
});

// Middleware helper for request validation
export function validate<T extends z.ZodSchema>(
  schema: T,
  pick: 'params' | 'query' | 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = pick === 'params' ? req.params : pick === 'query' ? req.query : req.body;
      const validated = schema.parse(data);
      
      // Attach validated data to request for controllers to use
      (req as any).validated = validated;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Unexpected error
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Request validation failed'
      });
    }
  };
}

// Type helper for extracting validated data type
export type ValidatedData<T extends z.ZodSchema> = z.infer<T>;
