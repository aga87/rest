import mongoose, { ClientSession } from 'mongoose';
import { RequestHandler } from 'express';
import * as cloudinary from 'cloudinary';
import { Item, createItemSchema, updateItemSchema } from '../models/Item';
import { Tag, createTagSchema } from '../models/Tag';
import { getPagination, validateSchema } from '../utils';
import {
  selfHATEOAS,
  itemHATEOAS,
  tagsHATEOAS,
  itemsHATEOAS
} from '../utils/hateoas';

export const getItems: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page, pageSize } = req.query;

    const totalCount = await Item.countDocuments({ userId });

    const pagination = getPagination({
      page: page as string,
      pageSize: pageSize as string,
      defaultPageSize: 10,
      maxPageSize: 25,
      totalCount
    });

    if ('error' in pagination)
      return res.status(404).send({
        error: pagination.error,
        _links: [selfHATEOAS(req), itemsHATEOAS().items]
      });

    const items = await Item.find({ userId })
      .populate('tags', '_id name')
      .select('-userId -__v')
      .skip(pagination.skip)
      .limit(pagination.pagination.pageSize);

    res.send({
      items,
      pagination: pagination.pagination,
      _links: [
        selfHATEOAS(req),
        itemHATEOAS().item,
        itemHATEOAS().addItem,
        tagsHATEOAS().tags
      ]
    });
  } catch (err) {
    next(err);
  }
};

export const getItem: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const item = await Item.findOne({ _id: id, userId })
      .populate('tags', '_id name')
      .select('-userId');
    if (!item)
      return res.status(404).send({
        err: 'Item with the given ID was not found.',
        _links: [selfHATEOAS(req), itemsHATEOAS().items]
      });
    res.send({
      item,
      _links: [
        selfHATEOAS(req),
        itemHATEOAS(item._id.toHexString()).updateItem,
        itemHATEOAS(item._id.toHexString()).tagItem,
        itemHATEOAS(item._id.toHexString()).untagItem,
        itemHATEOAS(item._id.toHexString()).uploadItemImage,
        itemHATEOAS(item._id.toHexString()).deleteItem,
        itemsHATEOAS().items
      ]
    });
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
  try {
    const { userId } = req.user;
    const item = await new Item({ ...req.body, userId }).save();
    const savedItem = await Item.findById(item._id).select('-userId');
    res.setHeader(
      'location',
      `${process.env.BASE_URL}/${req.originalUrl}/${savedItem?._id}`
    );
    res.status(201).send({
      item: savedItem,
      _links: [
        selfHATEOAS(req),
        itemHATEOAS(item._id.toHexString()).updateItem,
        itemHATEOAS(item._id.toHexString()).tagItem,
        itemHATEOAS(item._id.toHexString()).untagItem,
        itemHATEOAS(item._id.toHexString()).uploadItemImage,
        itemHATEOAS(item._id.toHexString()).deleteItem,
        itemsHATEOAS().items
      ]
    });
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
    const { id } = req.params;
    const { userId } = req.user;
    const item = await Item.findOneAndUpdate({ _id: id, userId }, req.body, {
      new: true
    })
      .populate('tags', '_id name')
      .select('-userId -__v');
    if (!item)
      return res.status(404).send({
        err: 'Item with the given ID was not found.',
        _links: [selfHATEOAS(req), itemsHATEOAS().items]
      });
    res.send({
      item,
      _links: [
        selfHATEOAS(req),
        itemHATEOAS(item._id.toHexString()).tagItem,
        itemHATEOAS(item._id.toHexString()).untagItem,
        itemHATEOAS(item._id.toHexString()).uploadItemImage,
        itemHATEOAS(item._id.toHexString()).deleteItem,
        itemsHATEOAS().items
      ]
    });
  } catch (err) {
    next(err);
  }
};

export const deleteItem: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const item = await Item.findOneAndDelete({ _id: id, userId });
    if (!item)
      return res.status(404).send({
        err: 'Item with the given ID was not found.',
        _links: [selfHATEOAS(req), itemsHATEOAS().items]
      });
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
    const { id } = req.params;
    const { name } = req.body;
    const { userId } = req.user;
    const tag = await Tag.findOneAndUpdate(
      { name, userId },
      {
        $setOnInsert: { name },
        $addToSet: { items: req.params.id }
      },
      { new: true, upsert: true, runValidators: true, session }
    );

    // Tag the Item
    const item = await Item.findOneAndUpdate(
      {
        _id: id,
        userId
      },
      { $addToSet: { tags: tag._id } }, // Do not allow duplicate tags
      { new: true, runValidators: true, session }
    )
      .populate('tags', '_id name')
      .select('-userId');

    if (!item) {
      await session.abortTransaction();
      return res.status(404).send('Item you want to tag does not exist.');
    }
    await session.commitTransaction();
    res.send({
      item,
      _links: [
        selfHATEOAS(req),
        itemHATEOAS(item._id.toHexString()).untagItem,
        itemsHATEOAS().items,
        tagsHATEOAS().tags
      ]
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const untagItem: RequestHandler = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.tagId))
    return res.status(404).send('Invalid tag ID.');

  const session: ClientSession = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id, tagId } = req.params;
    const { userId } = req.user;
    // Untag the Item
    const item = await Item.findOneAndUpdate(
      { _id: id, userId },
      { $pull: { tags: tagId } },
      {
        new: true,
        runValidators: true,
        session
      }
    );

    if (!item) {
      return res.status(404).send({
        err: 'Item with the given ID was not found.',
        _links: [selfHATEOAS(req), itemsHATEOAS().items]
      });
    }

    // Update the Tag - remove the Item reference from items
    const tag = await Tag.findOneAndUpdate(
      { _id: tagId, userId },
      { $pull: { items: id } },
      {
        new: true,
        runValidators: true,
        session
      }
    );

    if (!tag) {
      await session.abortTransaction();
      return res.status(404).send({
        err: 'Tag with the given ID was not found.',
        _links: [selfHATEOAS(req), tagsHATEOAS().tags]
      });
    }

    // If there is no items tagged with the Tag, remove the Tag altogether
    if (tag.items.length === 0) {
      await tag.remove();
    }
    await session.commitTransaction();
    res.status(204).send();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const uploadItemImage: RequestHandler = async (req, res, next) => {
  const image = req.file;
  if (!image) return res.status(400).send('Image is required');

  try {
    const { id } = req.params;
    const { userId } = req.user;

    const itemQuery = { _id: id, userId };
    let item = await Item.findOne(itemQuery);

    if (!item)
      return res.status(404).send({
        err: 'Item with the given ID was not found.',
        _links: [selfHATEOAS(req), itemsHATEOAS().items]
      });

    // Configure Cloudinary
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadedImage = await cloudinary.v2.uploader.upload(image.path, {
      resource_type: 'image',
      public_id: `uploads/image-${id}`,
      overwrite: true,
      invalidate: true // invalidate any cached copies
    });

    item = await Item.findOneAndUpdate(
      itemQuery,
      { imageUrl: uploadedImage.secure_url },

      { new: true, runValidators: true }
    ).select('-__v -userId');

    res.send({
      item,
      _links: [selfHATEOAS(req), itemHATEOAS(id).item]
    });
  } catch (err) {
    next(err);
  }
};
