import { create } from "@music-app/proto";
import { type Track, DeleteTrackRequestSchema } from "@music-app/proto/tracks";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { useDeleteTrack } from "@/lib/api/tracks";

interface DeleteTrackDialogProps {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDialogClose: () => void;
}

function DeleteTrackDialog({
  track,
  open,
  onOpenChange,
  onDialogClose,
}: DeleteTrackDialogProps) {
  const mutation = useDeleteTrack();

  const handleDelete = () => {
    const deleteData = create(DeleteTrackRequestSchema, {
      id: track.id,
    });

    mutation.mutate(deleteData, {
      onSuccess: () => {
        toast.success(`Track "${track.title}" deleted successfully!`);
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete track: ${error.message}`);
        onOpenChange(false);
      },
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      onDialogClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the track
            <span className="font-semibold"> {track.title}</span> by
            <span className="font-semibold"> {track.artist}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="cancel-delete">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="confirm-delete"
            disabled={mutation.isPending}
            onClick={handleDelete}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteTrackDialog;
