import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../../../models/User';

describe('User methods', () => {
  describe('user.generateAuthToken', () => {
    it('should return a valid JWT', () => {
      const payload = {
        userId: new mongoose.Types.ObjectId().toHexString()
      };
      const user = new User({ _id: payload.userId });
      const token = user.generateAccessToken();
      const decoded = jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`);

      expect(decoded).toMatchObject(payload);
    });
  });

  describe('user.generateRefreshToken', () => {
    it('should return a valid JWT', () => {
      const payload = {
        userId: new mongoose.Types.ObjectId().toHexString()
      };
      const user = new User({ _id: payload.userId });
      const token = user.generateRefreshToken();
      const decoded = jwt.verify(token, `${process.env.REFRESH_TOKEN_SECRET}`);

      expect(decoded).toMatchObject(payload);
    });
  });
});
