/**
 * server.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/server.ts
 * ─────────────────────────────────────────────────────────────
 * HTTP server entry point. Connects to MongoDB and starts listening.
 */

import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/database';
import seedDatabase from './utils/seedData';

const PORT = process.env.PORT || 5001;

// Connect to MongoDB Atlas & seed initial data if needed
connectDB().then(() => {
  seedDatabase();
});

const server = app.listen(PORT, () => {
  console.log(`🚀 PetCare Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

export default server;
