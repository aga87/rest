import { Request, Response, NextFunction } from 'express';
import { Item } from '../models/Item';

export const getItems = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (err) {
    next(err);
  }
};
