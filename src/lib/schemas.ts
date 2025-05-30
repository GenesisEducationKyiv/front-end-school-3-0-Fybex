import { z } from 'zod';

export const trackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string().optional().default(''),
  genres: z.array(z.string()),
  slug: z.string(),
  coverImage: z.string().optional().default(''),
  audioFile: z.string().optional().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const paginatedTracksSchema = z.object({
  data: z.array(trackSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type Track = z.infer<typeof trackSchema>;
export type PaginatedTracksResponse = z.infer<typeof paginatedTracksSchema>;

export const createTrackSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  album: z.string().optional(),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  coverImage: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export type CreateTrackFormData = z.infer<typeof createTrackSchema>;

export const genresSchema = z.array(z.string());

export type GenresResponse = z.infer<typeof genresSchema>;

export const editTrackSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  album: z.string().optional(),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  coverImage: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});
export type EditTrackFormData = z.infer<typeof editTrackSchema>;
