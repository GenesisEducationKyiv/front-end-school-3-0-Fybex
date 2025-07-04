import { O, pipe } from "@mobily/ts-belt";

import {
  type FetchTracksOptions,
  type SortField,
  type SortOrder,
} from "@/lib/api/tracks";

type NonNullableProps<T> = { [K in keyof T]-?: NonNullable<T[K]> };
export type FilterState = NonNullableProps<FetchTracksOptions>;

export const DEFAULT_SEARCH_TERM = "";
export const DEFAULT_GENRE = "";
export const DEFAULT_SORT_FIELD: SortField = "createdAt";
export const DEFAULT_SORT_ORDER: SortOrder = "desc";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_ARTIST = "";

export const PAGE_SIZES = [10, DEFAULT_PAGE_SIZE, 30, 50, 100];

const SORT_FIELD_LABELS: Record<SortField, string> = {
  createdAt: "Newest",
  title: "Title",
  artist: "Artist",
  album: "Album",
} as const;

const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  asc: "Ascending",
  desc: "Descending",
} as const;

export const SORT_OPTIONS: { label: string; value: SortField }[] =
  Object.entries(SORT_FIELD_LABELS).map(([value, label]) => ({
    value: value as SortField,
    label,
  }));

export const SORT_ORDER_OPTIONS: { label: string; value: SortOrder }[] =
  Object.entries(SORT_ORDER_LABELS).map(([value, label]) => ({
    value: value as SortOrder,
    label,
  }));

const isSortField = (value: unknown): value is SortField =>
  typeof value === "string" && value in SORT_FIELD_LABELS;

const isSortOrder = (value: unknown): value is SortOrder =>
  typeof value === "string" && value in SORT_ORDER_LABELS;

const safeParseInt = (v: string): O.Option<number> =>
  O.fromPredicate(parseInt(v, 10), (n) => !isNaN(n));

export type FilterConfig = {
  readonly [K in keyof FilterState]: {
    readonly defaultValue: FilterState[K];
    readonly parse: (value: string) => O.Option<FilterState[K]>;
  };
};

export const filterConfig: FilterConfig = {
  search: {
    defaultValue: DEFAULT_SEARCH_TERM,
    parse: (v) => O.Some(v.trim()),
  },
  genre: {
    defaultValue: DEFAULT_GENRE,
    parse: (v) => O.Some(v.trim()),
  },
  sort: {
    defaultValue: DEFAULT_SORT_FIELD,
    parse: (v) => (isSortField(v) ? O.Some(v) : O.None),
  },
  order: {
    defaultValue: DEFAULT_SORT_ORDER,
    parse: (v) => (isSortOrder(v) ? O.Some(v) : O.None),
  },
  page: {
    defaultValue: DEFAULT_PAGE,
    parse: (v) =>
      pipe(
        safeParseInt(v),
        O.filter((n) => n > 0)
      ),
  },
  limit: {
    defaultValue: DEFAULT_PAGE_SIZE,
    parse: (v) =>
      pipe(
        safeParseInt(v),
        O.filter((n) => PAGE_SIZES.includes(n))
      ),
  },
  artist: {
    defaultValue: DEFAULT_ARTIST,
    parse: (v) => O.Some(v.trim()),
  },
};
