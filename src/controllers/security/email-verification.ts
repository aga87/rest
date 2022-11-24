import { RequestHandler } from 'express';
import Joi from 'joi';
import { User } from '../../models/User';
import { Token } from '../../models/Token';
import { getHATEOAS, sendEmail, validateSchema } from '../../utils';

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

export const renewVerificationToken: RequestHandler = async (
  req,
  res,
  next
) => {
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: Joi.object({
      email: Joi.string().required().email()
    })
  });

  if (error) return res.status(400).send(error);

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user?.isVerified) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome',
        html: `<p>Your account had already been verified. You can proceed to login.</p>`
      });
    }

    if (user && !user.isVerified) {
      // Delete the old token
      await Token.findOneAndDelete({ userId: user._id });

      // Generate and save new token
      const newToken = new Token({
        userId: user._id
      });
      await newToken.save();

      // Send the token by email
      await sendEmail({
        to: user.email,
        subject: 'Welcome',
        html: `<p>Verification token: <br /><br /><b>${newToken.token}</b><br /><br />The token will expire in 30 minutes.</p>`
      });
    }

    res.send({
      msg: `If a matching account exists, new verification token has been sent to ${req.body.email}`,
      _links: getHATEOAS(req.originalUrl, [
        {
          href: `${process.env.BASE_URL}/api/v1/security/email-verification`,
          rel: 'email verification'
        }
      ])
    });
  } catch (err) {
    next(err);
  }
};
