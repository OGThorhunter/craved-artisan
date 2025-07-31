import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  winston.error(err.message, err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
}; 