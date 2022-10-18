import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Here we should also log the error
  res.status(500).send('Unexpected server error');
};
