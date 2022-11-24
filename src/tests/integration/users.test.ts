import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/User';
import { Token } from '../../models/Token';

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
      newUser = { email, password };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if email is missing', async () => {
      newUser = { name, password };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      email = 'a';
      newUser = { name, email, password };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      newUser = { name, email };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if password is too weak', async () => {
      password = '12345';
      newUser = { name, email, password };
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
});