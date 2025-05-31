import { Edit, Ellipsis, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUploadTrackFile } from "@/lib/api/tracks";
import { type TrackWithId } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import DeleteTrackDialog from "../dialogs/delete-track-dialog";
import EditTrackDialog from "../dialogs/edit-track-dialog";

interface TrackActionsProps {
  track: TrackWithId;
}

function UploadTrackDialog({
  track,
  open,
  onOpenChange,
}: {
  track: TrackWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadTrackFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith("audio/")) {
        setFile(e.dataTransfer.files[0]);
      } else {
        toast.error("Please drop an audio file.");
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

  const handleUpload = () => {
    if (!file) return;

    uploadMutation.mutate(
      { trackId: track.id, file },
      {
        onSuccess: () => {
          toast.success("Audio file uploaded successfully!");
          onOpenChange(false);
          setFile(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to upload file");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {track.audioFile ? "Replace Audio File" : "Upload Audio File"}
          </DialogTitle>
        </DialogHeader>

        <Input
          accept="audio/*"
          className="hidden"
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
        />

        <div
          className={cn(
            "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer",
            isDragging ? "border-primary bg-primary/10" : "border-border"
          )}
          style={{ minHeight: "100px" }}
          onClick={handleDropzoneClick}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
          <p className="text-sm text-muted-foreground">
            {isDragging
              ? "Drop the audio file here"
              : "Drag & drop an audio file here, or click to select"}
          </p>
          {file && (
            <p className="mt-2 text-sm font-medium text-primary">
              Selected file: {file.name}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            disabled={uploadMutation.isPending}
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!file || uploadMutation.isPending}
            onClick={handleUpload}
          >
            {uploadMutation.isPending
              ? "Uploading..."
              : track.audioFile
              ? "Replace"
              : "Upload"}
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
          <Button className="h-8 w-8 p-0" variant="ghost">
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
          <DeleteTrackDialog track={track}>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              data-testid={`delete-track-${track.id}`}
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Track</span>
            </DropdownMenuItem>
          </DeleteTrackDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTrackDialog
        open={isEditDialogOpen}
        track={track}
        onOpenChange={setIsEditDialogOpen}
      />

      <UploadTrackDialog
        open={isUploadDialogOpen}
        track={track}
        onOpenChange={setIsUploadDialogOpen}
      />
    </>
  );
}
