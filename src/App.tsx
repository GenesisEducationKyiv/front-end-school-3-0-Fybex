import "./App.css";

import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

import AudioPlayer from "@/components/player";
import { useAudioPlayerStore } from "@/components/player/use-audio-player-store";
import CreateTrackDialog from "@/components/tracks/dialogs/create-track-dialog";
import TracksTable from "@/components/tracks/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AnimatedTitle from "@/components/ui/animated-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetGenres } from "@/lib/api/genres";
import { useDeleteTracks } from "@/lib/api/tracks";
import {
  type SortField,
  type SortOrder,
  type TrackWithId,
} from "@/lib/api/types";

const SORT_FIELD_LABELS: Record<SortField, string> = {
  createdAt: "Newest",
  title: "Title",
  artist: "Artist",
  album: "Album",
} as const;

const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  asc: "Ascending",
  desc: "Descending",
} as const;

const SORT_OPTIONS = Object.entries(SORT_FIELD_LABELS).map(
  ([value, label]) => ({
    value: value,
    label,
  })
);

const SORT_ORDER_OPTIONS = Object.entries(SORT_ORDER_LABELS).map(
  ([value, label]) => ({
    value: value,
    label,
  })
);

const isSortField = (value: string): value is SortField => {
  return Object.keys(SORT_FIELD_LABELS).includes(value);
};

const isSortOrder = (value: string): value is SortOrder => {
  return Object.keys(SORT_ORDER_LABELS).includes(value);
};

function App() {
  const [genre, setGenre] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const { data: availableGenres = [] } = useGetGenres();

  const deleteMutation = useDeleteTracks();

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedTrackIds(selectedIds);
  };

  const handleSortChange = (value: string) => {
    if (isSortField(value)) {
      setSortBy(value);
    }
  };

  const handleSortOrderChange = (value: string) => {
    if (isSortOrder(value)) {
      setSortOrder(value);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTrackIds.length > 0) {
      deleteMutation.mutate(selectedTrackIds, {
        onSuccess: (result) => {
          if (result.success && result.failed) {
            const successCount = result.success.length;
            const failedCount = result.failed.length;

            if (successCount > 0) {
              toast.success(
                `${successCount.toString()} track${
                  successCount > 1 ? "s" : ""
                } deleted successfully!`
              );
            }
            if (failedCount > 0) {
              toast.error(
                `Failed to delete ${failedCount.toString()} track${
                  failedCount > 1 ? "s" : ""
                }.`,
                {
                  description:
                    "Please check the console or server logs for details.",
                }
              );
            }
          } else {
            toast.success(
              `${selectedTrackIds.length.toString()} track${
                selectedTrackIds.length > 1 ? "s" : ""
              } deleted successfully!`
            );
          }
          setSelectedTrackIds([]);
        },
        onError: (error: Error) => {
          toast.error(`Failed to delete tracks: ${error.message}`);
        },
      });
    }
  };

  const currentStoreTrack = useAudioPlayerStore((state) => state.track);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setTrack = useAudioPlayerStore((state) => state.setTrack);
  const togglePlayPause = useAudioPlayerStore((state) => state.togglePlayPause);
  const { reset } = useQueryErrorResetBoundary();

  const handleTrackClick = (clickedTrack: TrackWithId) => {
    if (clickedTrack.id === currentStoreTrack?.id) {
      togglePlayPause();
    } else {
      setTrack(clickedTrack);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <AnimatedTitle
        animatedSuffix={" music tracks manager"}
        baseTitle="sona."
        data-testid="tracks-header"
      />

      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            className="max-w-sm"
            data-testid="search-input"
            placeholder="Search by title, artist, album..."
            value={localSearchTerm}
            onChange={(e) => {
              setLocalSearchTerm(e.target.value);
            }}
          />
          <Select
            data-testid="filter-genre"
            value={genre || "all"}
            onValueChange={(value) => {
              setGenre(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {availableGenres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            data-testid="sort-select"
            value={sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            data-testid="sort-order-select"
            value={sortOrder}
            onValueChange={handleSortOrderChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_ORDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedTrackIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-testid="bulk-delete-button"
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedTrackIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the selected{" "}
                    <span className="font-semibold">
                      {selectedTrackIds.length} track
                      {selectedTrackIds.length > 1 ? "s" : ""}
                    </span>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="cancel-bulk-delete">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="confirm-bulk-delete"
                    disabled={deleteMutation.isPending}
                    onClick={handleDeleteSelected}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <CreateTrackDialog>
            <Button data-testid="create-track-button" size="sm">
              Create Track
            </Button>
          </CreateTrackDialog>
        </div>
      </div>

      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md text-center">
            <p>
              Error loading tracks:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button
              className="mt-2"
              size="sm"
              variant="destructive"
              onClick={resetErrorBoundary}
            >
              Try again
            </Button>
          </div>
        )}
        onReset={reset}
      >
        <TracksTable
          currentTrack={currentStoreTrack}
          genre={genre}
          isPlaying={isPlaying}
          searchTerm={debouncedSearchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onPlayTrack={handleTrackClick}
          onSelectionChange={handleSelectionChange}
        />
      </ErrorBoundary>

      <AudioPlayer />

      <Toaster data-testid="toast-container" />
    </div>
  );
}

export default App;
