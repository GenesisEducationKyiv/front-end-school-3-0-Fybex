import { Trash2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";

import { Button } from "@/components/ui/Button";
import { DialogFallback } from "@/components/ui/DialogFallback";

const CreateTrackDialog = lazy(
  () => import("@/components/TrackDialogs/CreateTrackDialog")
);
const BulkDeleteDialog = lazy(
  () => import("@/components/TrackDialogs/BulkDeleteDialog")
);

interface ActionsToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function ActionsToolbar({
  selectedCount,
  onDelete,
  isDeleting = false,
}: ActionsToolbarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <Button
          data-testid="bulk-delete-button"
          size="sm"
          variant="destructive"
          onClick={() => {
            setIsBulkDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete ({selectedCount})
        </Button>
      )}

      <Button
        data-testid="create-track-button"
        size="sm"
        onClick={() => {
          setIsCreateDialogOpen(true);
        }}
      >
        Create Track
      </Button>

      {isCreateDialogOpen && (
        <Suspense fallback={<DialogFallback />}>
          <CreateTrackDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
        </Suspense>
      )}

      {isBulkDeleteDialogOpen && (
        <Suspense fallback={<DialogFallback />}>
          <BulkDeleteDialog
            isDeleting={isDeleting}
            open={isBulkDeleteDialogOpen}
            selectedCount={selectedCount}
            onConfirm={onDelete}
            onOpenChange={setIsBulkDeleteDialogOpen}
          />
        </Suspense>
      )}
    </div>
  );
}
