import { Ellipsis, Edit, Trash2, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { uploadTrackFile } from '@/lib/api';
import { Track } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import DeleteTrackDialog from '../dialogs/delete-track-dialog';
import EditTrackDialog from '../dialogs/edit-track-dialog';

interface TrackActionsProps {
  track: Track;
}

function UploadTrackDialog({
  track,
  open,
  onOpenChange,
}: {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith('audio/')) {
        setFile(e.dataTransfer.files[0]);
      } else {
        toast.error('Please drop an audio file.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadTrackFile(track.id, file);
      toast.success('Audio file uploaded successfully!');
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Failed to upload file');
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {track.audioFile ? 'Replace Audio File' : 'Upload Audio File'}
          </DialogTitle>
        </DialogHeader>

        <Input
          ref={fileInputRef}
          type='file'
          accept='audio/*'
          onChange={handleFileChange}
          className='hidden'
        />

        <div
          onClick={handleDropzoneClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer',
            isDragging ? 'border-primary bg-primary/10' : 'border-border',
          )}
          style={{ minHeight: '100px' }}
        >
          <Upload className='w-6 h-6 text-muted-foreground mb-1' />
          <p className='text-sm text-muted-foreground'>
            {isDragging
              ? 'Drop the audio file here'
              : 'Drag & drop an audio file here, or click to select'}
          </p>
          {file && (
            <p className='mt-2 text-sm font-medium text-primary'>
              Selected file: {file.name}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading
              ? 'Uploading...'
              : track.audioFile
              ? 'Replace'
              : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TrackActions({ track }: TrackActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <Ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => setIsEditDialogOpen(true)}
            data-testid={`edit-track-${track.id}`}
          >
            <Edit className='mr-2 h-4 w-4' />
            <span>Edit Metadata</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsUploadDialogOpen(true)}
            data-testid={`upload-track-${track.id}`}
          >
            <Upload className='mr-2 h-4 w-4' />
            <span>{track.audioFile ? 'Replace' : 'Upload'} File</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteTrackDialog track={track}>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className='text-destructive focus:text-destructive focus:bg-destructive/10'
              data-testid={`delete-track-${track.id}`}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              <span>Delete Track</span>
            </DropdownMenuItem>
          </DeleteTrackDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTrackDialog
        track={track}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <UploadTrackDialog
        track={track}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </>
  );
}
