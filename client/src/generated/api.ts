import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const postApitracks_Body = z
  .object({
    title: z.string(),
    artist: z.string(),
    album: z.string().optional(),
    genres: z.array(z.string()),
    coverImage: z.string().optional(),
  })
  .passthrough();
const putApitracksId_Body = z
  .object({
    title: z.string(),
    artist: z.string(),
    album: z.string(),
    genres: z.array(z.string()),
    coverImage: z.string(),
  })
  .partial()
  .passthrough();
const postApitracksdelete_Body = z
  .object({ ids: z.array(z.string()) })
  .passthrough();

export const schemas = {
  postApitracks_Body,
  putApitracksId_Body,
  postApitracksdelete_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/genres",
    alias: "getApigenres",
    description: `Get all genres`,
    requestFormat: "json",
    response: z.array(z.string()),
    errors: [
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/tracks",
    alias: "getApitracks",
    description: `Get all tracks with pagination, sorting, and filtering`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "sort",
        type: "Query",
        schema: z.enum(["title", "artist", "album", "createdAt"]).optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "genre",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "artist",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        data: z.array(
          z
            .object({
              id: z.string(),
              title: z.string(),
              artist: z.string(),
              album: z.string(),
              genres: z.array(z.string()),
              slug: z.string(),
              coverImage: z.string(),
              audioFile: z.string(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
            .partial()
            .passthrough()
        ),
        meta: z
          .object({
            total: z.number(),
            page: z.number(),
            limit: z.number(),
            totalPages: z.number(),
          })
          .partial()
          .passthrough(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/tracks",
    alias: "postApitracks",
    description: `Create a new track`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApitracks_Body,
      },
    ],
    response: z
      .object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        album: z.string(),
        genres: z.array(z.string()),
        slug: z.string(),
        coverImage: z.string(),
        audioFile: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 409,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/tracks/:id",
    alias: "putApitracksId",
    description: `Update a track`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApitracksId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        album: z.string(),
        genres: z.array(z.string()),
        slug: z.string(),
        coverImage: z.string(),
        audioFile: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 409,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/tracks/:id",
    alias: "deleteApitracksId",
    description: `Delete a track`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/tracks/:id/file",
    alias: "deleteApitracksIdfile",
    description: `Delete an audio file from a track`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        album: z.string(),
        genres: z.array(z.string()),
        slug: z.string(),
        coverImage: z.string(),
        audioFile: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/tracks/:id/upload",
    alias: "postApitracksIdupload",
    description: `Upload an audio file for a track`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        album: z.string(),
        genres: z.array(z.string()),
        slug: z.string(),
        coverImage: z.string(),
        audioFile: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 404,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/tracks/:slug",
    alias: "getApitracksSlug",
    description: `Get a track by slug`,
    requestFormat: "json",
    parameters: [
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        album: z.string(),
        genres: z.array(z.string()),
        slug: z.string(),
        coverImage: z.string(),
        audioFile: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/tracks/delete",
    alias: "postApitracksdelete",
    description: `Delete multiple tracks`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApitracksdelete_Body,
      },
    ],
    response: z
      .object({ success: z.array(z.string()), failed: z.array(z.string()) })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Default Response`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/health",
    alias: "getHealth",
    description: `Health check endpoint`,
    requestFormat: "json",
    response: z.object({ status: z.string() }).partial().passthrough(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
