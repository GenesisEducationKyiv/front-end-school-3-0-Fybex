import { create } from '@bufbuild/protobuf';
import {
  type HealthCheckResponse,
  HealthCheckResponseSchema,
} from '@music-app/proto';

/**
 * Health check endpoint
 */
export function healthCheck(): HealthCheckResponse {
  return create(HealthCheckResponseSchema, {
    status: 'OK',
  });
}
