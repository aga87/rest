import { Request } from 'express';

export const selfHATEOAS = (req: Request) => ({
  href: `${process.env.BASE_URL}${req.originalUrl}`,
  rel: 'self',
  method: req.method
});

export const authHATEOAS = () => ({
  login: {
    href: `${process.env.BASE_URL}/api/v1/auth`,
    rel: 'login',
    method: 'POST'
  },
  refreshToken: {
    href: `${process.env.BASE_URL}/api/v1/auth/refresh-token`,
    rel: 'refresh token',
    method: 'POST'
  }
});

export const usersHATEOAS = () => ({
  registration: {
    href: `${process.env.BASE_URL}/api/v1/users`,
    rel: 'registration',
    method: 'POST'
  },
  me: {
    href: `${process.env.BASE_URL}/api/v1/users/me`,
    rel: 'me',
    method: 'GET'
  }
});

export const securityHATEOAS = () => ({
  emailVerification: {
    href: `${process.env.BASE_URL}/api/v1/security/email-verification`,
    rel: 'email verification',
    method: 'POST'
  },
  verificationToken: {
    href: `${process.env.BASE_URL}/api/v1/security/email-verification/new-token`,
    rel: 'email verification token',
    method: 'POST'
  },
  passwordResetToken: {
    href: `${process.env.BASE_URL}/api/v1/security/forgotten-password`,
    rel: 'forgotten password reset token',
    method: 'POST'
  },
  passwordReset: {
    href: `${process.env.BASE_URL}/api/v1/security/forgotten-password/reset`,
    rel: 'forgotten password reset',
    method: 'POST'
  }
});

export const itemsHATEOAS = () => ({
  items: {
    href: `${process.env.BASE_URL}/api/v1/items`,
    rel: 'items',
    method: 'GET'
  }
});

export const tagsHATEOAS = () => ({
  tags: {
    href: `${process.env.BASE_URL}/api/v1/tags`,
    rel: 'tags',
    method: 'GET'
  }
});
