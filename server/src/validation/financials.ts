import { z } from "zod";

export const zRange = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const zMethod = z.object({
  method: z.enum(["direct", "indirect"]).default("direct")
});

export const zAsOf = z.object({
  asOf: z.string().datetime()
});
