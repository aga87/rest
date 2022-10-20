import { ErrorRequestHandler } from 'express';
import { logger } from '../startup/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  logger.error('Unexpected server error', err);
  res.status(500).send('Unexpected server error');
};
