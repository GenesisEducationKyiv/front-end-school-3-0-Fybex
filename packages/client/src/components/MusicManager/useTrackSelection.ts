import { create } from "@music-app/proto";
import { type Track, DeleteTracksRequestSchema } from "@music-app/proto/tracks";
import { useState } from "react";
import { toast } from "sonner";

import { useDeleteTracks } from "@/lib/api/tracks";

export function useTrackSelection() {
  const [selectedTrackIds, setSelectedTrackIds] = useState<Track["id"][]>([]);
  const deleteMutation = useDeleteTracks();

  const handleSelectionChange = (selectedIds: Track["id"][]) => {
    const uniqueIds = [...new Set(selectedIds)];
    setSelectedTrackIds(uniqueIds);
  };

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
        setSelectedTrackIds([]);
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete tracks: ${error.message}`);
      },
    });
  };

  const clearSelection = () => {
    setSelectedTrackIds([]);
  };

  return {
    selectedTrackIds,
    handleSelectionChange,
    handleDeleteSelected,
    clearSelection,
    isDeleting: deleteMutation.isPending,
  };
}
