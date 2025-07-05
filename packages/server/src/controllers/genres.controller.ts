import { create } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  type GetGenresResponse,
  GetGenresResponseSchema,
} from '@music-app/proto';

import { getGenres } from '../utils/db.js';

/**
 * Get all available genres
 */
export async function getAllGenres(): Promise<GetGenresResponse> {
  try {
    const genres = await getGenres();

    return create(GetGenresResponseSchema, {
      genres,
    });
  } catch (error) {
    console.error('Error getting genres:', error);
    throw new ConnectError('Failed to get genres', Code.Internal);
  }
}
