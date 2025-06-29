import { describe, expect, it } from 'vitest';

import { setupTestServer } from './helpers/server';

describe('Genres', () => {
  const getTestSetup = setupTestServer();

  it('should get all genres', async () => {
    const { genresClient } = getTestSetup();
    const response = await genresClient.getGenres({});
    expect(response.genres).toBeDefined();
    expect(Array.isArray(response.genres)).toBe(true);
    expect(response.genres.length).toBeGreaterThan(0);
    expect(response.genres).toContain('Rock');
    expect(response.genres).toContain('Pop');
    expect(response.genres).toContain('Jazz');
  });
});
