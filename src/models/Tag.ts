import { Schema, model } from 'mongoose';
import Joi from 'joi';

const TAG_MAX_LENGTH = 30;

export const tagSchema = new Schema({
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
