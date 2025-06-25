import { type ZodiosResponseByAlias } from "@zodios/core";

import { type Api } from "../client";

export type Genres = ZodiosResponseByAlias<Api, "getApigenres">;
export type Genre = Genres[number];
