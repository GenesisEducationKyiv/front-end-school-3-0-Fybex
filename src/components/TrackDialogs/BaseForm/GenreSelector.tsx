import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { type Genre, type Genres } from "@/lib/api/genres";
import { type BaseTrackFormData } from "@/lib/api/tracks";
import { cn } from "@/lib/utils";

interface GenreSelectorProps {
  availableGenres: Genres;
  form: UseFormReturn<BaseTrackFormData>;
}

export default function GenreSelector({
  form,
  availableGenres,
}: GenreSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const selectedGenres = form.watch("genres");

  const handleGenreSelect = (genre: Genre) => {
    const currentGenres = form.getValues("genres");
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g) => g !== genre)
      : [...currentGenres, genre];
    form.setValue("genres", newGenres, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="col-span-3">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-controls="genres-list"
            aria-expanded={popoverOpen}
            className="w-full justify-between font-normal"
            data-testid="genre-selector"
            id="genres-button"
            role="combobox"
            variant="outline"
          >
            {selectedGenres.length > 0
              ? `${selectedGenres.length.toString()} selected`
              : "Select genres..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search genre..." />
            <CommandList
              className="max-h-[200px] overflow-y-auto"
              data-testid="genre-options-list"
              id="genres-list"
            >
              <CommandEmpty>No genre found.</CommandEmpty>
              <CommandGroup>
                {availableGenres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <CommandItem
                      data-testid={`genre-option-${genre
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      key={genre}
                      value={genre}
                      onSelect={() => {
                        handleGenreSelect(genre);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {genre}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div
        aria-live="polite"
        className="flex flex-wrap gap-1 mt-2 min-h-[20px]"
      >
        {selectedGenres.map((genre) => (
          <Badge
            className="flex items-center gap-1"
            key={genre}
            variant="secondary"
          >
            {genre}
            <button
              aria-label={`Remove ${genre} genre`}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5 ml-1"
              type="button"
              onClick={() => {
                handleGenreSelect(genre);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      {form.formState.errors.genres && (
        <p
          className="text-red-500 text-sm mt-1"
          data-testid="error-genres"
          id="genres-error"
          role="alert"
        >
          {form.formState.errors.genres.message}
        </p>
      )}
    </div>
  );
}
