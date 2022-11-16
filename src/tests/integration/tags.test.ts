import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Tag, ITag } from '../../models/Tag';

describe('/api/v1/tags', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
  });

  afterEach(async () => {
    // Clean up the database
    await Tag.deleteMany({});
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
});
