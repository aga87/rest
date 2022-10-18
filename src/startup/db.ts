import mongoose from 'mongoose';

export const connectToMongoDB = async (): Promise<void> => {
  const mongoURI = process.env.PLAYGROUND_MONGO_URI || '';

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB...', err);
  }
};
