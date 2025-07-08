import { zodResolver } from "@hookform/resolvers/zod";
import { create } from "@music-app/proto";
import { CreateTrackRequestSchema } from "@music-app/proto/tracks";
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
import { useCreateTrack } from "@/lib/api/tracks";

import BaseForm from "./BaseForm";
import { trackFormSchema, type TrackFormData } from "./types";

interface CreateTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTrackDialog({
  open,
  onOpenChange,
}: CreateTrackDialogProps) {
  const availableGenres = useGetGenres();

  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      title: "",
      artist: "",
      album: "",
      genres: [],
      coverImage: "",
    },
    mode: "onChange",
  });

  const mutation = useCreateTrack();

  const onSubmit = (data: TrackFormData) => {
    const createData = create(CreateTrackRequestSchema, {
      title: data.title,
      artist: data.artist,
      genres: data.genres,
      ...(data.album && { album: data.album }),
      ...(data.coverImage && { coverImage: data.coverImage }),
    });

    mutation.mutate(createData, {
      onSuccess: (response) => {
        const createdTrack = response.track;
        if (createdTrack) {
          toast.success(`Track "${createdTrack.title}" created successfully!`);
        }
        form.reset();
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(`Failed to create track: ${error.message}`);
      },
    });
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="create-track-dialog"
      >
        <DialogHeader>
          <DialogTitle>Create New Track</DialogTitle>
          <DialogDescription>
            Fill in the details for the new track.
          </DialogDescription>
        </DialogHeader>
        <BaseForm
          availableGenres={availableGenres}
          dialogType="create"
          form={form}
          isLoading={mutation.isPending}
          submitButtonText="Create Track"
          onCancel={() => {
            onOpenChange(false);
          }}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
