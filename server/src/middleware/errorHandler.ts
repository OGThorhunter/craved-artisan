import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  winston.error(err.message, err.stack);
  
  // Check if headers have already been sent
  if (!res.headersSent) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}; 