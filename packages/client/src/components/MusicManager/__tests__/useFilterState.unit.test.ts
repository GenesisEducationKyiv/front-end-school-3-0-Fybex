import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { FilterState } from "../filter.config";
import { filterConfig } from "../filter.config";
import {
  filterReducer,
  useFilterState,
  type FilterAction,
} from "../useFilterState";

let initialState: FilterState;
let filterKeys: (keyof FilterState)[];

beforeEach(() => {
  initialState = Object.fromEntries(
    Object.entries(filterConfig).map(([key, config]) => [
      key,
      config.defaultValue,
    ])
  ) as FilterState;

  filterKeys = Object.keys(filterConfig) as (keyof FilterState)[];
});

const createTestValue = <K extends keyof FilterState>(
  key: K,
  defaultValue: FilterState[K]
): FilterState[K] => {
  if (typeof defaultValue === "string") return `test_${key}` as FilterState[K];
  if (typeof defaultValue === "number")
    return (defaultValue + 10) as FilterState[K];
  throw new Error(`Unsupported type for key: ${key}`);
};

const createTestFilterState = (baseState: FilterState): FilterState => {
  return Object.fromEntries(
    filterKeys.map((key) => [key, createTestValue(key, baseState[key])])
  ) as FilterState;
};

describe("useFilterState", () => {
  const setup = () => {
    return renderHook(() => useFilterState(initialState));
  };

  it("should initialize with correct state", () => {
    // Arrange & Act
    const { result } = setup();

    // Assert
    expect(result.current.filters).toEqual(initialState);
  });

  it("should update state for all filter keys", () => {
    // Arrange
    const { result } = setup();
    const testValues = Object.fromEntries(
      filterKeys.map((key) => [key, createTestValue(key, initialState[key])])
    ) as FilterState;

    // Act
    act(() => {
      filterKeys.forEach((key) => {
        const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        const setter =
          result.current.setters[
            setterName as keyof typeof result.current.setters
          ];
        (setter as (value: FilterState[typeof key]) => void)(testValues[key]);
      });
    });

    // Assert
    expect(result.current.filters).toEqual(testValues);
  });

  it("should reset state to provided values", () => {
    // Arrange
    const { result } = setup();
    const resetState = createTestFilterState(initialState);

    // Act
    act(() => {
      result.current.resetState(resetState);
    });

    // Assert
    expect(result.current.filters).toEqual(resetState);
  });

  it("should maintain stable setter references", () => {
    // Arrange
    const { result, rerender } = setup();
    const initialSetters = { ...result.current.setters };

    // Act
    rerender();

    // Assert
    filterKeys.forEach((key) => {
      const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      expect(
        result.current.setters[
          setterName as keyof typeof result.current.setters
        ]
      ).toBe(initialSetters[setterName as keyof typeof initialSetters]);
    });
  });
});

describe("filterReducer", () => {
  it("should handle SET_VALUE action", () => {
    // Arrange
    const testKey = filterKeys[0];
    if (!testKey) throw new Error("testKey is undefined");
    const testValue = createTestValue(testKey, initialState[testKey]);
    const action: FilterAction = {
      type: "SET_VALUE",
      payload: { key: testKey, value: testValue },
    };

    // Act
    const newState = filterReducer(initialState, action);

    // Assert
    expect(newState[testKey]).toBe(testValue);
    expect(newState).toEqual({ ...initialState, [testKey]: testValue });
  });

  it("should handle RESET_STATE action", () => {
    // Arrange
    const resetState = createTestFilterState(initialState);
    const action: FilterAction = {
      type: "RESET_STATE",
      payload: resetState,
    };

    // Act
    const newState = filterReducer(initialState, action);

    // Assert
    expect(newState).toEqual(resetState);
  });

  it("should return current state for unknown action", () => {
    // Arrange
    const action = { type: "UNKNOWN" } as unknown as FilterAction;

    // Act
    const newState = filterReducer(initialState, action);

    // Assert
    expect(newState).toBe(initialState);
  });
});
