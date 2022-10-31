import { Schema, model } from 'mongoose';
import Joi from 'joi';

const TITLE_MAX_LENGTH = 100;
const DESC_MAX_LENGTH = 1000;

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: TITLE_MAX_LENGTH,
      trim: true
    },
    description: {
      type: String || null,
      default: null,
      set: (v: string) => (v === '' ? null : v),
      maxLength: DESC_MAX_LENGTH,
      trim: true
    }
  },
  { timestamps: true }
);

export const Item = model('Item', itemSchema);

export const createItemSchema = Joi.object({
  title: Joi.string().trim().max(TITLE_MAX_LENGTH).required(),
  description: Joi.string().allow(null, '').trim().max(DESC_MAX_LENGTH)
});
