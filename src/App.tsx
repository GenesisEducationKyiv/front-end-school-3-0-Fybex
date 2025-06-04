import "./App.css";

import { AppErrorBoundary } from "@/components/error-boundary";
import AudioPlayer from "@/components/player";
import { useAudioPlayerStore } from "@/components/player/use-audio-player-store";
import ActionsToolbar from "@/components/tracks/actions-toolbar";
import FiltersToolbar from "@/components/tracks/filters-toolbar";
import TracksTable from "@/components/tracks/table";
import AnimatedTitle from "@/components/ui/animated-title";
import { Toaster } from "@/components/ui/sonner";
import { useTrackSelection } from "@/hooks/use-track-selection";
import { useTracksFilters } from "@/hooks/use-tracks-filters";
import { type TrackWithId } from "@/lib/api/types";

function TracksManager() {
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

function App() {
  return (
    <AppErrorBoundary
      description="Something went wrong with the application. This could be due to high API usage, network issues, or a server problem."
      title="Application Error"
    >
      <div className="min-h-screen p-8">
        <AnimatedTitle
          animatedSuffix={" music tracks manager"}
          baseTitle="sona."
          data-testid="tracks-header"
        />

        <AppErrorBoundary
          description="There was a problem with the tracks manager. This could be due to high API usage or connectivity issues."
          title="Tracks Manager Error"
        >
          <TracksManager />
        </AppErrorBoundary>

        <Toaster data-testid="toast-container" />
      </div>
    </AppErrorBoundary>
  );
}

export default App;
