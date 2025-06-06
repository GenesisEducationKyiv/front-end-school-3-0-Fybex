import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, SORT_ORDER_OPTIONS } from "@/hooks/use-tracks-filters";

interface FiltersToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  genre: string;
  availableGenres: string[];
  onGenreChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
}

export default function FiltersToolbar({
  searchTerm,
  onSearchChange,
  genre,
  availableGenres,
  onGenreChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}: FiltersToolbarProps) {
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
      <Select
        data-testid="filter-genre"
        value={genre}
        onValueChange={onGenreChange}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filter by genre" />
        </SelectTrigger>
        <SelectContent>
          {availableGenres.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        data-testid="sort-select"
        value={sortBy}
        onValueChange={onSortChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        data-testid="sort-order-select"
        value={sortOrder}
        onValueChange={onSortOrderChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_ORDER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
