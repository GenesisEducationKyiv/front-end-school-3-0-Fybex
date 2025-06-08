import useDebounce from "@/hooks/useDebounce";

import { PAGE_SIZES, useFilterState } from "./useFilterState";
import { getInitialState, useURLSync } from "./useURLSync";

export function useTracksFilters() {
  const initialState = getInitialState();

  const { filters, resetState, setters } = useFilterState(initialState);
  const debouncedSearch = useDebounce(filters.search, 300);
  useURLSync({ ...filters, search: debouncedSearch }, resetState);

  return {
    ...filters,
    ...setters,
    debouncedSearch,
    pageSizes: PAGE_SIZES,
  };
}
