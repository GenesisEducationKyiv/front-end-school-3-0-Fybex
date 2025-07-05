import { SortField, SortOrder } from '@music-app/proto';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetTestDatabase, setupTestServer } from './helpers/server.js';

describe('Tracks', () => {
  const getTestSetup = setupTestServer();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  describe('Create Track', () => {
    it('should create a new track', async () => {
      const { tracksClient } = getTestSetup();
      const testTrack = {
        title: 'Test Track Create',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
        coverImage: 'https://example.com/image.jpg',
      };

      const response = await tracksClient.createTrack(testTrack);

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
      const { tracksClient } = getTestSetup();
      await expect(
        tracksClient.createTrack({
          title: 'Test Track Missing Fields',
          // Missing required fields
        }),
      ).rejects.toThrow();
    });
  });

  describe('Get Tracks', () => {
    it('should return a list of tracks with pagination', async () => {
      const { tracksClient } = getTestSetup();
      // Create a test track
      const testTrack = {
        title: 'Test Track Pagination',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
        coverImage: 'https://example.com/image.jpg',
      };
      await tracksClient.createTrack(testTrack);

      const response = await tracksClient.getTracks({
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
      const { tracksClient } = getTestSetup();
      const testTrack = {
        title: 'Test Track Search',
        artist: 'Test Artist',
        genres: ['Rock'],
      };
      await tracksClient.createTrack(testTrack);

      const response = await tracksClient.getTracks({
        page: 1,
        limit: 10,
        search: testTrack.title,
      });

      expect(response.tracks.length).toBeGreaterThan(0);
      expect(response.tracks[0].title).toBe(testTrack.title);
    });

    it('should sort tracks by title', async () => {
      const { tracksClient } = getTestSetup();
      // Create test tracks for sorting
      await tracksClient.createTrack({
        title: 'B Track Sort',
        artist: 'Test Artist',
        genres: ['Rock'],
      });
      await tracksClient.createTrack({
        title: 'A Track Sort',
        artist: 'Test Artist',
        genres: ['Rock'],
      });

      const response = await tracksClient.getTracks({
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
      const { tracksClient } = getTestSetup();
      const testTrack = {
        title: 'Test Track By Slug',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
      };
      await tracksClient.createTrack(testTrack);

      const response = await tracksClient.getTrackBySlug({
        slug: 'test-track-by-slug',
      });

      expect(response.track?.title).toBe(testTrack.title);
      expect(response.track?.artist).toBe(testTrack.artist);
      expect(response.track?.slug).toBe('test-track-by-slug');
    });

    it('should return error for non-existent track', async () => {
      const { tracksClient } = getTestSetup();
      await expect(
        tracksClient.getTrackBySlug({ slug: 'non-existent-track' }),
      ).rejects.toThrow();
    });
  });

  describe('Update Track', () => {
    it('should update a track', async () => {
      const { tracksClient } = getTestSetup();
      const testTrack = {
        title: 'Test Track Update',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
      };
      const createResponse = await tracksClient.createTrack(testTrack);
      const trackId = createResponse.track?.id;

      const updatedData = {
        id: trackId,
        title: 'Updated Track Title',
        artist: 'Updated Artist',
        genres: ['Jazz', 'Blues'],
      };

      const response = await tracksClient.updateTrack(updatedData);

      expect(response.track?.title).toBe(updatedData.title);
      expect(response.track?.artist).toBe(updatedData.artist);
      expect(response.track?.genres).toEqual(updatedData.genres);
      expect(response.track?.slug).toBe('updated-track-title');
      expect(response.track?.album).toBe(testTrack.album); // This shouldn't change
    });

    it('should return error for non-existent track', async () => {
      const { tracksClient } = getTestSetup();
      await expect(
        tracksClient.updateTrack({
          id: 'non-existent-id',
          title: 'Updated Track',
          genres: [],
        }),
      ).rejects.toThrow();
    });
  });

  describe('Delete Track', () => {
    it('should delete a track', async () => {
      const { tracksClient } = getTestSetup();
      const testTrack = {
        title: 'Test Track Delete',
        artist: 'Test Artist',
        genres: ['Rock'],
      };
      const createResponse = await tracksClient.createTrack(testTrack);
      const trackId = createResponse.track?.id;

      const response = await tracksClient.deleteTrack({
        id: trackId,
      });

      expect(response.success).toBe(true);

      // Verify the track was deleted
      await expect(
        tracksClient.getTrackBySlug({ slug: 'test-track-delete' }),
      ).rejects.toThrow();
    });

    it('should return error for non-existent track', async () => {
      const { tracksClient } = getTestSetup();
      await expect(
        tracksClient.deleteTrack({ id: 'non-existent-id' }),
      ).rejects.toThrow();
    });
  });

  describe('Delete Multiple Tracks', () => {
    it('should delete multiple tracks', async () => {
      const { tracksClient } = getTestSetup();
      const batchTrackIds: string[] = [];

      // Create multiple tracks for batch delete test
      for (let i = 0; i < 3; i++) {
        const response = await tracksClient.createTrack({
          title: `Batch Track Delete ${i.toString()}`,
          artist: 'Batch Artist',
          genres: ['Rock'],
        });

        batchTrackIds.push(response.track?.id ?? '');
      }

      const response = await tracksClient.deleteTracks({
        ids: batchTrackIds,
      });

      expect(response.success).toEqual(batchTrackIds);
      expect(response.failed).toEqual([]);

      // Verify all tracks were deleted
      for (let i = 0; i < batchTrackIds.length; i++) {
        await expect(
          tracksClient.getTrackBySlug({
            slug: `batch-track-delete-${i.toString()}`,
          }),
        ).rejects.toThrow();
      }
    });

    it('should return error for missing ids', async () => {
      const { tracksClient } = getTestSetup();
      await expect(tracksClient.deleteTracks({ ids: [] })).rejects.toThrow();
    });
  });
});
