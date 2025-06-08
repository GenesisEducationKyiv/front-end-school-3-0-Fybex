import ActionsToolbar from "@/components/ActionsToolbar";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import AudioPlayer from "@/components/AudioPlayer";
import { useAudioPlayerStore } from "@/components/AudioPlayer/useAudioPlayerStore";
import FiltersToolbar from "@/components/FiltersToolbar";
import TracksTable from "@/components/TracksTable";
import { useGetGenres } from "@/lib/api/genres";
import { type TrackWithId } from "@/lib/api/tracks";

import { SORT_OPTIONS, SORT_ORDER_OPTIONS } from "./useFilterState";
import { useTrackSelection } from "./useTrackSelection";
import { useTracksFilters } from "./useTracksFilters";

export default function MusicManager() {
  const { data: genres = [] } = useGetGenres();

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

  const selection = useTrackSelection();

  const currentTrack = useAudioPlayerStore((state) => state.track);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setTrack = useAudioPlayerStore((state) => state.setTrack);
  const togglePlayPause = useAudioPlayerStore((state) => state.togglePlayPause);

  const handleTrackClick = (clickedTrack: TrackWithId) => {
    if (clickedTrack.id === currentTrack?.id) {
      togglePlayPause();
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
          genre={genre}
          isPlaying={isPlaying}
          limit={limit}
          page={page}
          pageSizes={pageSizes}
          searchTerm={debouncedSearch}
          sortBy={sort}
          sortOrder={order}
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
