import dotenv from 'dotenv';
import express, { Application } from 'express';
import { connectToMongoDB } from './startup/db';
import { routes } from './startup/routes';

dotenv.config();
const app: Application = express();

routes(app);

connectToMongoDB();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
