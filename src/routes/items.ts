import { Router } from 'express';
import { getItems, getItem } from '../controllers/items';

const router = Router();

router.get('/', getItems);

router.get('/:id', getItem);

export { router as items };
