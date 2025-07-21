import { type Track } from "@music-app/proto/tracks";
import { Edit, Ellipsis, Trash2, Upload } from "lucide-react";
import { lazy, Suspense, useState } from "react";

import { Button } from "@/components/ui/Button";
import { DialogFallback } from "@/components/ui/DialogFallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

const DeleteTrackDialog = lazy(
  () => import("@/components/TrackDialogs/DeleteTrackDialog")
);
const EditTrackDialog = lazy(
  () => import("@/components/TrackDialogs/EditTrackDialog")
);
const UploadTrackDialog = lazy(
  () => import("@/components/TrackDialogs/UploadTrackDialog")
);

interface TrackActionsProps {
  track: Track;
}

export function TrackActions({ track }: TrackActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-haspopup="menu"
            className="h-8 w-8 p-0"
            data-testid={`track-actions-menu-${track.id}`}
            variant="ghost"
          >
            <span className="sr-only">Open menu</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            data-testid={`edit-track-${track.id}`}
            onClick={() => {
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Metadata</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid={`upload-track-${track.id}`}
            onClick={() => {
              setIsUploadDialogOpen(true);
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>{track.audioFile ? "Replace" : "Upload"} File</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            data-testid={`delete-track-${track.id}`}
            onClick={() => {
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Track</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isEditDialogOpen && (
        <Suspense fallback={<DialogFallback />}>
          <EditTrackDialog
            open={isEditDialogOpen}
            track={track}
            onOpenChange={setIsEditDialogOpen}
          />
        </Suspense>
      )}

      {isUploadDialogOpen && (
        <Suspense fallback={<DialogFallback />}>
          <UploadTrackDialog
            open={isUploadDialogOpen}
            track={track}
            onOpenChange={setIsUploadDialogOpen}
          />
        </Suspense>
      )}

      {isDeleteDialogOpen && (
        <Suspense fallback={<DialogFallback />}>
          <DeleteTrackDialog
            open={isDeleteDialogOpen}
            track={track}
            onDialogClose={() => {
              setIsDeleteDialogOpen(false);
            }}
            onOpenChange={setIsDeleteDialogOpen}
          />
        </Suspense>
      )}
    </>
  );
}
