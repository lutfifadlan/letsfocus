import mongoose from "mongoose";
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}
// } else { -> add this when migrating
//   dotenv.config({ path: '.env.local' });
// }

const { MONGODB_URI } = process.env;
const { MONGODB_DEV_URI } = process.env;

const uri = process.env.NODE_ENV === 'production' ? MONGODB_URI : MONGODB_DEV_URI;

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(uri as string);
    isConnected = db.connections[0].readyState === 1;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};