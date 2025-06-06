import { useReducer, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { useGetGenres, type Genre } from "@/lib/api/genres";
import { type SortField, type SortOrder } from "@/lib/api/tracks";

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
  ([value, label]) => ({
    value: value,
    label,
  })
);

export const SORT_ORDER_OPTIONS = Object.entries(SORT_ORDER_LABELS).map(
  ([value, label]) => ({
    value: value,
    label,
  })
);

const isSortField = (value: string): value is SortField => {
  return Object.keys(SORT_FIELD_LABELS).includes(value);
};

const isSortOrder = (value: string): value is SortOrder => {
  return Object.keys(SORT_ORDER_LABELS).includes(value);
};

const ALL_GENRES = "All Genres";

const genreDisplayToValue = (displayValue: string): Genre =>
  displayValue === ALL_GENRES ? "" : displayValue;

export function useTracksFilters() {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  const { data: rawAvailableGenres = [] } = useGetGenres();
  const availableGenres = [ALL_GENRES, ...rawAvailableGenres];

  const [genre, dispatchGenre] = useReducer(
    (_: Genre, displayValue: string) => genreDisplayToValue(displayValue),
    ALL_GENRES,
    genreDisplayToValue
  );

  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSortChange = (value: string) => {
    if (isSortField(value)) {
      setSortBy(value);
    }
  };

  const handleSortOrderChange = (value: string) => {
    if (isSortOrder(value)) {
      setSortOrder(value);
    }
  };

  return {
    // Search
    searchTerm: debouncedSearchTerm,
    localSearchTerm,
    setLocalSearchTerm,

    // Genre filtering
    genre,
    availableGenres,
    setGenre: dispatchGenre,

    // Sorting
    sortBy,
    sortOrder,
    handleSortChange,
    handleSortOrderChange,
  };
}
