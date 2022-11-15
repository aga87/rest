import dotenv from 'dotenv';
import express, { Application } from 'express';
import { connectToMongoDB } from './startup/db';
import { logger } from './startup/logger';
import { routes } from './startup/routes';

dotenv.config();
export const app: Application = express();

routes(app);

const { MONGO_URI_DEV, PORT, NODE_ENV } = process.env;

if (NODE_ENV === 'development') {
  connectToMongoDB(MONGO_URI_DEV as string);
}

if (NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Listening on port ${PORT}...`));
}
