import { useState } from 'react';

import { useAudioPlayerStore } from '@/components/player/use-audio-player-store';
import { useTracks } from '@/components/tracks/use-tracks';
import { FetchTracksOptions } from '@/lib/api';
import { Track } from '@/lib/schemas';

import { columns } from './columns';
import { TracksTableBodySkeleton } from './skeleton';
import { DataTable } from '../../ui/data-table';

interface TracksTableProps {
  onPlayTrack?: (track: Track) => void;
  currentTrack?: Track | null;
  searchTerm?: string;
  genre?: string;
  sortBy?: FetchTracksOptions['sort'];
  sortOrder?: FetchTracksOptions['order'];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

const initialData = {
  data: [],
  meta: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
};

const PAGE_SIZES = [10, 20, 30, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

function TracksTable({
  onPlayTrack,
  currentTrack,
  searchTerm,
  genre,
  sortBy,
  sortOrder,
  onSelectionChange,
}: TracksTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data: paginatedData = initialData, isLoading } = useTracks({
    page: pageIndex + 1,
    limit: pageSize,
    search: searchTerm,
    genre: genre,
    sort: sortBy,
    order: sortOrder,
  });

  const tracks = paginatedData.data;
  const totalPages = paginatedData.meta.totalPages;

  const globalTrack = useAudioPlayerStore((state) => state.track);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);

  return (
    <DataTable
      columns={columns}
      data={tracks}
      isLoading={isLoading}
      pageCount={totalPages}
      pageIndex={pageIndex}
      pageSize={pageSize}
      pageSizes={PAGE_SIZES}
      onRowSelectionChange={onSelectionChange}
      onPaginationChange={(newPageIndex, newPageSize) => {
        setPageIndex(newPageIndex);
        setPageSize(newPageSize);
      }}
      meta={{
        onPlayTrack,
        currentTrack,
        globalTrack,
        isPlaying,
      }}
      LoadingSkeletonComponent={(props) => (
        <TracksTableBodySkeleton {...props} columns={columns} />
      )}
    />
  );
}

export default TracksTable;
