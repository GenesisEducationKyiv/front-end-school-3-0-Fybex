import { type ApiOf, type ZodiosResponseByAlias } from "@zodios/core";
import { type z } from "zod";

import { type api, type schemas } from "../../generated/api";

type Api = ApiOf<typeof api>;

export type Track = ZodiosResponseByAlias<Api, "getApitracksSlug">;
export type TrackWithId = Track & { id: string };
export type TrackId = TrackWithId["id"];

export type Genres = ZodiosResponseByAlias<Api, "getApigenres">;
export type Genre = Genres[number];

export type CreateTrackRequestData = z.infer<typeof schemas.postApitracks_Body>;
export type UpdateTrackRequestData = z.infer<
  typeof schemas.putApitracksId_Body
>;
export type DeleteTracksRequestData = z.infer<
  typeof schemas.postApitracksdelete_Body
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
