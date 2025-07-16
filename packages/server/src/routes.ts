import type { ConnectRouter } from '@connectrpc/connect';
import { GenresService, TracksService } from '@music-app/proto';

import { genresService } from './services/genres.service.js';
import { tracksService } from './services/tracks.service.js';

export default (router: ConnectRouter) => {
  router.service(GenresService, genresService);
  router.service(TracksService, tracksService);
};
