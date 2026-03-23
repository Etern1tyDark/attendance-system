import mongoose from 'mongoose';
import env from "@/config/env";

async function conn() {
  try {
    await mongoose.connect(env.mongoDbUri);
    console.log('MongoDB found and connected~');
  } catch (error) {
    console.error(':( Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

export default conn;
