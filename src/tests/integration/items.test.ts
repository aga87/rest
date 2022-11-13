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

  describe('GET /:id', () => {
    let id: any;
    let item: any;

    const act = async () =>
      await request(testServer).get(`/api/v1/items/${id}`);

    beforeEach(async () => {
      // Happy path
      item = new Item({
        title: 'a',
        description: 'a'
      });
      await item.save();
      id = item._id;
    });

    it('should return 404 if invalid id is passed', async () => {
      id = 1;
      const res = await act();
      expect(res.status).toBe(404);
    });

    it('should return 404 if no item with the given id exists', async () => {
      id = new mongoose.Types.ObjectId();
      const res = await act();
      expect(res.status).toBe(404);
    });

    describe('If the id is valid and the item exists / SUCCESS', () => {
      it('should return an item', async () => {
        const res = await act();
        expect(res.body).toHaveProperty('title', 'a');
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });
    });
  });
});
