import type { ConnectRouter } from '@connectrpc/connect';
import { GenresService, HealthService, TracksService } from '@music-app/proto';

import { genresService } from './services/genres.service';
import { healthService } from './services/health.service';
import { tracksService } from './services/tracks.service';

export default (router: ConnectRouter) => {
  router.service(GenresService, genresService);
  router.service(HealthService, healthService);
  router.service(TracksService, tracksService);
};
