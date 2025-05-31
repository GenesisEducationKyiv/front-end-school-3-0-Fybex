import { type ReactNode, useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteTrack } from "@/lib/api/tracks";
import { type TrackWithId } from "@/lib/api/types";

interface DeleteTrackDialogProps {
  track: TrackWithId;
  children: ReactNode;
  onDialogClose?: () => void;
}

function DeleteTrackDialog({
  track,
  children,
  onDialogClose,
}: DeleteTrackDialogProps) {
  const [open, setOpen] = useState(false);

  const mutation = useDeleteTrack();

  const handleDelete = () => {
    mutation.mutate(track.id, {
      onSuccess: () => {
        toast.success(
          `Track "${track.title ?? "Unknown"}" deleted successfully!`
        );
        setOpen(false);
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete track: ${error.message}`);
        setOpen(false);
      },
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onDialogClose) {
      onDialogClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the track
            <span className="font-semibold">
              {" "}
              {track.title ?? "Unknown"}
            </span>{" "}
            by
            <span className="font-semibold"> {track.artist ?? "Unknown"}</span>.
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
