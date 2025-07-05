import { faker } from "@faker-js/faker";
import {
  SortField,
  SortOrder,
  type create,
  type DeleteTracksRequestSchema,
} from "@music-app/proto";
import { act, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

import { useDeleteTracks } from "@/lib/api/tracks";

import {
  DEFAULT_ARTIST,
  DEFAULT_GENRE,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_TERM,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
  ORDER_PARAM_VALUES,
  PAGE_SIZES,
  SORT_PARAM_VALUES,
  type FilterState,
} from "../filter.config";
import { useTrackSelection } from "../useTrackSelection";
import { useTracksFilters } from "../useTracksFilters";

const createTestData = () => {
  const nonDefaultSorts = Object.values(SortField).filter(
    (v) => v !== DEFAULT_SORT_FIELD && typeof v === "number"
  ) as SortField[];
  const nonDefaultOrders = Object.values(SortOrder).filter(
    (v) => v !== DEFAULT_SORT_ORDER && typeof v === "number"
  ) as SortOrder[];
  return {
    search: faker.lorem.words(faker.number.int({ min: 1, max: 3 })),
    genre: faker.music.genre(),
    artist: faker.person.fullName(),
    page: faker.number.int({ min: 2, max: 10 }),
    limit: faker.helpers.arrayElement(
      PAGE_SIZES.filter((size) => size !== DEFAULT_PAGE_SIZE)
    ),
    sort: faker.helpers.arrayElement(nonDefaultSorts),
    order: faker.helpers.arrayElement(nonDefaultOrders),
    trackIds: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
      faker.string.uuid()
    ),
  };
};

vi.mock("@/lib/api/tracks");
vi.mock("@/hooks/useDebounce", () => ({
  default: (value: string) => value,
}));

let originalUrl: string;

const defaultData: FilterState = {
  search: DEFAULT_SEARCH_TERM,
  artist: DEFAULT_ARTIST,
  genre: DEFAULT_GENRE,
  page: DEFAULT_PAGE,
  limit: DEFAULT_PAGE_SIZE,
  sort: DEFAULT_SORT_FIELD,
  order: DEFAULT_SORT_ORDER,
};

const setFilters = (
  filters: ReturnType<typeof useTracksFilters>,
  testData: FilterState
) => {
  filters.setSearch(testData.search);
  filters.setGenre(testData.genre);
  filters.setArtist(testData.artist);
  filters.setPage(testData.page);
  filters.setLimit(testData.limit);
  filters.setSort(testData.sort);
  filters.setOrder(testData.order);
};

const expectURLParams = (expectedParams: URLSearchParams) => {
  const actualParams = new URLSearchParams(window.location.search);
  for (const [key, value] of expectedParams.entries()) {
    expect(actualParams.get(key)).toBe(value);
  }
  expect(actualParams.size).toBe(expectedParams.size);
};

describe("useTracksFilters", () => {
  let mockDeleteMutate: Mock<
    (
      deleteRequest: ReturnType<
        typeof create<typeof DeleteTracksRequestSchema>
      >,
      options: {
        onSuccess: (result: { success: string[]; failed: string[] }) => void;
        onError: (error: Error) => void;
      }
    ) => void
  >;

  beforeEach(() => {
    mockDeleteMutate = vi.fn();
    (useDeleteTracks as Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });

    originalUrl = window.location.href;
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    if (originalUrl) {
      window.history.replaceState({}, "", originalUrl);
    }
    vi.clearAllMocks();
  });

  const setup = () => {
    const filtersResult = renderHook(() => useTracksFilters());
    const selectionResult = renderHook(() => useTrackSelection());
    return {
      filters: filtersResult.result,
      selection: selectionResult.result,
    };
  };

  const getCurrentParams = () => new URLSearchParams(window.location.search);

  it.each([
    {
      name: "default parameters",
      setters: (filters: ReturnType<typeof useTracksFilters>) => {
        setFilters(filters, defaultData);
      },
      expectedParams: () => new URLSearchParams(),
    },
    {
      name: "all filter parameters",
      setters: (
        filters: ReturnType<typeof useTracksFilters>,
        testData: ReturnType<typeof createTestData>
      ) => {
        setFilters(filters, testData);
      },
      expectedParams: (testData: ReturnType<typeof createTestData>) => {
        const params = new URLSearchParams();

        const isDefault = (key: keyof FilterState, value: string) =>
          value == defaultData[key];
        const setIfNotDefault = (key: keyof FilterState, value: string) => {
          if (!isDefault(key, value)) {
            params.set(key, value);
          }
        };

        for (const key of Object.keys(testData) as (keyof ReturnType<
          typeof createTestData
        >)[]) {
          if (key !== "trackIds") {
            const value = testData[key];
            if (key === "sort") {
              const mapped =
                SORT_PARAM_VALUES[value as keyof typeof SORT_PARAM_VALUES];
              setIfNotDefault(key, mapped);
            } else if (key === "order") {
              const mapped =
                ORDER_PARAM_VALUES[value as keyof typeof ORDER_PARAM_VALUES];
              setIfNotDefault(key, mapped);
            } else {
              setIfNotDefault(key, value.toString());
            }
          }
        }
        return params;
      },
    },
    {
      name: "only search and genre",
      setters: (
        filters: ReturnType<typeof useTracksFilters>,
        testData: ReturnType<typeof createTestData>
      ) => {
        filters.setSearch(testData.search);
        filters.setGenre(testData.genre);
      },
      expectedParams: (testData: ReturnType<typeof createTestData>) =>
        new URLSearchParams({
          search: testData.search,
          genre: testData.genre,
        }),
    },
    {
      name: "only pagination parameters",
      setters: (
        filters: ReturnType<typeof useTracksFilters>,
        testData: ReturnType<typeof createTestData>
      ) => {
        filters.setPage(testData.page);
        filters.setLimit(testData.limit);
      },
      expectedParams: (testData: ReturnType<typeof createTestData>) =>
        new URLSearchParams({
          page: testData.page.toString(),
          limit: testData.limit.toString(),
        }),
    },
    {
      name: "only sorting with non-default order",
      setters: (filters: ReturnType<typeof useTracksFilters>) => {
        filters.setSort(SortField.TITLE);
        filters.setOrder(SortOrder.ASC);
      },
      expectedParams: () =>
        new URLSearchParams({
          sort: "title",
          order: "asc",
        }),
    },
  ])(
    "should synchronize filter state to URL: $name",
    ({ setters, expectedParams }) => {
      const { filters } = setup();
      const testData = createTestData();
      act(() => {
        setters(filters.current, testData);
      });
      const expectedParams_ = expectedParams(testData);
      expectURLParams(expectedParams_);
    }
  );

  it("should not change URL when setting default values", () => {
    const { filters } = setup();

    act(() => {
      filters.current.setPage(DEFAULT_PAGE);
      filters.current.setLimit(DEFAULT_PAGE_SIZE);
      filters.current.setSearch(DEFAULT_SEARCH_TERM);
      filters.current.setGenre(DEFAULT_GENRE);
    });

    expect(getCurrentParams().toString()).toBe("");
  });

  it("should remove parameters from URL when setting back to defaults", () => {
    const { filters } = setup();
    const testData = createTestData();

    act(() => {
      filters.current.setSearch(testData.search);
      filters.current.setPage(testData.page);
    });
    const params = getCurrentParams();
    expect(params.get("search")).toBe(testData.search);
    expect(params.get("page")).toBe(testData.page.toString());

    act(() => {
      filters.current.setSearch(DEFAULT_SEARCH_TERM);
      filters.current.setPage(DEFAULT_PAGE);
    });
    expect(getCurrentParams().toString()).toBe("");
  });

  it("should handle complete user workflow: filter -> select -> delete", () => {
    const { filters, selection } = setup();
    const testData = createTestData();
    mockDeleteMutate.mockImplementation((deleteRequest, options) => {
      options.onSuccess({ success: deleteRequest.ids, failed: [] });
    });

    act(() => {
      filters.current.setSearch(testData.search);
      filters.current.setGenre(testData.genre);
    });
    act(() => {
      selection.current.handleSelectionChange(testData.trackIds);
    });
    act(() => {
      selection.current.handleDeleteSelected();
    });

    expect(filters.current.search).toBe(testData.search);
    expect(filters.current.genre).toBe(testData.genre);
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: testData.trackIds,
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function) as unknown,
        onError: expect.any(Function) as unknown,
      })
    );
    expect(selection.current.selectedTrackIds).toEqual([]);
  });

  it("should restore filter state from URL on page load", () => {
    const testData = createTestData();
    const params = new URLSearchParams({
      search: testData.search,
      genre: testData.genre,
      page: testData.page.toString(),
      limit: testData.limit.toString(),
    });
    window.history.replaceState({}, "", `/?${params.toString()}`);

    const { filters } = setup();
    expect(filters.current.search).toBe(testData.search);
    expect(filters.current.genre).toBe(testData.genre);
    expect(filters.current.page).toBe(testData.page);
    expect(filters.current.limit).toBe(testData.limit);
  });

  it("should handle delete failure gracefully", () => {
    const { selection } = setup();
    const { trackIds: trackIdsToDelete } = createTestData();

    mockDeleteMutate.mockImplementation((_deleteRequest, opts) => {
      opts.onError(new Error());
    });

    act(() => {
      selection.current.handleSelectionChange(trackIdsToDelete);
    });
    act(() => {
      selection.current.handleDeleteSelected();
    });

    expect(selection.current.selectedTrackIds).toEqual(trackIdsToDelete);
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: trackIdsToDelete,
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function) as unknown,
        onError: expect.any(Function) as unknown,
      })
    );
  });

  it("should handle browser back/forward with popstate", () => {
    const {
      search: origSearch,
      genre: origGenre,
      page: origPage,
    } = createTestData();
    const { search, genre, page } = createTestData();
    const params = new URLSearchParams({
      search: origSearch,
      genre: origGenre,
      page: origPage.toString(),
    });
    window.history.replaceState({}, "", `/?${params.toString()}`);

    const { filters } = setup();
    expect(filters.current.search).toBe(origSearch);
    expect(filters.current.genre).toBe(origGenre);
    expect(filters.current.page).toBe(origPage);

    act(() => {
      filters.current.setSearch(search);
      filters.current.setGenre(genre);
      filters.current.setPage(page);
    });

    act(() => {
      window.history.replaceState({}, "", `/?${params.toString()}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(filters.current.search).toBe(origSearch);
    expect(filters.current.genre).toBe(origGenre);
    expect(filters.current.page).toBe(origPage);
  });

  it("should clear filters on empty popstate", () => {
    const { filters } = setup();
    const { search, genre, page } = createTestData();
    act(() => {
      filters.current.setSearch(search);
      filters.current.setGenre(genre);
      filters.current.setPage(page);
    });

    expect(filters.current.search).toBe(search);
    expect(filters.current.genre).toBe(genre);
    expect(filters.current.page).toBe(page);

    act(() => {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(filters.current.search).toBe(DEFAULT_SEARCH_TERM);
    expect(filters.current.genre).toBe(DEFAULT_GENRE);
    expect(filters.current.page).toBe(DEFAULT_PAGE);
  });

  it.each([
    {
      name: "invalid parameters should fall back to defaults",
      search: "?page=0&limit=7&sort=invalidSort&order=invalidOrder",
      expected: defaultData,
    },
    {
      name: "negative and non-numeric values should fall back to defaults",
      search: "?page=-5&limit=xyz&sort=&order=",
      expected: defaultData,
    },
    {
      name: "mixed invalid parameters should fall back to defaults",
      search: "?page=abc&limit=0",
      expected: defaultData,
    },
    {
      name: "whitespace should be trimmed from string parameters",
      search: "?search=%20test%20&artist=%20John%20Doe%20&genre=%20Rock%20",
      expected: {
        ...defaultData,
        search: "test",
        artist: "John Doe",
        genre: "Rock",
      },
    },
    {
      name: "mixed valid and invalid parameters with fallbacks",
      search:
        "?search=valid&genre=Jazz&page=1&limit=999&sort=createdAt&order=invalidOrder",
      expected: {
        ...defaultData,
        search: "valid",
        genre: "Jazz",
      },
    },
  ])("should handle URL parameters: $name", ({ search, expected }) => {
    window.history.replaceState({}, "", `/${search}`);
    const { filters } = setup();

    expect(filters.current.search).toBe(expected.search);
    expect(filters.current.artist).toBe(expected.artist);
    expect(filters.current.genre).toBe(expected.genre);
    expect(filters.current.page).toBe(expected.page);
    expect(filters.current.limit).toBe(expected.limit);
    expect(filters.current.sort).toBe(expected.sort);
    expect(filters.current.order).toBe(expected.order);
  });

  it("should debounce search before syncing to URL", () => {
    let resolveDebounce: (() => void) | undefined;
    vi.doMock("@/hooks/useDebounce", () => ({
      default: (value: string) =>
        new Promise<string>((resolve) => {
          resolveDebounce = () => {
            resolve(value);
          };
        }),
    }));
    const { filters } = setup();
    const testData = createTestData();

    act(() => {
      filters.current.setSearch(testData.search);
    });

    // shouldn't immediately update
    const params = getCurrentParams();
    expect(params.get("search")).toBe(testData.search);

    // should update after debounce
    act(() => {
      if (resolveDebounce) resolveDebounce();
    });
    expect(params.get("search")).toBe(testData.search);
  });
});
