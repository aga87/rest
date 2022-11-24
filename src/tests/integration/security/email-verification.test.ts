import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../app';
import { User } from '../../../models/User';
import { Token } from '../../../models/Token';

describe.only('/api/v1/security/email-verification', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
  });

  afterEach(async () => {
    // Clean up the database
    await User.deleteMany({});
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  describe('POST /', () => {
    let token: any;

    const act = async () =>
      await request(app)
        .post('/api/v1/security/email-verification')
        .send(token);

    beforeEach(async () => {
      // Happy path
      const user = new User({
        name: 'a',
        email: 'a@a.com',
        password: '123aA%'
      });

      await user.save();

      const verificationToken = new Token({
        userId: user._id
      });

      await verificationToken.save();

      token = {
        token: verificationToken.token
      };
    });

    it('should return 400 if token is missing', async () => {
      token = {};
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 401 if token is invalid or expired', async () => {
      token = {
        token: 'a'
      };
      const res = await act();
      expect(res.status).toBe(401);
    });

    it('should return 404 if token is valid but user does not exist', async () => {
      await User.deleteMany({});
      const res = await act();
      expect(res.status).toBe(404);
    });

    describe('if the token is valid and the user exists / SUCCESS', () => {
      it('should verify the user', async () => {
        await act();
        const user = await User.findOne({ email: 'a@a.com' });
        expect(user?.isVerified).toBeTruthy();
      });

      it('should remove the token from the DB', async () => {
        await act();
        const tokenInDB = await Token.findOne({ token: token.token });
        expect(tokenInDB).toBeNull();
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });
    });
  });
});
