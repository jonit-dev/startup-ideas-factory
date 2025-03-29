import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the root of the project
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  debug: process.env.DEBUG_MODE === 'true',
} as const;
