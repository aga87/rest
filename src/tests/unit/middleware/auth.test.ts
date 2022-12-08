import mongoose from 'mongoose';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { authMiddleware } from '../../../middleware/auth';
import { User } from '../../../models/User';

describe('auth middleware', () => {
  describe('If JWT is valid', () => {
    // Synchronous setup - no need for beforeAll
    const user = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true
    };
    const token = new User(user).generateAccessToken();

    // Mock request
    const req = getMockReq({
      header: jest.fn().mockReturnValue(`Bearer ${token}`)
    });
    // Mock response
    const { res } = getMockRes({});
    // Mock next()
    const next = jest.fn();

    authMiddleware(req, res, next);

    it('should populate req.user with the payload of a valid JWT', () => {
      expect(req.user).toMatchObject({
        userId: user._id,
        isAdmin: user.isAdmin
      });
    });

    it('should pass control to the next middleware/ handler', () => {
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
