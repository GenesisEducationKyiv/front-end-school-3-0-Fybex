import type { ConnectRouter } from '@connectrpc/connect';
import { GenresService, HealthService, TracksService } from '@music-app/proto';

import { genresService } from './services/genres.service.js';
import { healthService } from './services/health.service.js';
import { tracksService } from './services/tracks.service.js';

export default (router: ConnectRouter) => {
  router.service(GenresService, genresService);
  router.service(HealthService, healthService);
  router.service(TracksService, tracksService);
};
