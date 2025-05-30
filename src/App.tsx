import './App.css';

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';

import AudioPlayer from '@/components/player';
import { useAudioPlayerStore } from '@/components/player/use-audio-player-store';
import CreateTrackDialog from '@/components/tracks/dialogs/create-track-dialog';
import TracksTable from '@/components/tracks/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AnimatedTitle from '@/components/ui/animated-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { useApiQuery } from '@/hooks/use-api-query';
import { useDebounce } from '@/hooks/use-debounce';
import { deleteTrack, fetchGenres, FetchTracksOptions } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { GenresResponse, Track } from '@/lib/schemas';

const sortOptions: { value: FetchTracksOptions['sort']; label: string }[] = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'title', label: 'Title' },
  { value: 'artist', label: 'Artist' },
  { value: 'album', label: 'Album' },
];

function App() {
  const [genre, setGenre] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  const [sortBy, setSortBy] = useState<FetchTracksOptions['sort']>('createdAt');
  const [sortOrder, setSortOrder] =
    useState<FetchTracksOptions['order']>('desc');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const { data: availableGenres = [] } = useApiQuery<GenresResponse, Error>({
    queryKey: queryKeys.genres.list(),
    queryFn: fetchGenres,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation<
    PromiseSettledResult<void>[],
    Error,
    string[]
  >({
    mutationFn: async (ids) => {
      return Promise.allSettled(ids.map((id) => deleteTrack(id)));
    },
    onSuccess: (results) => {
      const successfulDeletes = results.filter((r) => r.status === 'fulfilled');
      const failedDeletes = results.filter((r) => r.status === 'rejected');

      if (successfulDeletes.length > 0) {
        toast.success(
          `${successfulDeletes.length} track${
            successfulDeletes.length > 1 ? 's' : ''
          } deleted successfully!`,
        );
      }
      if (failedDeletes.length > 0) {
        toast.error(
          `Failed to delete ${failedDeletes.length} track${
            failedDeletes.length > 1 ? 's' : ''
          }.`,
          {
            description: 'Please check the console or server logs for details.',
          },
        );
        failedDeletes.forEach((failure) => {
          if (failure.status === 'rejected') {
            console.error('Delete failed:', failure.reason);
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all });
      setSelectedTrackIds([]);
    },
    onError: (error) => {
      toast.error(`Failed to delete tracks: ${error.message}`);
    },
  });

  const handleSelectionChange = (selectedIds: (string | number)[]) => {
    setSelectedTrackIds(selectedIds as string[]);
  };

  const handleDeleteSelected = () => {
    if (selectedTrackIds.length > 0) {
      deleteMutation.mutate(selectedTrackIds);
    }
  };

  const currentStoreTrack = useAudioPlayerStore((state) => state.track);
  const setTrack = useAudioPlayerStore((state) => state.setTrack);
  const togglePlayPause = useAudioPlayerStore((state) => state.togglePlayPause);
  const { reset } = useQueryErrorResetBoundary();

  const handleTrackClick = (clickedTrack: Track) => {
    if (clickedTrack.id === currentStoreTrack?.id) {
      togglePlayPause();
    } else {
      setTrack(clickedTrack);
    }
  };

  return (
    <div className='min-h-screen p-8'>
      <AnimatedTitle
        baseTitle='sona.'
        animatedSuffix={' music tracks manager'}
        data-testid='tracks-header'
      />

      <div className='flex justify-between items-center mb-4'>
        <div className='flex flex-col sm:flex-row gap-2'>
          <Input
            placeholder='Search by title, artist, album...'
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className='max-w-sm'
            data-testid='search-input'
          />
          <Select
            value={genre || 'all'}
            onValueChange={(value) => setGenre(value === 'all' ? '' : value)}
            data-testid='filter-genre'
          >
            <SelectTrigger className='w-[220px]'>
              <SelectValue placeholder='Filter by genre' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Genres</SelectItem>
              {availableGenres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as FetchTracksOptions['sort'])
            }
            data-testid='sort-select'
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort by...' />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value!}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value) =>
              setSortOrder(value as FetchTracksOptions['order'])
            }
            data-testid='sort-order-select'
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Ascending</SelectItem>
              <SelectItem value='desc'>Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center gap-2'>
          {selectedTrackIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='destructive'
                  data-testid='bulk-delete-button'
                  size='sm'
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Delete ({selectedTrackIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the selected{' '}
                    <span className='font-semibold'>
                      {selectedTrackIds.length} track
                      {selectedTrackIds.length > 1 ? 's' : ''}
                    </span>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid='cancel-bulk-delete'>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    disabled={deleteMutation.isPending}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    data-testid='confirm-bulk-delete'
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <CreateTrackDialog>
            <Button data-testid='create-track-button' size='sm'>
              Create Track
            </Button>
          </CreateTrackDialog>
        </div>
      </div>

      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className='text-destructive p-4 border border-destructive bg-destructive/10 rounded-md text-center'>
            <p>Error loading tracks: {error.message}</p>
            <Button
              variant='destructive'
              size='sm'
              onClick={resetErrorBoundary}
              className='mt-2'
            >
              Try again
            </Button>
          </div>
        )}
      >
        <TracksTable
          onPlayTrack={handleTrackClick}
          currentTrack={currentStoreTrack}
          onSelectionChange={handleSelectionChange}
          searchTerm={debouncedSearchTerm}
          genre={genre}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </ErrorBoundary>

      <AudioPlayer />

      <Toaster data-testid='toast-container' />
    </div>
  );
}

export default App;
