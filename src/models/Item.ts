import { Schema, model } from 'mongoose';

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 100,
      trim: true
    },
    description: {
      type: String,
      default: null,
      maxLength: 5000,
      trim: true
    }
  },
  { timestamps: true }
);

export const Item = model('Item', itemSchema);
