import { useState } from "react";
import { toast } from "sonner";

import { useDeleteTracks, type TrackId } from "@/lib/api/tracks";

export function useTrackSelection() {
  const [selectedTrackIds, setSelectedTrackIds] = useState<TrackId[]>([]);
  const deleteMutation = useDeleteTracks();

  const handleSelectionChange = (selectedIds: TrackId[]) => {
    const uniqueIds = [...new Set(selectedIds)];
    setSelectedTrackIds(uniqueIds);
  };

  const handleDeleteSelected = () => {
    if (selectedTrackIds.length === 0) {
      return;
    }

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
