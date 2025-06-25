import { DataTable } from "@/components/ui/DataTable";
import { type TrackWithId } from "@/lib/api/tracks";

import { columns } from "./columns";
import { TracksTableBodySkeleton } from "./TracksTableBodySkeleton";

interface TracksTableProps {
  tracks: TrackWithId[];
  isLoading: boolean;
  currentTrack: TrackWithId | null;
  isPlaying: boolean;
  page: number;
  limit: number;
  pageSizes: number[];
  totalPages: number;
  onPlayTrack: (track: TrackWithId) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onPaginationChange: (newPage: number, newLimit: number) => void;
}

function TracksTable({
  tracks,
  isLoading,
  currentTrack,
  isPlaying,
  page,
  limit,
  pageSizes,
  totalPages,
  onPlayTrack,
  onSelectionChange,
  onPaginationChange,
}: TracksTableProps) {
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
