import { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface JwtUserPayload extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtUserPayload;
    }
  }
}

export const authMiddleware: RequestHandler = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]?.trim();
  if (!token) return res.status(401).send('Access token is missing.');
  try {
    const decoded = jwt.verify(
      token,
      `${process.env.ACCESS_TOKEN_SECRET}`
    ) as JwtUserPayload;
    req.user = decoded; // Append user info to each request
    next();
  } catch (err) {
    res.status(401).send('Invalid access token.');
  }
};
