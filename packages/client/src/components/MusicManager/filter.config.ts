import { O, pipe } from "@mobily/ts-belt";
import { type ExcludeProtobufInternals } from "@music-app/proto";
import {
  type GetTracksRequest,
  SortField,
  SortOrder,
} from "@music-app/proto/tracks";

type NonNullableProps<T> = { [K in keyof T]-?: NonNullable<T[K]> };

export type FilterState = NonNullableProps<
  ExcludeProtobufInternals<GetTracksRequest>
>;

export const DEFAULT_SEARCH_TERM = "";
export const DEFAULT_GENRE = "";
export const DEFAULT_SORT_FIELD: SortField = SortField.CREATED_AT;
export const DEFAULT_SORT_ORDER: SortOrder = SortOrder.DESC;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_ARTIST = "";

export const PAGE_SIZES = [10, DEFAULT_PAGE_SIZE, 30, 50, 100];

const SORT_FIELD_LABELS: Record<
  Exclude<SortField, SortField.UNSPECIFIED>,
  string
> = {
  [SortField.CREATED_AT]: "Date Created",
  [SortField.TITLE]: "Title",
  [SortField.ARTIST]: "Artist",
  [SortField.ALBUM]: "Album",
} as const;

const SORT_ORDER_LABELS: Record<
  Exclude<SortOrder, SortOrder.UNSPECIFIED>,
  string
> = {
  [SortOrder.ASC]: "Ascending",
  [SortOrder.DESC]: "Descending",
} as const;

export const SORT_OPTIONS: { label: string; value: SortField }[] =
  Object.entries(SORT_FIELD_LABELS).map(([value, label]) => ({
    value: value as unknown as SortField,
    label,
  }));

export const SORT_ORDER_OPTIONS: { label: string; value: SortOrder }[] =
  Object.entries(SORT_ORDER_LABELS).map(([value, label]) => ({
    value: value as unknown as SortOrder,
    label,
  }));

const safeParseInt = (v: string): O.Option<number> =>
  O.fromPredicate(parseInt(v, 10), (n) => !isNaN(n));

export const SORT_PARAM_VALUES = {
  [SortField.CREATED_AT]: "created_at",
  [SortField.TITLE]: "title",
  [SortField.ARTIST]: "artist",
  [SortField.ALBUM]: "album",
} as const;

type SortParamValue =
  (typeof SORT_PARAM_VALUES)[keyof typeof SORT_PARAM_VALUES];
const PARAM_SORT_VALUES: Record<SortParamValue, SortField> = Object.fromEntries(
  Object.entries(SORT_PARAM_VALUES).map(([k, v]) => [v, Number(k)])
) as Record<SortParamValue, SortField>;

export const ORDER_PARAM_VALUES = {
  [SortOrder.ASC]: "asc",
  [SortOrder.DESC]: "desc",
} as const;

type OrderParamValue =
  (typeof ORDER_PARAM_VALUES)[keyof typeof ORDER_PARAM_VALUES];
const PARAM_ORDER_VALUES: Record<OrderParamValue, SortOrder> =
  Object.fromEntries(
    Object.entries(ORDER_PARAM_VALUES).map(([k, v]) => [v, Number(k)])
  ) as Record<OrderParamValue, SortOrder>;

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
    parse: (v) => {
      const key = v.toLowerCase() as SortParamValue;
      return key in PARAM_SORT_VALUES ? O.Some(PARAM_SORT_VALUES[key]) : O.None;
    },
  },
  order: {
    defaultValue: DEFAULT_SORT_ORDER,
    parse: (v) => {
      const key = v.toLowerCase() as OrderParamValue;
      return key in PARAM_ORDER_VALUES
        ? O.Some(PARAM_ORDER_VALUES[key])
        : O.None;
    },
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
