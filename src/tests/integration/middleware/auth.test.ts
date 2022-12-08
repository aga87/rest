import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../app';
import { User } from '../../../models/User';

describe('auth middleware', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  let token: string;

  // Test the middleware on any endpoint that uses it
  const act = async () => {
    return await request(app)
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${token}`);
  };

  beforeEach(() => {
    // Happy path
    token = new User().generateAccessToken();
  });

  it('should return 401 if JWT token is missing', async () => {
    token = '';
    const res = await act();
    expect(res.status).toBe(401);
  });

  it('should return 401 if JWT token is invalid', async () => {
    token = 'a';
    const res = await act();
    expect(res.status).toBe(401);
  });

  it('should execute the route handler if JWT token is valid', async () => {
    const res = await act();
    expect(res.status).toBe(200);
  });
});
