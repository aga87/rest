import { Router } from 'express';
import { validateObjectId } from '../middleware/validateObjectId';
import { deleteItem, getItems, getItem } from '../controllers/items';

const router = Router();

router.get('/', getItems);

router.get('/:id', validateObjectId, getItem);

router.delete('/:id', validateObjectId, deleteItem);

export { router as items };
