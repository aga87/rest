import { Router } from 'express';
import { getTags } from '../controllers/tags';

const router = Router();

router.get('/', getTags);

export { router as tags };
