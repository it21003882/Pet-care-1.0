/**
 * config/database.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/config/database.ts
 * ─────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ MongoDB connection error: ${message}`);
    process.exit(1);
  }
};

export default connectDB;
