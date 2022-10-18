import express, { Application } from 'express';
import { items } from '../routes/items';
import { errorMiddleware } from '../middleware/error';

export const routes = (app: Application) => {
  app.use(express.json()); // middleware for parsing application/json
  app.use('/api/items', items);
  app.use(errorMiddleware);
};
