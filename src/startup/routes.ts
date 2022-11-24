import express, { Application } from 'express';
import { items } from '../routes/items';
import { tags } from '../routes/tags';
import { users } from '../routes/users';
import { security } from '../routes/security';
import { errorMiddleware } from '../middleware/error';
import { morganMiddleware } from '../middleware/morgan';

export const routes = (app: Application) => {
  app.use(express.json()); // middleware for parsing application/json
  app.use(morganMiddleware); // middleware for logging HTTP requests
  app.use('/api/v1/items', items);
  app.use('/api/v1/tags', tags);
  app.use('/api/v1/users', users);
  app.use('/api/v1/security', security);
  app.use(errorMiddleware);
};
