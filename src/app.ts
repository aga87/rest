import dotenv from 'dotenv';
import config from 'config';
import express, { Application, Request, Response } from 'express';

dotenv.config();
const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

const port = config.get('port');
app.listen(port, () => console.log(`Listening on port ${port}...`));
