import { Schema, model, Types } from 'mongoose';
import Joi from 'joi';

const TITLE_MAX_LENGTH = 50;
const DESC_MAX_LENGTH = 1000;

export interface IItem {
  title: string;
  description: string | null;
  tags: Types.ObjectId[];
}

const itemSchema = new Schema<IItem>(
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
    },
    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Tag'
        }
      ],
      required: true
    }
  },
  { timestamps: true }
);

export const Item = model('Item', itemSchema);

const titleSchema = Joi.string().trim().max(TITLE_MAX_LENGTH);
const descriptionSchema = Joi.string()
  .allow(null, '')
  .trim()
  .max(DESC_MAX_LENGTH);

export const createItemSchema = Joi.object({
  title: titleSchema.required(),
  description: descriptionSchema
});

export const updateItemSchema = Joi.object({
  title: titleSchema,
  description: descriptionSchema
});
