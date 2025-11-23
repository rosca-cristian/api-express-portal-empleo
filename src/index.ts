import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import cvRoutes from './routes/cvRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import candidateRoutes from './routes/candidateRoutes';
import interviewRoutes from './routes/interviewRoutes';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API routes
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({ message: 'PortalEmpleo API v1' });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// User routes
app.use('/api/v1/users', userRoutes);

// CV routes
app.use('/api/v1/cvs', cvRoutes);

// Job routes
app.use('/api/v1/jobs', jobRoutes);

// Application routes
app.use('/api/v1/applications', applicationRoutes);

// Candidate routes
app.use('/api/v1/candidates', candidateRoutes);

// Interview routes
app.use('/api/v1/interviews', interviewRoutes);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start server
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
