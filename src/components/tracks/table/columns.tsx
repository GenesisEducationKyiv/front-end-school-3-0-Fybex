import { ColumnDef } from '@tanstack/react-table';
import { Play, Pause } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TrackCover } from '@/components/ui/track-cover';
import { Track } from '@/lib/schemas';

import { TrackActions } from './actions';

interface TrackTableMeta {
  onPlayTrack?: (track: Track) => void;
  globalTrack?: Track | null;
  isPlaying?: boolean;
}

const selectionColumn: ColumnDef<Track, unknown> = {
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label='Select all rows'
      className='translate-y-[2px]'
      data-testid='select-all'
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label='Select row'
      className='translate-y-[2px]'
      data-testid={`track-checkbox-${row.original.id}`}
      onClick={(e) => e.stopPropagation()}
    />
  ),
  enableSorting: false,
  enableHiding: false,
  size: 48,
  meta: {
    className: 'w-[48px] text-center px-1',
  },
};

export const columns: ColumnDef<Track, unknown>[] = [
  selectionColumn,
  {
    accessorKey: 'coverImage',
    header: '',
    cell: ({ row, table }) => {
      const track = row.original;
      const cover = track.coverImage;
      const meta = table.options.meta as TrackTableMeta;
      const isCurrent = meta.globalTrack?.id === track.id;
      const showPlayButton = !!track.audioFile;

      return (
        <div className='relative w-10 h-10'>
          <TrackCover
            src={cover}
            alt={track.title}
            className='w-full h-full'
            iconSize={16}
          />
          {showPlayButton && (
            <Button
              variant='ghost'
              size='icon'
              className='absolute inset-0 flex items-center justify-center w-full h-full rounded bg-black/20 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 focus-within:opacity-100'
              onClick={(e) => {
                e.stopPropagation();
                meta.onPlayTrack?.(track);
              }}
              aria-label={
                isCurrent && meta.isPlaying
                  ? `Pause ${track.title}`
                  : `Play ${track.title}`
              }
              type='button'
            >
              {isCurrent && meta.isPlaying ? (
                <Pause className='w-4 h-4 text-white' />
              ) : (
                <Play className='w-4 h-4 text-white' />
              )}
            </Button>
          )}
        </div>
      );
    },
    size: 48,
    minSize: 40,
    maxSize: 56,
    meta: {
      className: 'w-[56px] p-1',
      skeletonHeight: 'h-10',
    },
    enableSorting: false,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span data-testid={`track-item-${row.original.id}-title`}>
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: 'artist',
    header: 'Artist',
    cell: ({ row }) => (
      <span data-testid={`track-item-${row.original.id}-artist`}>
        {row.original.artist}
      </span>
    ),
  },
  {
    accessorKey: 'album',
    header: 'Album',
    cell: ({ row }) => row.original.album || '-',
  },
  {
    accessorKey: 'genres',
    header: 'Genres',
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-1'>
        {row.original.genres.map((genre: string) => (
          <Badge key={genre} variant='secondary'>
            {genre}
          </Badge>
        ))}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <TrackActions track={row.original} />,
    size: 32,
    minSize: 24,
    maxSize: 40,
    meta: {
      className: 'w-[32px] text-right',
      skeletonHeight: 'h-6',
    },
  },
];
