import { RequestHandler } from 'express';

// Role-based authorization
export const authAdmin: RequestHandler = (req, res, next) => {
  if (!req.user.isAdmin)
    return res
      .status(403)
      .send('You do not have sufficient rights to access this resource.');
  next();
};
