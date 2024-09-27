import mongoose from "mongoose";
const { MONGODB_URI } = process.env;
const { MONGODB_DEV_URI } = process.env;

const uri = process.env.NODE_ENV === 'production' ? MONGODB_URI : MONGODB_DEV_URI;

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(uri as string);
    if (connection.readyState === 1) {
      return Promise.resolve(true);
    }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};