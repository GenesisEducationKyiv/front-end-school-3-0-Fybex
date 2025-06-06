import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useGetGenres } from "@/lib/api/genres";
import {
  editTrackSchema,
  useUpdateTrack,
  type EditTrackFormData,
  type TrackWithId,
} from "@/lib/api/tracks";

import BaseForm from "./BaseForm";

interface EditTrackDialogProps {
  track: TrackWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditTrackDialog({ track, open, onOpenChange }: EditTrackDialogProps) {
  const { data: availableGenres = [] } = useGetGenres();

  const form = useForm<EditTrackFormData>({
    resolver: zodResolver(editTrackSchema),
    defaultValues: {
      title: track.title ?? "",
      artist: track.artist ?? "",
      album: track.album ?? "",
      genres: track.genres ?? [],
      coverImage: track.coverImage ?? "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: track.title ?? "",
        artist: track.artist ?? "",
        album: track.album ?? "",
        genres: track.genres ?? [],
        coverImage: track.coverImage ?? "",
      });
    }
  }, [track, open, form]);

  const mutation = useUpdateTrack();

  const onSubmit = (data: EditTrackFormData) => {
    console.log("Edit track form submitted:", { trackId: track.id, data });
    mutation.mutate(
      { id: track.id, data },
      {
        onSuccess: (updatedTrack) => {
          console.log("Track updated successfully:", updatedTrack);
          toast.success(
            `Track "${updatedTrack.title ?? "Unknown"}" updated successfully!`
          );
          onOpenChange(false);
        },
        onError: (error: Error) => {
          console.error("Failed to update track:", error);
          toast.error(`Failed to update track: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Track: {track.title ?? "Unknown"}</DialogTitle>
          <DialogDescription>
            Update the details for this track.
          </DialogDescription>
        </DialogHeader>
        <BaseForm
          availableGenres={availableGenres}
          dialogType="edit"
          form={form}
          isLoading={mutation.isPending}
          submitButtonText="Save Changes"
          onCancel={() => {
            onOpenChange(false);
          }}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

export default EditTrackDialog;
