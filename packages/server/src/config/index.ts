import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { z } from 'zod';

const isTest = process.env.NODE_ENV === 'test';

// For tests, create a unique directory for each worker to run in parallel safely.
// For other environments, load from .env files.
if (isTest) {
  const testWorkerId = process.env.VITEST_WORKER_ID ?? '1';
  const testDataRoot = path.join('./test-data', `worker-${testWorkerId}`);

  process.env.DATA_DIR = testDataRoot;
  process.env.TRACKS_DIR = path.join(testDataRoot, 'tracks');
  process.env.UPLOADS_DIR = path.join(testDataRoot, 'uploads');
  process.env.GENRES_FILE = path.join(testDataRoot, 'genres.json');
  process.env.LOG_LEVEL = 'silent';
} else {
  // Determine which .env file to load based on NODE_ENV
  const envFile = process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV}`
    : '.env';
  const envPath = path.resolve(process.cwd(), envFile);

  if (fs.existsSync(envPath)) {
    const env = dotenv.config({ path: envPath });
    dotenvExpand.expand(env);
  } else {
    // Fallback to .env if specific one doesn't exist
    const fallbackPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(fallbackPath)) {
      const env = dotenv.config({ path: fallbackPath });
      dotenvExpand.expand(env);
    }
  }
}

/**
 * Define a schema for the environment variables using Zod
 */
const envSchema = z.object({
  // Server settings
  PORT: z.string().default('8000').transform(Number),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // File storage settings
  DATA_DIR: z.string().default('./data'),
  TRACKS_DIR: z.string().default('./data/tracks'),
  UPLOADS_DIR: z.string().default('./data/uploads'),
  GENRES_FILE: z.string().default('./data/genres.json'),

  // CORS settings
  CORS_ORIGIN: z.string().default('*'),

  // Logging
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  // File upload settings
  MAX_FILE_SIZE: z.string().default('10485760').transform(Number), // 10MB in bytes
});

/**
 * Validate the environment variables against the schema
 */
const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error(
    '❌ Invalid environment variables:',
    envVars.error.flatten().fieldErrors,
  );
  process.exit(1);
}

/**
 * Configuration object with validated environment variables
 */
const config = {
  isProduction: envVars.data.NODE_ENV === 'production',
  isTest: envVars.data.NODE_ENV === 'test',
  isDevelopment: envVars.data.NODE_ENV === 'development',

  server: {
    port: envVars.data.PORT,
    host: envVars.data.HOST,
    env: envVars.data.NODE_ENV,
  },

  storage: {
    dataDir: path.resolve(process.cwd(), envVars.data.DATA_DIR),
    tracksDir: path.resolve(process.cwd(), envVars.data.TRACKS_DIR),
    uploadsDir: path.resolve(process.cwd(), envVars.data.UPLOADS_DIR),
    genresFile: path.resolve(process.cwd(), envVars.data.GENRES_FILE),
  },

  cors: {
    origin: envVars.data.CORS_ORIGIN,
  },

  logger: {
    level: envVars.data.LOG_LEVEL,
  },

  upload: {
    maxFileSize: envVars.data.MAX_FILE_SIZE,
  },
};

export default config;
