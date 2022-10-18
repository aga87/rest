import mongoose from 'mongoose';

export const connectToMongoDB = async (mongoURI: string): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB...', err);
  }
};
