import { RequestHandler } from 'express';
import Joi from 'joi';
import { User } from '../../models/User';
import { Token } from '../../models/Token';
import { getHATEOAS, sendEmail, validateSchema } from '../../utils';

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
      _links: getHATEOAS(req.originalUrl, [
        {
          href: `${process.env.BASE_URL}/api/v1/security/forgotten-password/reset`,
          rel: 'reset password'
        },
        {
          href: `${process.env.BASE_URL}/api/v1/auth`,
          rel: 'login'
        },
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
