import { Router } from 'express';
import { getMe, getUsers, register } from '../controllers/users';
import { authMiddleware as auth } from '../middleware/auth';
import { authAdmin } from '../middleware/authAdmin';

const router = Router();

router.post('/', register);

router.get('/', [auth, authAdmin], getUsers);

router.get('/me', auth, getMe);

export { router as users };
