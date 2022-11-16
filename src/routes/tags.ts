import { Router } from 'express';
import { deleteTag, getTags } from '../controllers/tags';
import { validateObjectId } from '../middleware/validateObjectId';

const router = Router();

router.get('/', getTags);

router.delete('/:id', validateObjectId, deleteTag);

export { router as tags };
