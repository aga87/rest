import { Router } from 'express';
import {
  addItem,
  deleteItem,
  getItems,
  getItem,
  tagItem,
  updateItem,
  uploadItemImage,
  untagItem
} from '../controllers/items';
import { validateObjectId } from '../middleware/validateObjectId';
import { uploadSingleImage } from '../middleware/multer';

const router = Router();

router.get('/', getItems);

router.post('/', addItem);

router.get('/:id', validateObjectId, getItem);

router.patch('/:id', validateObjectId, updateItem);

router.delete('/:id', validateObjectId, deleteItem);

router.post('/:id/tags', validateObjectId, tagItem);

router.delete('/:id/tags/:tagId', validateObjectId, untagItem);

router.put(
  '/:id/image',
  [validateObjectId, uploadSingleImage],
  uploadItemImage
);

export { router as items };
