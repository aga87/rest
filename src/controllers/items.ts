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

export const getItem: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
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

export const deleteItem: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    if (!item)
      return res.status(404).send('The requested resource does not exist.');
    res.send('The resource was successfully deleted.');
  } catch (err) {
    next(err);
  }
};
