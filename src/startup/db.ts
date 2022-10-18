import mongoose from 'mongoose';

export const connectToMongoDB = (): void => {
  const mongoURI = process.env.PLAYGROUND_MONGO_URI || '';

  mongoose
    .connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB...', err));
};
