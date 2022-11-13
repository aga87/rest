import { RequestHandler } from 'express';
import { Tag } from '../models/Tag';

export const getTags: RequestHandler = async (_req, res, next) => {
  try {
    const tags = await Tag.find()
      .select('-__v')
      .collation({ locale: 'en' }) // Makes alphabetical sort case-insensitive
      .sort({ name: 1 });
    res.send(tags);
  } catch (err) {
    next(err);
  }
};
