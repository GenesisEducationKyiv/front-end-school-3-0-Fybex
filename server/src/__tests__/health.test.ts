import { describe, expect, it } from 'vitest';

import { setupTestServer } from './helpers/server';

describe('Health Check', () => {
  const getTestSetup = setupTestServer();

  it('should return OK status', async () => {
    const { client } = getTestSetup();
    const response = await client.healthCheck({});
    expect(response.status).toBe('OK');
  });
});
