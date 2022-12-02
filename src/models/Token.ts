import { Schema, model, Types } from 'mongoose';
import crypto from 'crypto';
import { IUser } from './User';
import { calculateFutureDateTime } from '../utils';

interface IToken {
  token: string;
  type: 'verification' | 'reset';
  userId: Types.ObjectId | IUser;
  expireAt: Date;
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    required: true,
    default: () => crypto.randomBytes(16).toString('hex'),
    unique: true
  },
  type: {
    type: String,
    enum: ['verification', 'reset', 'refresh'],
    required: true
  },
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  expireAt: {
    type: Date,
    expires: 1, // Must be a positive value. A document will expire when the number of seconds in the expireAfterSeconds field has passed since the time specified in its TTL indexed field;
    default: function () {
      return this.type === 'refresh'
        ? calculateFutureDateTime({ months: 1 })
        : calculateFutureDateTime({ minutes: 30 });
    }
  }
});

export const Token = model<IToken>('Token', tokenSchema);
