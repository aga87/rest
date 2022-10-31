import { Router } from 'express';
import { validateObjectId } from '../middleware/validateObjectId';
import {
  addItem,
  deleteItem,
  getItems,
  getItem,
  updateItem
} from '../controllers/items';

const router = Router();

router.get('/', getItems);

router.post('/', addItem);

router.get('/:id', validateObjectId, getItem);

router.patch('/:id', validateObjectId, updateItem);

router.delete('/:id', validateObjectId, deleteItem);

export { router as items };
