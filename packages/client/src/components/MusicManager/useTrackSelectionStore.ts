import { create } from "@music-app/proto";
import { type Track, DeleteTracksRequestSchema } from "@music-app/proto/tracks";
import { toast } from "sonner";
import { create as createStore } from "zustand";

import { useDeleteTracks } from "@/lib/api/tracks";

interface TrackSelectionState {
  selectedTrackIds: Track["id"][];
  isDeleting: boolean;
  setSelectedTrackIds: (ids: Track["id"][]) => void;
  handleSelectionChange: (selectedIds: Track["id"][]) => void;
  handleDeleteSelected: () => void;
  clearSelection: () => void;
  setIsDeleting: (isDeleting: boolean) => void;
}

export const useTrackSelectionStore = createStore<TrackSelectionState>(
  (set, get) => ({
    selectedTrackIds: [],
    isDeleting: false,

    setSelectedTrackIds: (ids) => {
      set({ selectedTrackIds: ids });
    },

    handleSelectionChange: (selectedIds) => {
      const uniqueIds = [...new Set(selectedIds)];
      set({ selectedTrackIds: uniqueIds });
    },

    clearSelection: () => {
      set({ selectedTrackIds: [] });
    },

    setIsDeleting: (isDeleting) => {
      set({ isDeleting });
    },

    handleDeleteSelected: () => {
      const { selectedTrackIds } = get();
      if (selectedTrackIds.length === 0) {
        return;
      }

      set({ isDeleting: true });

      const deleteData = create(DeleteTracksRequestSchema, {
        ids: selectedTrackIds,
      });

      // We'll need to handle the mutation outside the store
      // This will be called from components that have access to the mutation
      return deleteData;
    },
  })
);

// Hook to handle the delete mutation logic
export function useTrackSelectionActions() {
  const deleteMutation = useDeleteTracks();
  const { selectedTrackIds, setIsDeleting, clearSelection } =
    useTrackSelectionStore();

  const handleDeleteSelected = () => {
    if (selectedTrackIds.length === 0) {
      return;
    }

    const deleteData = create(DeleteTracksRequestSchema, {
      ids: selectedTrackIds,
    });

    deleteMutation.mutate(deleteData, {
      onSuccess: (result) => {
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
        clearSelection();
        setIsDeleting(false);
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete tracks: ${error.message}`);
        setIsDeleting(false);
      },
    });

    setIsDeleting(true);
  };

  return {
    handleDeleteSelected,
    isDeleting: deleteMutation.isPending,
  };
}
