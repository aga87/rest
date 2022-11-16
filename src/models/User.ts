import mongoose from 'mongoose';
import Joi from 'joi';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 256;

interface IUser {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
}
const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: NAME_MIN_LENGTH,
    maxlength: NAME_MAX_LENGTH
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: PASSWORD_MIN_LENGTH,
    maxlength: PASSWORD_MAX_LENGTH
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  }
});

export const User = mongoose.model('User', userSchema);

export const createUserSchema = Joi.object({
  name: Joi.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).required(),
  email: Joi.string().required().email(),
  password: Joi.string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .required()
});
