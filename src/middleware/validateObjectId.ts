import mongoose from 'mongoose';
import { RequestHandler } from 'express';

export const validateObjectId: RequestHandler = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('Invalid ID.');
  next();
};
