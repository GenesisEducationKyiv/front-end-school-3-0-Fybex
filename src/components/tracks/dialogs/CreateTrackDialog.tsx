import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useGetGenres } from "@/lib/api/genres";
import {
  createTrackSchema,
  useCreateTrack,
  type CreateTrackFormData,
} from "@/lib/api/tracks";

import BaseForm from "./BaseForm";

interface CreateTrackDialogProps {
  children: React.ReactNode;
}

function CreateTrackDialog({ children }: CreateTrackDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: availableGenres = [] } = useGetGenres();

  const form = useForm<CreateTrackFormData>({
    resolver: zodResolver(createTrackSchema),
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

  const onSubmit = (data: CreateTrackFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("Track created successfully!");
        form.reset();
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            setOpen(false);
          }}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

export default CreateTrackDialog;
