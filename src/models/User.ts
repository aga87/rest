import { Schema, model } from 'mongoose';
import Joi from 'joi';
import { joiPasswordExtendCore } from 'joi-password';
import jwt from 'jsonwebtoken';

const NAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 256;

export interface IUser {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
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

userSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    {
      _id: this._id
    },
    `${process.env.ACCESS_TOKEN_SECRET}`,
    { expiresIn: 15 * 60 } // 15mins
  );
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    {
      _id: this._id
    },
    `${process.env.REFRESH_TOKEN_SECRET}`,

    { expiresIn: '30d' }
  );
  return token;
};

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

const emailValidator = Joi.string().email().required();

export const createUserSchema = Joi.object({
  name: Joi.string().max(NAME_MAX_LENGTH).required(),
  email: emailValidator,
  password: passwordValidator
});

export const loginSchema = Joi.object({
  email: emailValidator,
  password: Joi.string().required()
});
