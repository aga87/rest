import mongoose, { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { authMiddleware } from '../../middleware/auth';
import { Item } from '../../models/Item';
import { Tag, ITag } from '../../models/Tag';

// Mock auth middleware to bypass authorization (tested separately) (and only test if the middleware is invoked on protected routes)
jest.mock('../../middleware/auth', () => {
  return {
    authMiddleware: jest.fn((req, res, next) => next())
  };
});

describe('/api/v1/tags', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    // Clean up the database
    await Tag.deleteMany({});
    await Item.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET / SUCCESS', () => {
    const act = async () => await request(app).get('/api/v1/tags');

    beforeEach(async () => {
      // Populate the database
      const tags: Partial<ITag>[] = [
        {
          name: 'a'
        },
        {
          name: 'b'
        }
      ];
      await Tag.collection.insertMany(tags);
    });

    describe('Auth', () => {
      it('should require user-based authorization', async () => {
        await act();
        expect(authMiddleware).toHaveBeenCalledTimes(1);
      });
    });

    it('should return all tags', async () => {
      const res = await act();
      expect(res.body.some((tag: ITag) => tag.name === 'a')).toBeTruthy();
      expect(res.body.some((tag: ITag) => tag.name === 'b')).toBeTruthy();
    });

    it('should return 200 status code', async () => {
      const res = await act();
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /:id', () => {
    let id: any;
    let itemId: Types.ObjectId;
    let item2Id: Types.ObjectId;
    const act = async () => await request(app).delete(`/api/v1/tags/${id}`);

    beforeEach(async () => {
      // Populate database + define happy path
      const tag = new Tag({ name: 'tag' });
      await tag.save();
      id = tag._id;

      const item = new Item({
        title: 'a',
        tags: [id]
      });

      const item2 = new Item({
        title: 'a',
        tags: [id]
      });

      await item.save();
      await item2.save();

      itemId = item._id;
      item2Id = item2._id;
    });

    describe('Auth', () => {
      it('should require user-based authorization', async () => {
        await act();
        expect(authMiddleware).toHaveBeenCalledTimes(1);
      });
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

    describe('If tag with the given id exists / SUCCESS', () => {
      it('should delete the tag', async () => {
        await act();
        const tag = await Tag.findById(id);
        expect(tag).toBeNull();
      });

      it('should return 204 status code and no response body', async () => {
        const res = await act();
        expect(res.status).toBe(204);
        expect(res.body).toStrictEqual({});
      });

      it('should remove the reference to the tag from all items', async () => {
        await act();
        const item = await Item.findById(itemId);
        const item2 = await Item.findById(item2Id);
        expect(item?.tags.length).toBe(0);
        expect(item2?.tags.length).toBe(0);
      });
    });
  });
});
