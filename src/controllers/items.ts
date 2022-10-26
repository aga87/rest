import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Item } from '../models/Item';

export const getItems: RequestHandler = async (_req, res, next) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (err) {
    next(err);
  }
};

export const getItem: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) return res.status(400).send('Invalid ID.');

    const item = await Item.findById(id);
    if (!item)
      return res
        .status(404)
        .send('Not Found: the requested resource does not exist.');

    res.send(item);
  } catch (err) {
    next(err);
  }
};
