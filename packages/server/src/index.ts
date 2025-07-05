import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';

import config from './config/index.js';
import routes from './routes.js';
import { initializeDb } from './utils/db.js';

async function start() {
  try {
    // Log configuration on startup
    console.log(`Starting gRPC server in ${config.server.env} mode`);

    // Initialize database
    await initializeDb();

    const fastify = Fastify({
      logger: {
        level: config.logger.level,
        transport: config.isDevelopment
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
      },
    });

    // Register CORS plugin
    await fastify.register(cors, {
      origin: config.cors.origin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Connect-Protocol-Version',
        'Connect-Timeout-Ms',
      ],
    });

    // Register static file serving for audio files
    await fastify.register(fastifyStatic, {
      root: config.storage.uploadsDir,
      prefix: '/api/tracks/audio/',
    });

    // Register Connect RPC routes
    await fastify.register(fastifyConnectPlugin, {
      routes: routes,
    });

    // Start server
    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    });

    console.log(
      `Server is running on http://${
        config.server.host
      }:${config.server.port.toString()}`,
    );
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

void start();
