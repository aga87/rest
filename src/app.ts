import dotenv from 'dotenv';
import express, { Application } from 'express';
import { connectToMongoDB } from './startup/db';
import { logger } from './startup/logger';
import { routes } from './startup/routes';

dotenv.config();
const app: Application = express();

routes(app);

const { MONGO_URI, PORT } = process.env;

connectToMongoDB(MONGO_URI || '');

export const server = app.listen(PORT, () =>
  logger.info(`Listening on port ${PORT}...`)
);
