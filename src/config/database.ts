import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Job } from '../entities/Job';
import { CV } from '../entities/CV';
import { Application } from '../entities/Application';
import { Interview } from '../entities/Interview';

// Load environment variables
config();

const isProduction = process.env.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'portalempleo',
  synchronize: false, // Never use true in production
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Job, CV, Application, Interview],
  migrations: isProduction ? ['dist/migrations/**/*.js'] : ['src/migrations/**/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};

// Export default for TypeORM CLI - this must be the only DataSource export
export default AppDataSource;
