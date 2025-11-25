import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Room } from '../entities/Room';
import { Booking } from '../entities/Booking';

dotenv.config();

// Enable SSL for remote databases (like Render, Railway, etc.)
// Check if DATABASE_URL is a remote database (not localhost)
const isRemoteDatabase = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('localhost') && 
  !process.env.DATABASE_URL.includes('127.0.0.1');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Room, Booking],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: isRemoteDatabase || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
  } catch (error) {
    throw error;
  }
};
