import { RequestHandler } from 'express';
import { Item, createItemSchema } from '../models/Item';
import { validateSchema } from '../services/joi';

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

export const addItem: RequestHandler = async (req, res, next) => {
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: createItemSchema
  });
  if (error) return res.status(400).send(error);
  const item = new Item(req.body);
  try {
    const result = await item.save();
    res.setHeader(
      'Location',
      `${process.env.BASE_URL}/${req.originalUrl}/${result._id}`
    );
    res.status(201).send(result);
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
