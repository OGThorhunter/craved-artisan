import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = (err.status as number) || 500;
  const payload = {
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "Unexpected server error",
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  };
  
  console.error("[API ERROR]", payload, { original: err });
  res.status(status).json(payload);
};
