import express, { Application } from 'express';
import { items } from '../routes/items';
import { tags } from '../routes/tags';
import { errorMiddleware } from '../middleware/error';
import { morganMiddleware } from '../middleware/morgan';

export const routes = (app: Application) => {
  app.use(express.json()); // middleware for parsing application/json
  app.use(morganMiddleware); // middleware for logging HTTP requests
  app.use('/api/v1/items', items);
  app.use('/api/v1/tags', tags);
  app.use(errorMiddleware);
};
