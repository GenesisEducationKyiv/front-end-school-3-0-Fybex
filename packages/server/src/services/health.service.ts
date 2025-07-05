import type { ServiceImpl } from '@connectrpc/connect';
import { type HealthService } from '@music-app/proto';

import { healthCheck } from '../controllers/health.controller.js';

export const healthService: ServiceImpl<typeof HealthService> = {
  healthCheck,
};
