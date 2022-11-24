import { RequestHandler } from 'express';
import Joi from 'joi';
import { User } from '../../models/User';
import { Token } from '../../models/Token';
import { getHATEOAS, validateSchema } from '../../utils';

export const verifyUser: RequestHandler = async (req, res, next) => {
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: Joi.object({
      token: Joi.string().required()
    })
  });

  if (error) return res.status(400).send(error);

  try {
    const token = await Token.findOne({ token: req.body.token });

    if (!token)
      return res.status(401).send({
        msg: 'Verification failed - invalid or expired token.',
        _links: getHATEOAS(req.originalUrl, [
          {
            href: `${process.env.BASE_URL}/api/v1/security/email-verification/new-token`,
            rel: 'new token'
          }
        ])
      });

    const user = await User.findById(token.userId);

    if (!user)
      return res.status(404).send({
        msg: 'User does not exist.',
        _links: getHATEOAS(req.originalUrl, [
          {
            href: `${process.env.BASE_URL}/api/v1/users`,
            rel: 'registration'
          }
        ])
      });

    user.isVerified = true;
    await user.save();

    await token.remove();

    res.send({
      user: {
        name: user.name,
        email: user.email
      },
      _links: getHATEOAS(req.originalUrl, [
        {
          href: `${process.env.BASE_URL}/api/v1/auth`,
          rel: 'login'
        }
      ])
    });
  } catch (err) {
    next(err);
  }
};
