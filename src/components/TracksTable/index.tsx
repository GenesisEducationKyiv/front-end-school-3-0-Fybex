import { useMemo } from "react";

import { DataTable } from "@/components/ui/DataTable";
import { type Genre } from "@/lib/api/genres";
import {
  useGetTracks,
  type FetchTracksOptions,
  type Track,
  type TrackWithId,
} from "@/lib/api/tracks";

import { columns } from "./columns";
import { TracksTableBodySkeleton } from "./TracksTableBodySkeleton";

interface TracksTableProps {
  currentTrack: TrackWithId | null;
  isPlaying: boolean;
  searchTerm: string;
  genre: Genre;
  sortBy: FetchTracksOptions["sort"];
  sortOrder: FetchTracksOptions["order"];
  page: number;
  limit: number;
  pageSizes: number[];
  onPlayTrack: (track: TrackWithId) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onPaginationChange: (newPage: number, newLimit: number) => void;
}

const INITIAL_DATA = {
  data: [],
  meta: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
};

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
  page,
  limit,
  pageSizes,
  onPlayTrack,
  onSelectionChange,
  onPaginationChange,
}: TracksTableProps) {
  const queryOptions: FetchTracksOptions = {
    page,
    limit,
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
    <DataTable
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
      pageIndex={page - 1}
      pageSize={limit}
      pageSizes={pageSizes}
      onPaginationChange={(newPageIndex, newPageSize) => {
        onPaginationChange(newPageIndex + 1, newPageSize);
      }}
      onRowSelectionChange={(rowIds) => {
        onSelectionChange(rowIds.map((id) => id.toString()));
      }}
    />
  );
}

export default TracksTable;
