import { create } from '@bufbuild/protobuf';

import {
  type HealthCheckResponse,
  HealthCheckResponseSchema,
} from '../generated/music/v1/music_pb';

/**
 * Health check endpoint
 */
export function healthCheck(): HealthCheckResponse {
  return create(HealthCheckResponseSchema, {
    status: 'OK',
  });
}
