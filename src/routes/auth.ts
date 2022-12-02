import { Router } from 'express';
import { login, refreshAccessToken } from '../controllers/auth';

const router = Router();

router.post('/', login);

router.post('/refresh-token', refreshAccessToken);

export { router as auth };
