import { RequestHandler } from 'express';
import { Item } from '../models/Item';

export const getItems: RequestHandler = async (_req, res, next) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (err) {
    next(err);
  }
};
