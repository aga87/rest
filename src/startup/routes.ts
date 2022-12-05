import express, { Application } from 'express';
import { auth } from '../routes/auth';
import { items } from '../routes/items';
import { tags } from '../routes/tags';
import { users } from '../routes/users';
import { security } from '../routes/security';
import { authMiddleware } from '../middleware/auth';
import { errorMiddleware } from '../middleware/error';
import { morganMiddleware } from '../middleware/morgan';

export const routes = (app: Application) => {
  app.use(express.json()); // middleware for parsing application/json
  app.use(morganMiddleware); // middleware for logging HTTP requests
  app.use('/api/v1/security', security);
  app.use('/api/v1/users', users);
  app.use('/api/v1/auth', auth);
  app.use(authMiddleware);
  app.use('/api/v1/items', items);
  app.use('/api/v1/tags', tags);
  app.use(errorMiddleware);
};
