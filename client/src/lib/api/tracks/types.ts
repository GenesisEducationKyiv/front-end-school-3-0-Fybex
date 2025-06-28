import { type ZodiosResponseByAlias } from "@zodios/core";
import { z } from "zod";

import { apiSchemas, type Api } from "../client";

export const baseTrackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album: z.string().optional(),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});
export type BaseTrackFormData = z.infer<typeof baseTrackSchema>;

export const createTrackSchema = apiSchemas.postApitracks_Body.extend(
  baseTrackSchema.shape
);
export type CreateTrackFormData = z.infer<typeof createTrackSchema>;

export const editTrackSchema = apiSchemas.putApitracksId_Body.extend(
  baseTrackSchema.shape
);
export type EditTrackFormData = z.infer<typeof editTrackSchema>;

export type Track = ZodiosResponseByAlias<Api, "getApitracksSlug">;
export type TrackWithId = Track & { id: string };
export type TrackId = TrackWithId["id"];

export type CreateTrackRequestData = z.infer<
  typeof apiSchemas.postApitracks_Body
>;
export type UpdateTrackRequestData = z.infer<
  typeof apiSchemas.putApitracksId_Body
>;
export type DeleteTracksRequestData = z.infer<
  typeof apiSchemas.postApitracksdelete_Body
>;

type QueryParams = Extract<
  Api[number],
  { path: "/api/tracks"; method: "get" }
>["parameters"];
export type FetchTracksOptions = {
  [K in QueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};
export type SortField = NonNullable<FetchTracksOptions["sort"]>;
export type SortOrder = NonNullable<FetchTracksOptions["order"]>;
