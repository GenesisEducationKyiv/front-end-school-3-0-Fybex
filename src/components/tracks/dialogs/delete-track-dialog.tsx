import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

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
} from '@/components/ui/alert-dialog';
import { deleteTrack } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { Track } from '@/lib/schemas';

interface DeleteTrackDialogProps {
  track: Track;
  children: ReactNode;
  onDialogClose?: () => void;
}

function DeleteTrackDialog({
  track,
  children,
  onDialogClose,
}: DeleteTrackDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: deleteTrack,
    onSuccess: () => {
      toast.success(`Track "${track.title}" deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all });
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete track: ${error.message}`);
      setOpen(false);
    },
  });

  const handleDelete = () => {
    mutation.mutate(track.id);
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
      <AlertDialogContent data-testid='confirm-dialog'>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the track
            <span className='font-semibold'> {track.title}</span> by
            <span className='font-semibold'> {track.artist}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid='cancel-delete'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={mutation.isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            data-testid='confirm-delete'
          >
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteTrackDialog;
