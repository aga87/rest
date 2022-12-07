import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../app';
import { User } from '../../../models/User';

describe('authAdmin middleware', () => {
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
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);
  };

  beforeEach(() => {
    // Happy path
    token = new User({ isAdmin: true }).generateAccessToken();
  });

  it('should return 403 if user is not an admin', async () => {
    token = new User({ isAdmin: false }).generateAccessToken();
    const res = await act();
    expect(res.status).toBe(403);
  });

  it('should execute the route handler if user is an admin', async () => {
    const res = await act();
    expect(res.status).toBe(200);
  });
});
