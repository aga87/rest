import mongoose, { ClientSession } from 'mongoose';
import { RequestHandler } from 'express';
import { Item, createItemSchema, updateItemSchema } from '../models/Item';
import { Tag, createTagSchema } from '../models/Tag';
import { validateSchema } from '../services/joi';

export const getItems: RequestHandler = async (_req, res, next) => {
  try {
    const items = await Item.find().populate('tags', '_id name');
    res.send(items);
  } catch (err) {
    next(err);
  }
};

export const getItem: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id).populate('tags', '_id name');
    if (!item)
      return res.status(404).send('Item with the given ID was not found.');
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
      'location',
      `${process.env.BASE_URL}/${req.originalUrl}/${result._id}`
    );
    res.status(201).send(result);
  } catch (err) {
    next(err);
  }
};

export const updateItem: RequestHandler = async (req, res, next) => {
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: updateItemSchema
  });
  if (error) return res.status(400).send(error);
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    }).populate('tags', '_id name');
    if (!item)
      return res.status(404).send('Item with the given ID was not found.');
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
      return res.status(404).send('Item with the given ID was not found.');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const tagItem: RequestHandler = async (req, res, next) => {
  // Validate
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: createTagSchema
  });
  if (error) return res.status(400).send(error);

  const session: ClientSession = await mongoose.startSession();
  try {
    session.startTransaction();
    // Update or create the Tag
    const { name } = req.body;
    const tag = await Tag.findOneAndUpdate(
      { name },
      {
        $setOnInsert: { name },
        $addToSet: { items: req.params.id }
      },
      { new: true, upsert: true, runValidators: true, session }
    );

    // Tag the Item
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { tags: tag._id } }, // Do not allow duplicate tags
      { new: true, runValidators: true, session }
    ).populate('tags', '_id name');

    if (!item) {
      await session.abortTransaction();
      return res.status(404).send('Item you want to tag does not exist.');
    }
    await session.commitTransaction();
    res.send(item);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
