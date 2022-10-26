import { Router } from 'express';
import { deleteItem, getItems, getItem } from '../controllers/items';

const router = Router();

router.get('/', getItems);

router.get('/:id', getItem);

router.delete('/:id', deleteItem);

export { router as items };
