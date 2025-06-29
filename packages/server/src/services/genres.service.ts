import type { ServiceImpl } from '@connectrpc/connect';
import { type GenresService } from '@music-app/proto';

import { getAllGenres } from '../controllers/genres.controller';

export const genresService: ServiceImpl<typeof GenresService> = {
  getGenres: getAllGenres,
};
