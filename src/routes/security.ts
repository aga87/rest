import { Router } from 'express';
import {
  renewVerificationToken,
  verifyUser
} from '../controllers/security/email-verification';

const router = Router();

router.post('/email-verification', verifyUser);

router.post('/email-verification/new-token', renewVerificationToken);

export { router as security };
