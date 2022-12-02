import dotenv from 'dotenv';
import express, { Application } from 'express';
import { connectToMongoDB } from './startup/db';
import { logger } from './startup/logger';
import { routes } from './startup/routes';

dotenv.config();
export const app: Application = express();

routes(app);

const {
  MONGO_URI_DEV,
  PORT,
  NODE_ENV,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET
} = process.env;

if (!ACCESS_TOKEN_SECRET) {
  logger.error('FATAL ERROR: ACCESS_TOKEN_SECRET is not defined.');
  process.exit(1);
}

if (!REFRESH_TOKEN_SECRET) {
  logger.error('FATAL ERROR: REFRESH_TOKEN_SECRET is not defined.');
  process.exit(1);
}

// FIXME: move to startup?
if (NODE_ENV === 'development') {
  connectToMongoDB(MONGO_URI_DEV as string);
}

if (NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Listening on port ${PORT}...`));
}
