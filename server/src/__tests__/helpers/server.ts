import fs from 'fs/promises';
import path from 'path';

import { type Client, createClient, type Transport } from '@connectrpc/connect';
import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import { createConnectTransport } from '@connectrpc/connect-web';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, beforeAll } from 'vitest';

import config from '../../config';
import { MusicService } from '../../generated/music/v1/music_pb';
import routes from '../../routes';
import { initializeDb } from '../../utils/db';

// Test data paths from config
const TEST_DATA_DIR = config.storage.dataDir;
const TEST_TRACKS_DIR = config.storage.tracksDir;
const TEST_UPLOADS_DIR = config.storage.uploadsDir;
const TEST_GENRES_FILE = config.storage.genresFile;

export async function setupTestData() {
  // Create test directories
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  await fs.mkdir(TEST_TRACKS_DIR, { recursive: true });
  await fs.mkdir(TEST_UPLOADS_DIR, { recursive: true });

  // Create genres file
  const genres = [
    'Rock',
    'Pop',
    'Hip Hop',
    'Jazz',
    'Classical',
    'Electronic',
    'R&B',
    'Country',
    'Folk',
    'Reggae',
    'Metal',
    'Blues',
    'Indie',
  ];
  await fs.writeFile(TEST_GENRES_FILE, JSON.stringify(genres, null, 2));
}

export async function cleanupTestData() {
  try {
    // Try to remove all files in tracks directory
    try {
      const files = await fs.readdir(TEST_TRACKS_DIR);
      for (const file of files) {
        await fs.unlink(path.join(TEST_TRACKS_DIR, file));
      }
    } catch {
      /* Ignore errors */
    }

    // Try to remove all files in uploads directory
    try {
      const files = await fs.readdir(TEST_UPLOADS_DIR);
      for (const file of files) {
        await fs.unlink(path.join(TEST_UPLOADS_DIR, file));
      }
    } catch {
      /* Ignore errors */
    }

    // Try to remove the genres file
    try {
      await fs.unlink(TEST_GENRES_FILE);
    } catch {
      /* Ignore errors */
    }

    // Try to remove the directories
    try {
      await fs.rmdir(TEST_TRACKS_DIR);
      await fs.rmdir(TEST_UPLOADS_DIR);
      await fs.rmdir(TEST_DATA_DIR);
    } catch {
      // Log error but don't fail the test
      console.log(
        'Could not completely clean up test directories. This is OK for CI environments.',
      );
    }
  } catch {
    // Log error but don't fail the test
    console.log('Error in test cleanup. This is OK for CI environments.');
  }
}

export async function buildServer(): Promise<{
  server: FastifyInstance;
  client: Client<typeof MusicService>;
  transport: Transport;
}> {
  try {
    // Clean up any existing test data first
    await cleanupTestData();

    // Initialize test database with fresh data
    await setupTestData();
    await initializeDb();

    const server = Fastify({
      logger: false, // Disable logging for tests
    });

    // Register Connect RPC plugin
    await server.register(fastifyConnectPlugin, {
      routes: routes,
    });

    // Start server on random port
    await server.listen({ port: 0, host: '127.0.0.1' });
    const address = server.server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Server address is null');
    }
    const port = address.port;

    // Create Connect transport
    const transport = createConnectTransport({
      baseUrl: `http://127.0.0.1:${port.toString()}`,
    });

    // Create client
    const client = createClient(MusicService, transport);

    return { server, client, transport };
  } catch (error) {
    console.error('Error building gRPC server:', error);
    throw error;
  }
}

export interface TestSetup {
  server: FastifyInstance;
  client: Client<typeof MusicService>;
  transport: Transport;
}

// Helper to set up test hooks
export function setupTestServer() {
  let testSetup: TestSetup;

  beforeAll(async () => {
    testSetup = await buildServer();
  });

  afterAll(async () => {
    await testSetup.server.close();
    await cleanupTestData();
  });
  return () => testSetup;
}

export async function resetTestDatabase() {
  try {
    await cleanupTestData();
    await setupTestData();
    await initializeDb();
  } catch (error) {
    console.error('Error resetting test database:', error);
    throw error;
  }
}
