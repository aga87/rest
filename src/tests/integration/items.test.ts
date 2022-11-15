import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Item, IItem } from '../../models/Item';

describe('/api/v1/items', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
  });

  afterEach(async () => {
    await Item.deleteMany({}); // Clean up the database
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  describe('GET / SUCCESS', () => {
    const act = async () => await request(app).get('/api/v1/items');

    beforeEach(async () => {
      // Populate the database
      const items: Partial<IItem>[] = [
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

    const act = async () => await request(app).get(`/api/v1/items/${id}`);

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

  describe('POST /', () => {
    let newItem: any;

    const act = async () =>
      await request(app).post('/api/v1/items').send(newItem);

    it('should return 400 if title is missing', async () => {
      newItem = {
        description: 'a'
      };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if item title is longer than 50 characters', async () => {
      newItem = {
        title: new Array(52).join('a'),
        description: 'a'
      };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if item description is longer than 1000 characters', async () => {
      newItem = {
        title: 'a',
        description: new Array(1002).join('a')
      };
      const res = await act();
      expect(res.status).toBe(400);
    });

    describe('If the item is valid / SUCCESS', () => {
      beforeEach(() => {
        // Happy path
        newItem = {
          title: 'a',
          description: 'a'
        } as Partial<IItem>;
      });

      it('should save the item', async () => {
        await act();
        const item = await Item.find({ title: 'a' });
        expect(item).not.toBeNull();
      });

      it('should return the item (with timestamps)', async () => {
        const res = await act();
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('title', 'a');
        expect(res.body).toHaveProperty('description', 'a');
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('updatedAt');
      });

      it('should return 201 status code', async () => {
        const res = await act();
        expect(res.status).toBe(201);
      });

      it('should return the URI of the new item resource in the Location header', async () => {
        const res = await act();
        expect(res.header.location).toContain(`/api/v1/items/${res.body._id}`);
      });
    });
  });

  describe('PATCH /:id', () => {
    let update: any;
    let id: any;

    const act = async () =>
      await request(app).patch(`/api/v1/items/${id}`).send(update);

    beforeEach(async () => {
      // Happy path
      const item = new Item({
        title: 'a',
        description: 'a'
      });
      await item.save();
      id = item._id;
      update = {
        title: 'b',
        description: 'c'
      } as Partial<IItem>;
    });

    it('should return 400 if item title is longer than 50 characters', async () => {
      update = {
        title: new Array(52).join('a')
      };
      const res = await act();
      expect(res.status).toBe(400);
    });

    it('should return 400 if item description is longer than 1000 characters', async () => {
      update = {
        description: new Array(1002).join('a')
      };
      const res = await act();
      expect(res.status).toBe(400);
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

    describe('If the id and update are valid / SUCCESS', () => {
      it('should save the updated item', async () => {
        await act();
        const item = await Item.find({ title: 'b' });
        expect(item).not.toBeNull();
      });

      it('should return the updated item', async () => {
        const res = await act();
        expect(res.body).toHaveProperty('title', 'b');
        expect(res.body).toHaveProperty('description', 'c');
      });

      it('should return 200 status code', async () => {
        const res = await act();
        expect(res.status).toBe(200);
      });
    });
  });

  describe('DELETE /:id', () => {
    let id: any;

    const act = async () =>
      await request(app).delete(`/api/v1/items/${id}`).send();

    beforeEach(async () => {
      // Happy path
      const item = new Item({
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

    describe('If item with the given id exists / SUCCESS', () => {
      it('should delete the genre', async () => {
        await act();
        const itemInDB = await Item.findById(id);
        expect(itemInDB).toBeNull();
      });

      it('should return 204 status code and no response body', async () => {
        const res = await act();
        expect(res.status).toBe(204);
        expect(res.body).toStrictEqual({});
      });
    });
  });
});
