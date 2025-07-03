import { type Track } from "@music-app/proto/tracks";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useUploadTrackFile } from "@/lib/api/tracks";
import { cn } from "@/lib/utils";

interface UploadTrackDialogProps {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadTrackDialog({
  track,
  open,
  onOpenChange,
}: UploadTrackDialogProps) {
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
      setFile(e.dataTransfer.files[0]);
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

    uploadMutation.mutate(
      {
        trackId: track.id,
        filename: file.name,
        content: new Uint8Array(await file.arrayBuffer()),
        contentType: file.type,
      },
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
            onClick={() => {
              void handleUpload();
            }}
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
