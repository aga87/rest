import { Schema, model, Types } from 'mongoose';
import crypto from 'crypto';
import { IUser } from './User';

interface IToken {
  token: string;
  userId: Types.ObjectId | IUser;
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    required: true,
    default: () => crypto.randomBytes(16).toString('hex'),
    unique: true
  },
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    expires: 1800, // Delete the document after 30 mins
    default: Date.now
  }
});

export const Token = model<IToken>('Token', tokenSchema);
