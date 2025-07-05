import { describe, expect, it } from 'vitest';

import { setupTestServer } from './helpers/server.js';

describe('Health Check', () => {
  const getTestSetup = setupTestServer();

  it('should return OK status', async () => {
    const { healthClient } = getTestSetup();
    const response = await healthClient.healthCheck({});
    expect(response.status).toBe('OK');
  });
});
