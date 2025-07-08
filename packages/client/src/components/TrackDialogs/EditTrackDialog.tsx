import { zodResolver } from "@hookform/resolvers/zod";
import { create } from "@music-app/proto";
import { UpdateTrackRequestSchema, type Track } from "@music-app/proto/tracks";
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
import { useUpdateTrack } from "@/lib/api/tracks";

import BaseForm from "./BaseForm";
import { trackFormSchema, type TrackFormData } from "./types";

interface EditTrackDialogProps {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditTrackDialog({ track, open, onOpenChange }: EditTrackDialogProps) {
  const availableGenres = useGetGenres();

  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      title: track.title,
      artist: track.artist,
      album: track.album ?? "",
      genres: track.genres,
      coverImage: track.coverImage ?? "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: track.title,
        artist: track.artist,
        album: track.album ?? "",
        genres: track.genres,
        coverImage: track.coverImage ?? "",
      });
    }
  }, [track, open, form]);

  const mutation = useUpdateTrack();

  const onSubmit = (data: TrackFormData) => {
    console.log("Edit track form submitted:", { trackId: track.id, data });

    const updateData = create(UpdateTrackRequestSchema, {
      id: track.id,
      title: data.title,
      artist: data.artist,
      genres: data.genres,
      ...(data.album && { album: data.album }),
      ...(data.coverImage && { coverImage: data.coverImage }),
    });

    mutation.mutate(updateData, {
      onSuccess: (response) => {
        console.log("Track updated successfully:", response);
        const updatedTrack = response.track;
        if (updatedTrack) {
          toast.success(`Track "${updatedTrack.title}" updated successfully!`);
        }
        onOpenChange(false);
      },
      onError: (error: Error) => {
        console.error("Failed to update track:", error);
        toast.error(`Failed to update track: ${error.message}`);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="edit-track-dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit Track: {track.title}</DialogTitle>
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
