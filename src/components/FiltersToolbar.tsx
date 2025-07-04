import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { SortField, SortOrder } from "@/lib/api/tracks";

const ALL_GENRES = "All Genres";
const NO_GENRES = "No genres found";

interface FiltersToolbarProps {
  searchTerm: string;
  genre: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  sortOptions: { label: string; value: SortField }[];
  sortOrderOptions: { label: string; value: SortOrder }[];
  genres: string[];
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onSortChange: (value: SortField) => void;
  onSortOrderChange: (value: SortOrder) => void;
}

export default function FiltersToolbar({
  searchTerm,
  genre,
  sortBy,
  sortOrder,
  genres: rawGenres,
  sortOptions,
  sortOrderOptions,
  onSearchChange,
  onGenreChange,
  onSortChange,
  onSortOrderChange,
}: FiltersToolbarProps) {
  const genres =
    rawGenres.length > 0 ? [ALL_GENRES, ...rawGenres] : [NO_GENRES];

  const handleGenreChange = (value: string) => {
    onGenreChange(![NO_GENRES, ALL_GENRES].includes(value) ? value : "");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        className="max-w-sm"
        data-testid="search-input"
        placeholder="Search by title, artist, album..."
        value={searchTerm}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
      />
      <Select value={genre} onValueChange={handleGenreChange}>
        <SelectTrigger className="w-[220px]" data-testid="filter-genre">
          <SelectValue placeholder="Filter by genre" />
        </SelectTrigger>
        <SelectContent>
          {genres.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]" data-testid="sort-select">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sortOrder} onValueChange={onSortOrderChange}>
        <SelectTrigger className="w-[150px]" data-testid="sort-order-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOrderOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
