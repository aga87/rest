import { Schema, model } from 'mongoose';
import Joi from 'joi';
import { joiPasswordExtendCore } from 'joi-password';

const NAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 256;

export interface IUser {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
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

export const User = model('User', userSchema);

const joiPassword = Joi.extend(joiPasswordExtendCore);

export const passwordValidator = joiPassword
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)
  .minOfSpecialCharacters(1)
  .minOfLowercase(1)
  .minOfUppercase(1)
  .minOfNumeric(1)
  .noWhiteSpaces()
  .required();

export const createUserSchema = Joi.object({
  name: Joi.string().max(NAME_MAX_LENGTH).required(),
  email: Joi.string().email().required(),
  password: passwordValidator
});
