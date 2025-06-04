import { Trash2 } from "lucide-react";

import CreateTrackDialog from "@/components/tracks/dialogs/create-track-dialog";
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
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-testid="bulk-delete-button"
              size="sm"
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedCount})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                selected{" "}
                <span className="font-semibold">
                  {selectedCount} track
                  {selectedCount > 1 ? "s" : ""}
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
                disabled={isDeleting}
                onClick={onDelete}
              >
                {isDeleting ? "Deleting..." : "Delete"}
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
  );
}
