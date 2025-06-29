import type { ServiceImpl } from '@connectrpc/connect';

import { getAllGenres } from './controllers/genres.controller';
import { healthCheck } from './controllers/health.controller';
import {
  addTrack,
  deleteTrackFile,
  getAllTracks,
  getTrack,
  removeTrack,
  removeTracks,
  updateTrackById,
  uploadTrackFile,
} from './controllers/tracks.controller';
import { type MusicService } from './generated/music/v1/music_pb';

export const musicService: ServiceImpl<typeof MusicService> = {
  healthCheck,
  getGenres: getAllGenres,
  getTracks: getAllTracks,
  getTrackBySlug: getTrack,
  createTrack: addTrack,
  updateTrack: updateTrackById,
  deleteTrack: removeTrack,
  deleteTracks: removeTracks,
  uploadFile: uploadTrackFile,
  deleteFile: deleteTrackFile,
};
