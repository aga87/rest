import { Schema, model, Types } from 'mongoose';
import Joi from 'joi';

const TAG_MAX_LENGTH = 20;

interface ITag {
  name: string;
  items?: Types.ObjectId[];
}

export const tagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    unique: true,
    maxLength: TAG_MAX_LENGTH,
    trim: true
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Item'
    }
  ]
});

export const Tag = model('Tag', tagSchema);

export const createTagSchema = Joi.object({
  name: Joi.string().max(TAG_MAX_LENGTH).required()
});
