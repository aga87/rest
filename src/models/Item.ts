import { Schema, model } from 'mongoose';

const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    maxLength: 5000
  }
});

export const Item = model('Item', itemSchema);
