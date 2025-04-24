import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApiQuery } from '@/hooks/use-api-query';
import { createTrack, fetchGenres } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import {
  createTrackSchema,
  CreateTrackFormData,
  GenresResponse,
} from '@/lib/schemas';

import { BaseForm } from './base-form';

interface CreateTrackDialogProps {
  children: React.ReactNode;
}

function CreateTrackDialog({ children }: CreateTrackDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: availableGenres = [] } = useApiQuery<GenresResponse, Error>({
    queryKey: queryKeys.genres.list(),
    queryFn: fetchGenres,
  });

  const form = useForm<CreateTrackFormData>({
    resolver: zodResolver(createTrackSchema),
    defaultValues: {
      title: '',
      artist: '',
      album: '',
      genres: [],
      coverImage: '',
    },
    mode: 'onChange',
  });

  const mutation = useMutation<unknown, Error, CreateTrackFormData>({
    mutationFn: createTrack,
    onSuccess: () => {
      toast.success('Track created successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create track: ${error.message}`);
    },
  });

  const onSubmit = (data: CreateTrackFormData) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create New Track</DialogTitle>
          <DialogDescription>
            Fill in the details for the new track.
          </DialogDescription>
        </DialogHeader>
        <BaseForm
          form={form}
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
          submitButtonText='Create Track'
          availableGenres={availableGenres}
          onCancel={() => setOpen(false)}
          dialogType='create'
        />
      </DialogContent>
    </Dialog>
  );
}

export default CreateTrackDialog;
