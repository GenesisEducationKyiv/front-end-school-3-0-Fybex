import { create } from "@music-app/proto";
import { GetTracksRequestSchema, type Track } from "@music-app/proto/tracks";
import { useMemo } from "react";

import ActionsToolbar from "@/components/ActionsToolbar";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import AudioPlayer from "@/components/AudioPlayer";
import { useAudioPlayerStore } from "@/components/AudioPlayer/useAudioPlayerStore";
import FiltersToolbar from "@/components/FiltersToolbar";
import TracksTable from "@/components/TracksTable";
import { useGetGenres } from "@/lib/api/genres";
import { useGetTracks } from "@/lib/api/tracks";

import {
  DEFAULT_PAGE,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
} from "./filter.config";
import { useTrackSelection } from "./useTrackSelection";
import { useTracksFilters } from "./useTracksFilters";

const INITIAL_DATA = {
  tracks: [],
  meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
};

export default function MusicManager() {
  const { data: genresResponse } = useGetGenres();
  const genres = genresResponse?.genres ?? [];

  const {
    genre,
    search,
    sort,
    order,
    page,
    limit,
    pageSizes,
    debouncedSearch,
    setGenre,
    setSearch,
    setSort,
    setOrder,
    setPage,
    setLimit,
  } = useTracksFilters();

  const queryOptions = create(GetTracksRequestSchema, {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(genre && { genre }),
    ...(sort && { sort }),
    ...(order && { order }),
  });

  const { data: paginatedData = INITIAL_DATA, isLoading } =
    useGetTracks(queryOptions);

  const allTracks = paginatedData.tracks;
  const tracks = useMemo(() => {
    return allTracks;
  }, [allTracks]);

  const totalPages = paginatedData.meta?.totalPages ?? DEFAULT_PAGE;

  const selection = useTrackSelection();

  const currentTrack = useAudioPlayerStore((state) => state.track);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setTrack = useAudioPlayerStore((state) => state.setTrack);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);

  const handleTrackClick = (clickedTrack: Track) => {
    if (clickedTrack.id === currentTrack?.id) {
      setIsPlaying(!isPlaying);
    } else {
      setTrack(clickedTrack);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <FiltersToolbar
          genre={genre}
          genres={genres}
          searchTerm={search}
          sortBy={sort}
          sortOptions={SORT_OPTIONS}
          sortOrder={order}
          sortOrderOptions={SORT_ORDER_OPTIONS}
          onGenreChange={setGenre}
          onSearchChange={setSearch}
          onSortChange={setSort}
          onSortOrderChange={setOrder}
        />

        <ActionsToolbar
          isDeleting={selection.isDeleting}
          selectedCount={selection.selectedTrackIds.length}
          onDelete={selection.handleDeleteSelected}
        />
      </div>

      <AppErrorBoundary
        description="There was a problem loading the tracks table. This could be due to high API usage or a server issue."
        title="Error loading tracks"
      >
        <TracksTable
          currentTrack={currentTrack}
          isLoading={isLoading}
          isPlaying={isPlaying}
          limit={limit}
          page={page}
          pageSizes={pageSizes}
          totalPages={totalPages}
          tracks={tracks}
          onPaginationChange={(newPage: number, newLimit: number) => {
            setPage(newPage);
            setLimit(newLimit);
          }}
          onPlayTrack={handleTrackClick}
          onSelectionChange={selection.handleSelectionChange}
        />
      </AppErrorBoundary>

      <AudioPlayer />
    </>
  );
}
