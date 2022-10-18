import dotenv from 'dotenv';
import express, { Application } from 'express';
import { connectToMongoDB } from './startup/db';
import { routes } from './startup/routes';

dotenv.config();
const app: Application = express();

routes(app);

const mongoURI = process.env.PLAYGROUND_MONGO_URI || '';
connectToMongoDB(mongoURI);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
