import { Server, IncomingMessage, ServerResponse } from 'http';
import mongoose from 'mongoose';
import request from 'supertest';
import { server } from '../../app';
import { Item, IItem } from '../../models/Item';

describe('/api/v1/items', () => {
  let testServer: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeEach(() => {
    testServer = server;
  });

  afterEach(async () => {
    testServer.close();
    await Item.deleteMany({}); // Clean up the database
  });

  afterAll(() => {
    mongoose.connection.close(); // Allows Jest to exit successfully
  });

  describe('GET / SUCCESS', () => {
    const act = async () => await request(testServer).get('/api/v1/items');

    beforeEach(async () => {
      // Populate the database
      const items: IItem[] = [
        {
          title: 'a',
          description: 'a'
        },
        {
          title: 'b',
          description: null
        }
      ];
      await Item.collection.insertMany(items);
    });

    it('should return all items', async () => {
      const res = await act();
      expect(res.body.some((item: IItem) => item.title === 'a')).toBeTruthy();
      expect(res.body.some((item: IItem) => item.title === 'b')).toBeTruthy();
    });

    it('should return 200 status code', async () => {
      const res = await act();
      expect(res.status).toBe(200);
    });
  });
});
