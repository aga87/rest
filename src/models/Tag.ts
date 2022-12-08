import { Schema, model, Types } from 'mongoose';
import Joi from 'joi';
import { IItem } from './Item';

const TAG_MAX_LENGTH = 20;

export interface ITag {
  name: string;
  items: (Types.ObjectId | IItem)[];
  userId: Types.ObjectId;
}

export const tagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    maxLength: TAG_MAX_LENGTH,
    trim: true
  },
  items: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      }
    ],
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

export const Tag = model('Tag', tagSchema);

export const createTagSchema = Joi.object({
  name: Joi.string().max(TAG_MAX_LENGTH).required()
});
