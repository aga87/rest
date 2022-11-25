import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../app';
import { User } from '../../../models/User';
import { Token } from '../../../models/Token';

describe('/api/v1/security/forgotten-password', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
  });

  afterEach(async () => {
    // Clean up the database
    await User.deleteMany({});
    await Token.deleteMany({});
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  describe('POST /', () => {
    let reqBody: any;
    let userId: mongoose.Types.ObjectId;

    const act = async () =>
      await request(app)
        .post('/api/v1/security/forgotten-password')
        .send(reqBody);

    beforeEach(async () => {
      // Happy path
      const user = new User({
        name: 'a',
        email: 'a@a.com',
        password: '123aA%'
      });

      await user.save();

      userId = user._id;

      reqBody = {
        email: user.email
      };
    });

    it('should return 400 if email is missing', async () => {
      reqBody = {};
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      reqBody = { email: 'a' };
      const res = await act();
      expect(res.status).toBe(400);
    });

    describe('if email is valid / SUCCESS', () => {
      it('should not generate a password reset token if user is not verified', async () => {
        await act();
        const token = await Token.findOne({ userId, type: 'reset' });
        expect(token).toBeNull();
      });

      it('should generate and save a password reset token in the DB if user is verified', async () => {
        const user = await User.findByIdAndUpdate(
          userId,
          {
            $set: { isVerified: true }
          },
          { runValidators: true, new: true }
        );
        await act();
        const token = await Token.findOne({ userId, type: 'reset' });
        expect(user?.isVerified).toBeTruthy();
        expect(token).not.toBeNull();
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });

      it('should return a message in the response body', async () => {
        const res = await act();
        expect(res.body.msg).toBeTruthy();
      });
    });
  });
});
