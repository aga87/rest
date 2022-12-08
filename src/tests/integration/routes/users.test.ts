import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../app';
import { authMiddleware } from '../../../middleware/auth';
import { authAdmin } from '../../../middleware/authAdmin';
import { IUser, User } from '../../../models/User';
import { Token } from '../../../models/Token';

jest.mock('../../../middleware/auth');

jest.mock('../../../middleware/authAdmin', () => {
  return {
    authAdmin: jest.fn((req, res, next) => next())
  };
});

describe('/api/v1/users', () => {
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
    let name: string;
    let email: string;
    let password: string;

    let newUser: {
      name?: string;
      email?: string;
      password?: string;
    };

    const act = async () =>
      await request(app).post('/api/v1/users').send(newUser);

    beforeEach(() => {
      // Happy path
      name = 'a';
      email = 'a@a.com';
      password = '123aA%';

      newUser = { name, email, password };
    });

    it('should return 400 if name is missing', async () => {
      delete newUser.name;
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if email is missing', async () => {
      delete newUser.email;
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      newUser.email = 'a';
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      delete newUser.password;
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if password is too weak', async () => {
      newUser.password = '12345';
      const res = await act();
      expect(res.status).toBe(400);
    });

    describe('if name, email and password are valid / SUCCESS', () => {
      it('should save the user with an unverified flag in the DB', async () => {
        await act();
        const user = await User.findOne({ email });
        expect(user).not.toBeNull();
        expect(user?.isVerified).toBeFalsy();
      });

      it('should generate and save the token associated with the user in the DB', async () => {
        await act();
        const user = await User.findOne({ email });
        const token = await Token.findOne({ userId: user?._id });
        expect(token).not.toBeNull();
      });

      it('should not save a duplicate user (email) in the DB', async () => {
        await act();
        await act();
        const user = await User.find({ email });
        expect(user.length).toBe(1);
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });

      it('should return message in the response', async () => {
        const res = await act();
        expect(res.body.msg).toBeTruthy();
      });
    });
  });

  describe('GET /me', () => {
    let token: string;

    const act = async () =>
      await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

    beforeEach(async () => {
      // Use the original implementation
      (authMiddleware as jest.Mock).mockImplementation(
        jest.requireActual('../../../middleware/auth').authMiddleware
      );

      const user = await new User({
        name: 'a',
        email: 'a@a.com',
        password: '123aA%'
      }).save();

      token = user.generateAccessToken();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 401 if user is not authorized', async () => {
      token = '';
      const res = await act();
      expect(res.status).toBe(401);
    });

    describe('if user is authorized / SUCCESS', () => {
      it('should return 200', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });

      it('should return user name and email', async () => {
        const res = await act();
        expect(res.body.name).toBe('a');
        expect(res.body.email).toBe('a@a.com');
      });

      it('should not return user password', async () => {
        const res = await act();
        expect(res.body.password).toBeFalsy();
      });
    });
  });

  describe('GET /', () => {
    const act = async () => await request(app).get('/api/v1/users');

    beforeEach(async () => {
      // Skip user-based auth
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) =>
        next()
      );

      // Populate the database
      const users: Partial<IUser>[] = [
        {
          name: 'a',
          email: 'a@a.com',
          password: 'a'
        },
        {
          name: 'b',
          email: 'b@b.com',
          password: 'b'
        }
      ];
      await User.collection.insertMany(users);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Auth', () => {
      it('should require user-based authorization', async () => {
        await act();
        expect(authMiddleware).toHaveBeenCalledTimes(1);
      });

      it('should require role-based admin authorization', async () => {
        await act();
        expect(authAdmin).toHaveBeenCalledTimes(1);
      });
    });

    describe('if user is authorized / SUCCESS', () => {
      it('should return 200', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });

      it('should return user names and emails', async () => {
        const res = await act();
        expect(res.body.some((user: IUser) => user.name === 'a')).toBeTruthy();
        expect(
          res.body.some((user: IUser) => user.email === 'b@b.com')
        ).toBeTruthy();
      });

      it('should not return user passwords', async () => {
        const res = await act();
        expect(res.body).not.toContain((user: IUser) => user.password);
      });
    });
  });
});
