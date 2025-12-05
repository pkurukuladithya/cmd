import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { ensureAdminUser } from './controllers/authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!MONGODB_URI) {
  console.error('Missing MONGO_URI in environment. Add it to your .env file.');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Middlewares
app.use(
  cors({
    origin: FRONTEND_URL.split(',').map((origin) => origin.trim()),
    credentials: true,
  })
);
app.use(express.json());

// Simple Test Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the MERN Backend! API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminUser();
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
