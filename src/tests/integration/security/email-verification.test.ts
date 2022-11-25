import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../app';
import { User } from '../../../models/User';
import { Token } from '../../../models/Token';

describe('/api/v1/security/email-verification', () => {
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

    const act = async () =>
      await request(app)
        .post('/api/v1/security/email-verification')
        .send(reqBody);

    beforeEach(async () => {
      // Happy path
      const user = new User({
        name: 'a',
        email: 'a@a.com',
        password: '123aA%'
      });

      await user.save();

      const verificationToken = new Token({
        userId: user._id,
        type: 'verification'
      });

      await verificationToken.save();

      reqBody = {
        token: verificationToken.token
      };
    });

    it('should return 400 if token is missing', async () => {
      reqBody = {};
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 401 if token is invalid or expired', async () => {
      reqBody = {
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
        const tokenInDB = await Token.findOne({
          token: reqBody.token,
          type: 'verification'
        });
        expect(tokenInDB).toBeNull();
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });
    });
  });

  describe('POST /new-token', () => {
    let reqBody: any;
    let token: string;
    let userId: mongoose.Types.ObjectId;

    const act = async () =>
      await request(app)
        .post('/api/v1/security/email-verification/new-token')
        .send(reqBody);

    beforeEach(async () => {
      const user = new User({
        name: 'a',
        email: 'a@a.com',
        password: '123aA%'
      });

      await user.save();

      const verificationToken = new Token({
        userId: user._id,
        type: 'verification'
      });

      await verificationToken.save();

      reqBody = {
        email: user.email
      };

      token = verificationToken.token;
      userId = user._id;
    });

    it('should return 400 if email is missing', async () => {
      reqBody = {};
      const res = await act();
      expect(res.status).toBe(400);
    });

    describe('if email is valid / SUCCESS', () => {
      it('should remove the original from the DB', async () => {
        await act();
        const oldToken = await Token.findOne({ token, type: 'verification' });
        expect(oldToken).toBeNull();
      });

      it('should generate and save a new token for that user in the DB', async () => {
        await act();
        const newToken = await Token.findOne({ userId, type: 'verification' });
        expect(newToken).not.toBeNull();
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
