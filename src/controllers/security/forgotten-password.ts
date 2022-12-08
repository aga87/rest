import { RequestHandler } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { User, passwordValidator } from '../../models/User';
import { Token } from '../../models/Token';
import { sendEmail, validateSchema } from '../../utils';
import {
  authHATEOAS,
  securityHATEOAS,
  selfHATEOAS,
  usersHATEOAS
} from '../../utils/hateoas';

export const generatePasswordResetToken: RequestHandler = async (
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

    if (user && !user.isVerified) {
      await sendEmail({
        to: user.email,
        subject: 'Password reset',
        html: `<p>Please verify your email address before requesting a password change.</p>`
      });
    }

    if (user?.isVerified) {
      // Remove old token if it exists
      await Token.findOneAndDelete({ userId: user._id, type: 'reset' });

      // Generate and save new token
      const token = new Token({
        userId: user._id,
        type: 'reset'
      });
      await token.save();

      // Send the token by email
      await sendEmail({
        to: user.email,
        subject: 'Password reset',
        html: `<p>Password reset token: <br /><br /><b>${token.token}</b><br /><br />The token can only be used once and will expire in 30 minutes.</p>`
      });
    }

    res.send({
      msg: `If a matching account exists, a password reset token has been sent to ${req.body.email}`,
      _links: [
        selfHATEOAS(req),
        securityHATEOAS().passwordReset,
        securityHATEOAS().emailVerification,
        authHATEOAS().login
      ]
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: Joi.object({
      token: Joi.string().required(),
      newPassword: passwordValidator
    })
  });

  if (error) return res.status(400).send(error);

  try {
    const token = await Token.findOne({ token: req.body.token, type: 'reset' });

    if (!token)
      return res.status(401).send({
        msg: 'Password reset failed - invalid or expired token.',
        _links: [selfHATEOAS(req), securityHATEOAS().passwordResetToken]
      });

    const user = await User.findById(token.userId);

    if (!user)
      return res.status(404).send({
        msg: 'User does not exist.',
        _links: [selfHATEOAS(req), usersHATEOAS().registration]
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    user.password = hashedPassword;

    await user.save();
    await token.remove();

    res.send({
      msg: 'Password reset was successful.',
      _links: [selfHATEOAS(req), authHATEOAS().login]
    });
  } catch (err) {
    next(err);
  }
};
