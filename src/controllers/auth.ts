import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { User, loginSchema } from '../models/User';
import { Token } from '../models/Token';
import { validateSchema } from '../utils';
import {
  authHATEOAS,
  itemsHATEOAS,
  tagsHATEOAS,
  securityHATEOAS,
  selfHATEOAS,
  usersHATEOAS
} from '../utils/hateoas';

export const login: RequestHandler = async (req, res, next) => {
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: loginSchema
  });
  if (error) return res.status(400).send(error);

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).send('Invalid email or password.');

    // Compare plain text password with hashed password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send('Invalid email or password.');

    if (!user.isVerified)
      return res.status(401).send({
        msg: 'Please verify your email address before logging in.',
        _links: [
          selfHATEOAS(req),
          securityHATEOAS().emailVerification,
          securityHATEOAS().verificationToken
        ]
      });

    const accessToken = user.generateAccessToken();

    // Remove old refresh token from the DB (this way we don't need the logout endpoint TODO: is this true?)
    await Token.findOneAndDelete({ userId: user._id, type: 'refresh' });

    // Generate new refresh token
    const refreshToken = user.generateRefreshToken();

    // Store new refresh token in the DB (so that it can be revoked)
    await new Token({
      userId: user._id,
      token: refreshToken,
      type: user.isAdmin ? 'refresh-admin' : 'refresh'
    }).save();

    res.send({
      user: {
        name: user.name,
        email: user.email,
        // https://www.rfc-editor.org/rfc/rfc6749#section-5.1
        token: {
          accessToken,
          tokenType: 'Bearer',
          expiresIn: '15m',
          refreshToken
        }
      },
      _links: [
        selfHATEOAS(req),
        authHATEOAS().refreshToken,
        usersHATEOAS().me,
        itemsHATEOAS().items,
        tagsHATEOAS().tags
      ]
    });
  } catch (err) {
    next(err);
  }
};

export const refreshAccessToken: RequestHandler = async (req, res, next) => {
  if (!req.body.refreshToken)
    return res.status(400).send('Refresh token is required.');

  try {
    const token = await Token.findOne({
      token: req.body.refreshToken,
      type: 'refresh'
    });

    if (!token)
      return res.status(401).send({
        msg: 'Invalid or expired token.',
        _links: [selfHATEOAS(req), authHATEOAS().login]
      });

    const user = await User.findById(token.userId);

    if (!user)
      return res
        .status(404)
        .send('The token is valid but user does not exists.');

    const accessToken = user.generateAccessToken();
    return res.status(200).send({
      accessToken,
      _links: [
        selfHATEOAS(req),
        usersHATEOAS().me,
        itemsHATEOAS().items,
        tagsHATEOAS().tags
      ]
    });
  } catch (err) {
    next(err);
  }
};
