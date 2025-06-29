import type { ServiceImpl } from '@connectrpc/connect';
import { type TracksService } from '@music-app/proto';

import {
  addTrack,
  deleteTrackFile,
  getAllTracks,
  getTrack,
  removeTrack,
  removeTracks,
  updateTrackById,
  uploadTrackFile,
} from '../controllers/tracks.controller';

export const tracksService: ServiceImpl<typeof TracksService> = {
  getTracks: getAllTracks,
  getTrackBySlug: getTrack,
  createTrack: addTrack,
  updateTrack: updateTrackById,
  deleteTrack: removeTrack,
  deleteTracks: removeTracks,
  uploadFile: uploadTrackFile,
  deleteFile: deleteTrackFile,
};
