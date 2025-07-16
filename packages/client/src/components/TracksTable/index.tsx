import { type Track } from "@music-app/proto/tracks";
import { memo, useCallback, useMemo } from "react";

import { useTrackSelectionStore } from "@/components/MusicManager/useTrackSelectionStore";
import { DataTable } from "@/components/ui/DataTable";

import { columns } from "./columns";
import { TracksTableBodySkeleton } from "./TracksTableBodySkeleton";

interface TracksTableProps {
  tracks: Track[];
  isLoading: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  page: number;
  limit: number;
  pageSizes: number[];
  totalPages: number;
  onPlayTrack: (track: Track) => void;
  onPaginationChange: (newPage: number, newLimit: number) => void;
}

const TracksTable = memo<TracksTableProps>(
  ({
    tracks,
    isLoading,
    currentTrack,
    isPlaying,
    page,
    limit,
    pageSizes,
    totalPages,
    onPlayTrack,
    onPaginationChange,
  }) => {
    const handleSelectionChange = useTrackSelectionStore(
      (state) => state.handleSelectionChange
    );

    const LoadingSkeletonComponent = useMemo(
      () => (props: { rowCount: number; columns: typeof columns }) =>
        <TracksTableBodySkeleton {...props} columns={columns} />,
      []
    );

    const meta = useMemo(
      () => ({
        currentTrack,
        isPlaying,
        onPlayTrack,
      }),
      [currentTrack, isPlaying, onPlayTrack]
    );

    const handlePaginationChange = useCallback(
      (newPageIndex: number, newPageSize: number) => {
        onPaginationChange(newPageIndex + 1, newPageSize);
      },
      [onPaginationChange]
    );

    // Memoize the row selection callback
    const handleRowSelectionChange = useCallback(
      (rowIds: (string | number)[]) => {
        handleSelectionChange(rowIds.map((id) => id.toString()));
      },
      [handleSelectionChange]
    );

    return (
      <DataTable
        LoadingSkeletonComponent={LoadingSkeletonComponent}
        columns={columns}
        data={tracks}
        isLoading={isLoading}
        meta={meta}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        pageSizes={pageSizes}
        onPaginationChange={handlePaginationChange}
        onRowSelectionChange={handleRowSelectionChange}
      />
    );
  }
);

export default TracksTable;
