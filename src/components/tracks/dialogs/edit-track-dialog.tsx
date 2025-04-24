import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiQuery } from '@/hooks/use-api-query';
import { updateTrack, fetchGenres } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import {
  editTrackSchema,
  EditTrackFormData,
  Track,
  GenresResponse,
} from '@/lib/schemas';

import { BaseForm } from './base-form';

interface EditTrackDialogProps {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditTrackDialog({ track, open, onOpenChange }: EditTrackDialogProps) {
  const queryClient = useQueryClient();

  const { data: availableGenres = [] } = useApiQuery<GenresResponse, Error>({
    queryKey: queryKeys.genres.list(),
    queryFn: fetchGenres,
  });

  const form = useForm<EditTrackFormData>({
    resolver: zodResolver(editTrackSchema),
    defaultValues: {
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      genres: track.genres || [],
      coverImage: track.coverImage || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: track.title,
        artist: track.artist,
        album: track.album || '',
        genres: track.genres || [],
        coverImage: track.coverImage || '',
      });
    }
  }, [track, open, form]);

  const mutation = useMutation<Track, Error, EditTrackFormData>({
    mutationFn: (data) => updateTrack(track.id, data),
    onSuccess: (updatedTrack) => {
      toast.success(`Track "${updatedTrack.title}" updated successfully!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update track: ${error.message}`);
    },
  });

  const onSubmit = (data: EditTrackFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Track: {track.title}</DialogTitle>
          <DialogDescription>
            Update the details for this track.
          </DialogDescription>
        </DialogHeader>
        <BaseForm
          form={form}
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
          submitButtonText='Save Changes'
          availableGenres={availableGenres}
          onCancel={() => onOpenChange(false)}
          dialogType='edit'
        />
      </DialogContent>
    </Dialog>
  );
}

export default EditTrackDialog;
