import mongoose, { ClientSession } from 'mongoose';
import { RequestHandler } from 'express';
import { Tag } from '../models/Tag';
import { Item } from '../models/Item';

export const getTags: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const tags = await Tag.find({ userId })
      .select('-__v -userId')
      .collation({ locale: 'en' }) // Makes alphabetical sort case-insensitive
      .sort({ name: 1 });
    res.send(tags);
  } catch (err) {
    next(err);
  }
};

export const deleteTag: RequestHandler = async (req, res, next) => {
  const session: ClientSession = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;
    const { userId } = req.user;
    // Delete the Tag
    const tag = await Tag.findOneAndDelete({ _id: id, userId }).session(
      session
    );
    if (!tag)
      return res.status(404).send('The tag with the given ID was not found');
    // Untag Items
    await Item.updateMany(
      {
        tags: id,
        userId
      },
      { $pull: { tags: id } },
      { runValidators: true, session }
    );
    await session.commitTransaction();
    res.status(204).send();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
