import { useMemo, useState } from "react";

import { DataTable } from "@/components/ui/DataTable";
import { type Genre } from "@/lib/api/genres";
import {
  useGetTracks,
  type FetchTracksOptions,
  type Track,
  type TrackWithId,
} from "@/lib/api/tracks";

import { columns, type TrackTableMeta } from "./columns";
import { TracksTableBodySkeleton } from "./TracksTableBodySkeleton";

interface TracksTableProps {
  currentTrack: TrackWithId | null;
  isPlaying: boolean;
  searchTerm: string;
  genre: Genre;
  sortBy: FetchTracksOptions["sort"];
  sortOrder: FetchTracksOptions["order"];
  onPlayTrack: (track: TrackWithId) => void;
  onSelectionChange: (selectedIds: string[]) => void;
}

const INITIAL_DATA = {
  data: [],
  meta: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
};
const PAGE_SIZES = [10, 20, 30, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

const hasValidId = (track: Track): track is TrackWithId => {
  return typeof track.id === "string" && track.id.length > 0;
};

const filterTracks = (tracks: Track[]): TrackWithId[] => {
  return tracks.filter(hasValidId);
};

function TracksTable({
  currentTrack,
  isPlaying,
  searchTerm,
  genre,
  sortBy,
  sortOrder,
  onPlayTrack,
  onSelectionChange,
}: TracksTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const queryOptions: FetchTracksOptions = {
    page: pageIndex + 1,
    limit: pageSize,
    search: searchTerm,
    genre: genre,
    sort: sortBy,
    order: sortOrder,
    artist: undefined, // * "search" is used instead
  };

  const { data: paginatedData = INITIAL_DATA, isLoading } =
    useGetTracks(queryOptions);

  const allTracks = paginatedData.data;
  const tracks = useMemo(() => {
    return filterTracks(allTracks ?? []);
  }, [allTracks]);

  const totalPages = paginatedData.meta?.totalPages ?? 0;

  return (
    <DataTable<TrackWithId, TrackTableMeta>
      LoadingSkeletonComponent={(props) => (
        <TracksTableBodySkeleton {...props} columns={columns} />
      )}
      columns={columns}
      data={tracks}
      isLoading={isLoading}
      meta={{
        currentTrack,
        isPlaying,
        onPlayTrack,
      }}
      pageCount={totalPages}
      pageIndex={pageIndex}
      pageSize={pageSize}
      pageSizes={PAGE_SIZES}
      onPaginationChange={(newPageIndex, newPageSize) => {
        setPageIndex(newPageIndex);
        setPageSize(newPageSize);
      }}
      onRowSelectionChange={(rowIds) => {
        onSelectionChange(rowIds.map((id) => id.toString()));
      }}
    />
  );
}

export default TracksTable;
