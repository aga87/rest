import { Router } from 'express';
import { getMe, register } from '../controllers/users';
import { authMiddleware as auth } from '../middleware/auth';

const router = Router();

router.post('/', register);

router.get('/me', auth, getMe);

export { router as users };
