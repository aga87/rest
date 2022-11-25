import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { User, createUserSchema } from '../models/User';
import { Token } from '../models/Token';
import { getHATEOAS, sendEmail, validateSchema } from '../utils';

export const register: RequestHandler = async (req, res, next) => {
  const error = validateSchema({
    reqSchema: req.body,
    validSchema: createUserSchema
  });
  if (error) return res.status(400).send(error);

  try {
    let user = await User.findOne({
      email: req.body.email
    });

    if (user?.isVerified) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome',
        html: `<p>Your account had already been verified. You can proceed to login.</p>`
      });
    } else if (user && !user.isVerified) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome',
        html: `<p>You have already registered but your account has not been verified. Please check your inbox for a verification token we have sent following your original registration or request a new token.</p>`
      });
    } else {
      // Create and save a new user with hashed password
      const { name, email, password } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        name,
        email,
        password: hashedPassword
      });

      await user.save();

      // Generate and save verification token
      const token = new Token({
        userId: user._id,
        type: 'verification'
      });
      await token.save();

      // Send the token by email
      await sendEmail({
        to: user.email,
        subject: 'Welcome',
        html: `<p>Verification token: <br /><br /><b>${token.token}</b><br /><br />The token will expire in 30mins.</p>`
      });
    }

    res.send({
      msg: `Verification token has been sent to ${req.body.email}`,
      _links: getHATEOAS(req.originalUrl, [
        {
          href: `${process.env.BASE_URL}/api/v1/security/email-verification`,
          rel: 'email verification'
        },
        {
          href: `${process.env.BASE_URL}/api/v1/security/email-verification/new-token`,
          rel: 'new token'
        }
      ])
    });
  } catch (err) {
    next(err);
  }
};
