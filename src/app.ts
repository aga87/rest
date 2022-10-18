import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import { connectToMongoDB } from './startup/db';

dotenv.config();
const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

connectToMongoDB();
