import { O, pipe } from "@mobily/ts-belt";
import { useCallback, useMemo, useReducer } from "react";

import {
  type FetchTracksOptions,
  type SortField,
  type SortOrder,
} from "@/lib/api/tracks";

type NonNullableProps<T> = { [K in keyof T]-?: NonNullable<T[K]> };
export type FilterState = NonNullableProps<FetchTracksOptions>;

export const PAGE_SIZES = [10, 20, 30, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

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

export const SORT_OPTIONS = Object.entries(SORT_FIELD_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const SORT_ORDER_OPTIONS = Object.entries(SORT_ORDER_LABELS).map(
  ([value, label]) => ({ value, label })
);

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
    defaultValue: "",
    parse: (v) => O.Some(v.trim()),
  },
  genre: {
    defaultValue: "",
    parse: (v) => O.Some(v.trim()),
  },
  sort: {
    defaultValue: "createdAt",
    parse: (v) => (isSortField(v) ? O.Some(v) : O.None),
  },
  order: {
    defaultValue: "desc",
    parse: (v) => (isSortOrder(v) ? O.Some(v) : O.None),
  },
  page: {
    defaultValue: 1,
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
    defaultValue: "",
    parse: (v) => O.Some(v.trim()),
  },
};

type FilterAction =
  | {
      type: "SET_VALUE";
      payload: {
        key: keyof FilterState;
        value: FilterState[keyof FilterState];
      };
    }
  | { type: "RESET_STATE"; payload: FilterState };

const filterReducer = (
  state: FilterState,
  action: FilterAction
): FilterState => {
  switch (action.type) {
    case "SET_VALUE":
      return { ...state, [action.payload.key]: action.payload.value };
    case "RESET_STATE":
      return action.payload;
    default:
      return state;
  }
};

type Setters = {
  [K in keyof FilterState as `set${Capitalize<K & string>}`]: (
    value: FilterState[K]
  ) => void;
};

export function useFilterState(initialState: FilterState) {
  const [filters, dispatch] = useReducer(filterReducer, initialState);

  const setFilterValue = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      dispatch({ type: "SET_VALUE", payload: { key, value } });
    },
    []
  );

  const resetState = useCallback((newState: FilterState) => {
    dispatch({ type: "RESET_STATE", payload: newState });
  }, []);

  const setters = useMemo<Setters>(() => {
    const createSetter =
      <K extends keyof FilterState>(key: K) =>
      (value: FilterState[K]) => {
        setFilterValue(key, value);
      };

    return (Object.keys(filterConfig) as (keyof FilterState)[]).reduce(
      (acc, key) => {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        const setterName = `set${capitalizedKey}` as keyof Setters;
        acc[setterName] = createSetter(key);
        return acc;
      },
      {} as Setters
    );
  }, [setFilterValue]);

  return {
    filters,
    resetState,
    setters,
  };
}
