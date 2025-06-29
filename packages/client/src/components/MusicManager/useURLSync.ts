import { O, pipe } from "@mobily/ts-belt";
import { useEffect } from "react";

import useEventListener from "@/hooks/useEventListener";

import {
  type FilterState,
  filterConfig,
  ORDER_PARAM_VALUES,
  SORT_PARAM_VALUES,
} from "./filter.config";

const parseParam = <K extends keyof FilterState>(
  params: URLSearchParams,
  key: K
): FilterState[K] => {
  const config = filterConfig[key];
  return pipe(
    O.fromNullable(params.get(key)),
    O.flatMap(config.parse),
    O.getWithDefault(config.defaultValue)
  );
};

export const getInitialState = (): FilterState => {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  return Object.fromEntries(
    Object.keys(filterConfig).map((key) => [
      key,
      parseParam(params, key as keyof FilterState),
    ])
  ) as FilterState;
};

const buildURLParams = (state: FilterState): URLSearchParams => {
  const params = new URLSearchParams();

  Object.keys(filterConfig).forEach((key) => {
    const k = key as keyof FilterState;
    const config = filterConfig[k];
    const value = state[k];

    if (value !== config.defaultValue && value !== "") {
      if (key === "sort") {
        params.set(
          key,
          SORT_PARAM_VALUES[value as keyof typeof SORT_PARAM_VALUES]
        );
      } else if (key === "order") {
        params.set(
          key,
          ORDER_PARAM_VALUES[value as keyof typeof ORDER_PARAM_VALUES]
        );
      } else {
        params.set(key, String(value));
      }
    }
  });

  return params;
};

const buildNewURL = (params: URLSearchParams): string => {
  const newSearch = params.toString();
  return `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
};

const updateURL = (state: FilterState) => {
  const params = buildURLParams(state);
  const newURL = buildNewURL(params);

  if (newURL !== window.location.pathname + window.location.search) {
    window.history.pushState({}, "", newURL);
  }
};

export function useURLSync(
  filters: FilterState,
  onStateChange: (newState: FilterState) => void
) {
  useEffect(() => {
    updateURL(filters);
  }, [filters]);

  useEventListener("popstate", () => {
    onStateChange(getInitialState());
  });
}
