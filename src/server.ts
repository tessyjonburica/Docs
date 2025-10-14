import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import userRouter from './routes/user.route';
import documentRouter from './routes/document.route';
import { initializeSocketServer } from './websockets/socketManager';

const app = express();
const server = http.createServer(app);


app.use(cookieParser());
app.use(
  cors()
);
app.use(express.json());


// API Routes
app.use('/api/users', userRouter);
app.use('/api/documents', documentRouter);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

initializeSocketServer(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Attempting to reconnect...');
  connectDB();
});

export default app;