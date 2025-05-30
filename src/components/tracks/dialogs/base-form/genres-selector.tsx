import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CreateTrackFormData, GenresResponse } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface GenreSelectorProps {
  form: UseFormReturn<CreateTrackFormData>;
  availableGenres: GenresResponse;
}

export function GenreSelector({ form, availableGenres }: GenreSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const selectedGenres = form.watch('genres') || [];

  const handleGenreSelect = (genre: string) => {
    const currentGenres = form.getValues('genres') || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter((g) => g !== genre)
      : [...currentGenres, genre];
    form.setValue('genres', newGenres, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className='col-span-3'>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={popoverOpen}
            aria-controls='genres-list'
            id='genres-button'
            className='w-full justify-between font-normal'
            data-testid='genre-selector'
          >
            {selectedGenres.length > 0
              ? `${selectedGenres.length} selected`
              : 'Select genres...'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
          <Command>
            <CommandInput placeholder='Search genre...' />
            <CommandList
              id='genres-list'
              className='max-h-[200px] overflow-y-auto'
            >
              <CommandEmpty>No genre found.</CommandEmpty>
              <CommandGroup>
                {availableGenres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <CommandItem
                      key={genre}
                      value={genre}
                      onSelect={() => handleGenreSelect(genre)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0',
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
        className='flex flex-wrap gap-1 mt-2 min-h-[20px]'
        aria-live='polite'
      >
        {selectedGenres.map((genre) => (
          <Badge
            key={genre}
            variant='secondary'
            className='flex items-center gap-1'
          >
            {genre}
            <button
              type='button'
              onClick={() => handleGenreSelect(genre)}
              className='rounded-full hover:bg-muted-foreground/20 p-0.5 ml-1'
              aria-label={`Remove ${genre} genre`}
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        ))}
      </div>
      {form.formState.errors.genres && (
        <p
          id='genres-error'
          className='text-red-500 text-sm mt-1'
          role='alert'
          data-testid='error-genres'
        >
          {form.formState.errors.genres?.message}
        </p>
      )}
    </div>
  );
}
