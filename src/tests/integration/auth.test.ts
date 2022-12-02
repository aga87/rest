import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { User, IUser } from '../../models/User';
import { Token } from '../../models/Token';

describe('/api/v1/auth', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
  });

  afterEach(async () => {
    // Clean up the database
    await User.deleteMany({});
    await Token.deleteMany({});
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  describe('POST /', () => {
    let email: string;
    let password: string;
    let reqBody: any;

    const act = async () =>
      await request(app).post('/api/v1/auth').send(reqBody);

    beforeEach(async () => {
      // Happy path
      // Register a user (saving directly to the DB would not hash the password)
      const user: Pick<IUser, 'name' | 'email' | 'password'> = {
        name: 'a',
        email: 'a@a.com',
        password: '123aA%'
      };
      await request(app).post('/api/v1/users').send(user);

      // Verify user
      await User.findOneAndUpdate({ email: user.email }, { isVerified: true });

      email = user.email;
      password = user.password;
      reqBody = { email, password };
    });

    it('should return 400 if email is missing', async () => {
      reqBody = { password };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if password is invalid', async () => {
      reqBody.password = '1';
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 401 if password and email are valid but user is not verified', async () => {
      const user = await User.findOneAndUpdate(
        { email },
        { isVerified: false },
        { new: true }
      );
      const res = await act();
      expect(user).not.toBeNull();
      expect(user?.isVerified).toBeFalsy();
      expect(res.status).toBe(401);
    });

    describe('email and password are valid and user is verified / SUCCESS', () => {
      it('should return access and refresh tokens', async () => {
        const res = await act();
        expect(res.body.user.token.accessToken).toBeTruthy();
        expect(res.body.user.token.refreshToken).toBeTruthy();
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });
    });
  });

  describe('POST /refresh-token', () => {
    let reqBody: any;
    let userId: mongoose.Types.ObjectId;

    const act = async () =>
      await request(app).post('/api/v1/auth/refresh-token').send(reqBody);

    beforeEach(async () => {
      // Happy path
      const user = await new User({
        name: 'a',
        email: 'a@a.com',
        password: '123aA%',
        isVerified: true
      }).save();

      userId = user._id;

      const refreshToken = user.generateRefreshToken();

      await new Token({
        token: refreshToken,
        userId,
        type: 'refresh'
      }).save();

      reqBody = { refreshToken };
    });

    it('should return 400 if refresh token is missing', async () => {
      reqBody = {};
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 401 if refresh token is invalid', async () => {
      reqBody.refreshToken = 'a';
      const res = await act();
      expect(res.status).toBe(401);
    });

    it('should return 404 if refresh token is valid but user does not exist', async () => {
      await User.findByIdAndDelete(userId);
      const res = await act();
      expect(res.status).toBe(404);
    });

    describe('refresh token is valid and user is exists / SUCCESS', () => {
      it('should return access token', async () => {
        const res = await act();
        expect(res.body.accessToken).toBeTruthy();
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });
    });
  });
});
