import { z } from "zod";

export const zRange = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  interval: z.enum(["day", "week", "month"]).default("day"),
});

export const zLimit = z.object({ 
  limit: z.coerce.number().int().min(1).max(50).default(10) 
});

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: "Bad Request", 
        details: result.error.flatten()
      });
    }
    req.query = result.data;
    next();
  };
}

export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Bad Request", 
        details: result.error.flatten()
      });
    }
    req.params = result.data;
    next();
  };
}
