import { useCallback, useMemo, useReducer } from "react";

import { type FilterState, filterConfig } from "./filter.config";

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
