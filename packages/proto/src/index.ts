// Export all generated protobuf types and services

// Genres
export * from './generated/genres/v1/genres-GenresService_connectquery.js';
export * from './generated/genres/v1/genres_pb.js';

// Tracks
export * from './generated/tracks/v1/tracks-TracksService_connectquery.js';
export * from './generated/tracks/v1/tracks_pb.js';

// Health
export * from './generated/health/v1/health-HealthService_connectquery.js';
export * from './generated/health/v1/health_pb.js';

export type ExcludeProtobufInternals<T> = {
  [K in keyof T as K extends `$${string}` ? never : K]: T[K];
};

// Re-export common protobuf utilities
export { create } from '@bufbuild/protobuf';
export type { Message } from '@bufbuild/protobuf';
