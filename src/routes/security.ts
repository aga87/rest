import { Router } from 'express';
import {
  renewVerificationToken,
  verifyUser
} from '../controllers/security/email-verification';
import { generatePasswordResetToken } from '../controllers/security/forgotten-password';

const router = Router();

router.post('/email-verification', verifyUser);

router.post('/email-verification/new-token', renewVerificationToken);

router.post('/forgotten-password', generatePasswordResetToken);

export { router as security };
