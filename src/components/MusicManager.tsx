import AppErrorBoundary from "@/components/AppErrorBoundary";
import AudioPlayer from "@/components/AudioPlayer";
import { useAudioPlayerStore } from "@/components/AudioPlayer/useAudioPlayerStore";
import ActionsToolbar from "@/components/tracks/ActionsToolbar";
import FiltersToolbar from "@/components/tracks/FiltersToolbar";
import TracksTable from "@/components/tracks/TracksTable";
import { useTrackSelection } from "@/hooks/useTrackSelection";
import { useTracksFilters } from "@/hooks/useTracksFilters";
import { type TrackWithId } from "@/lib/api/tracks";

export default function MusicManager() {
  const filters = useTracksFilters();
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
          availableGenres={filters.availableGenres}
          genre={filters.genre}
          searchTerm={filters.localSearchTerm}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onGenreChange={filters.setGenre}
          onSearchChange={filters.setLocalSearchTerm}
          onSortChange={filters.handleSortChange}
          onSortOrderChange={filters.handleSortOrderChange}
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
          genre={filters.genre}
          isPlaying={isPlaying}
          searchTerm={filters.searchTerm}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onPlayTrack={handleTrackClick}
          onSelectionChange={selection.handleSelectionChange}
        />
      </AppErrorBoundary>

      <AudioPlayer />
    </>
  );
}
