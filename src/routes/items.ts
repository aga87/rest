import { Router } from 'express';
import { getItems } from '../controllers/items';

const router = Router();

router.get('/', getItems);

export { router as items };
