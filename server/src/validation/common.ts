import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const zLimitOffset = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const zId = z.object({ 
  id: z.string().min(1) 
});

export async export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: "Bad Request", 
        details: result.error.flatten()
      });
    }
    req.query = result.data as any;
    next();
  };
}

export async export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Bad Request", 
        details: result.error.flatten()
      });
    }
    req.params = result.data as any;
    next();
  };
}
