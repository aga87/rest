import { Router } from 'express';
import { verifyUser } from '../controllers/security/email-verification';

const router = Router();

router.post('/email-verification', verifyUser);

export { router as security };
