import { beforeEach, describe, expect, it } from 'vitest';

import { SortField, SortOrder } from '../generated/music/v1/music_pb';

import { resetTestDatabase, setupTestServer } from './helpers/server';

describe('Tracks', () => {
  const getTestSetup = setupTestServer();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  describe('Create Track', () => {
    it('should create a new track', async () => {
      const { client } = getTestSetup();
      const testTrack = {
        title: 'Test Track Create',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
        coverImage: 'https://example.com/image.jpg',
      };

      const response = await client.createTrack(testTrack);

      expect(response.track?.title).toBe(testTrack.title);
      expect(response.track?.artist).toBe(testTrack.artist);
      expect(response.track?.album).toBe(testTrack.album);
      expect(response.track?.genres).toEqual(testTrack.genres);
      expect(response.track?.slug).toBe('test-track-create');
      expect(response.track?.coverImage).toBe(testTrack.coverImage);
      expect(response.track?.id).toBeDefined();
      expect(response.track?.createdAt).toBeDefined();
      expect(response.track?.updatedAt).toBeDefined();
    });

    it('should return error when required fields are missing', async () => {
      const { client } = getTestSetup();
      await expect(
        client.createTrack({
          title: 'Test Track Missing Fields',
          // Missing required fields
        }),
      ).rejects.toThrow();
    });
  });

  describe('Get Tracks', () => {
    it('should return a list of tracks with pagination', async () => {
      const { client } = getTestSetup();
      // Create a test track
      const testTrack = {
        title: 'Test Track Pagination',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
        coverImage: 'https://example.com/image.jpg',
      };
      await client.createTrack(testTrack);

      const response = await client.getTracks({
        page: 1,
        limit: 10,
      });

      expect(response.tracks).toBeDefined();
      expect(Array.isArray(response.tracks)).toBe(true);
      expect(response.meta).toBeDefined();
      expect(response.meta?.page).toBe(1);
      expect(response.meta?.limit).toBe(10);
      expect(response.meta?.total).toBeGreaterThanOrEqual(1);
      expect(response.meta?.totalPages).toBeGreaterThanOrEqual(1);

      // Verify our test track is in the results
      const testTrackInResults = response.tracks.some(
        (track) => track.title === testTrack.title,
      );
      expect(testTrackInResults).toBe(true);
    });

    it('should filter tracks by search term', async () => {
      const { client } = getTestSetup();
      const testTrack = {
        title: 'Test Track Search',
        artist: 'Test Artist',
        genres: ['Rock'],
      };
      await client.createTrack(testTrack);

      const response = await client.getTracks({
        page: 1,
        limit: 10,
        search: testTrack.title,
      });

      expect(response.tracks.length).toBeGreaterThan(0);
      expect(response.tracks[0].title).toBe(testTrack.title);
    });

    it('should sort tracks by title', async () => {
      const { client } = getTestSetup();
      // Create test tracks for sorting
      await client.createTrack({
        title: 'B Track Sort',
        artist: 'Test Artist',
        genres: ['Rock'],
      });
      await client.createTrack({
        title: 'A Track Sort',
        artist: 'Test Artist',
        genres: ['Rock'],
      });

      const response = await client.getTracks({
        sort: SortField.TITLE,
        order: SortOrder.ASC,
      });

      expect(response.tracks.length).toBeGreaterThan(0);

      // Verify the result is sorted by title
      const sortedTitles = [...response.tracks]
        .map((track) => track.title)
        .sort();
      const resultTitles = response.tracks.map((track) => track.title);
      expect(resultTitles).toEqual(sortedTitles);
    });
  });

  describe('Get Track by Slug', () => {
    it('should return a track by slug', async () => {
      const { client } = getTestSetup();
      const testTrack = {
        title: 'Test Track By Slug',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
      };
      await client.createTrack(testTrack);

      const response = await client.getTrackBySlug({
        slug: 'test-track-by-slug',
      });

      expect(response.track?.title).toBe(testTrack.title);
      expect(response.track?.artist).toBe(testTrack.artist);
      expect(response.track?.slug).toBe('test-track-by-slug');
    });

    it('should return error for non-existent track', async () => {
      const { client } = getTestSetup();
      await expect(
        client.getTrackBySlug({ slug: 'non-existent-track' }),
      ).rejects.toThrow();
    });
  });

  describe('Update Track', () => {
    it('should update a track', async () => {
      const { client } = getTestSetup();
      const testTrack = {
        title: 'Test Track Update',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
      };
      const createResponse = await client.createTrack(testTrack);
      const trackId = createResponse.track?.id;

      const updatedData = {
        id: trackId,
        title: 'Updated Track Title',
        artist: 'Updated Artist',
        genres: ['Jazz', 'Blues'],
      };

      const response = await client.updateTrack(updatedData);

      expect(response.track?.title).toBe(updatedData.title);
      expect(response.track?.artist).toBe(updatedData.artist);
      expect(response.track?.genres).toEqual(updatedData.genres);
      expect(response.track?.slug).toBe('updated-track-title');
      expect(response.track?.album).toBe(testTrack.album); // This shouldn't change
    });

    it('should return error for non-existent track', async () => {
      const { client } = getTestSetup();
      await expect(
        client.updateTrack({
          id: 'non-existent-id',
          title: 'Updated Track',
          genres: [],
        }),
      ).rejects.toThrow();
    });
  });

  describe('Delete Track', () => {
    it('should delete a track', async () => {
      const { client } = getTestSetup();
      const testTrack = {
        title: 'Test Track Delete',
        artist: 'Test Artist',
        genres: ['Rock'],
      };
      const createResponse = await client.createTrack(testTrack);
      const trackId = createResponse.track?.id;

      const response = await client.deleteTrack({
        id: trackId,
      });

      expect(response.success).toBe(true);

      // Verify the track was deleted
      await expect(
        client.getTrackBySlug({ slug: 'test-track-delete' }),
      ).rejects.toThrow();
    });

    it('should return error for non-existent track', async () => {
      const { client } = getTestSetup();
      await expect(
        client.deleteTrack({ id: 'non-existent-id' }),
      ).rejects.toThrow();
    });
  });

  describe('Delete Multiple Tracks', () => {
    it('should delete multiple tracks', async () => {
      const { client } = getTestSetup();
      const batchTrackIds: string[] = [];

      // Create multiple tracks for batch delete test
      for (let i = 0; i < 3; i++) {
        const response = await client.createTrack({
          title: `Batch Track Delete ${i.toString()}`,
          artist: 'Batch Artist',
          genres: ['Rock'],
        });

        batchTrackIds.push(response.track?.id ?? '');
      }

      const response = await client.deleteTracks({
        ids: batchTrackIds,
      });

      expect(response.success).toEqual(batchTrackIds);
      expect(response.failed).toEqual([]);

      // Verify all tracks were deleted
      for (let i = 0; i < batchTrackIds.length; i++) {
        await expect(
          client.getTrackBySlug({
            slug: `batch-track-delete-${i.toString()}`,
          }),
        ).rejects.toThrow();
      }
    });

    it('should return error for missing ids', async () => {
      const { client } = getTestSetup();
      await expect(client.deleteTracks({ ids: [] })).rejects.toThrow();
    });
  });
});
