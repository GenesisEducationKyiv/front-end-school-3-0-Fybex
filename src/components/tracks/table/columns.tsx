import { type ColumnDef } from "@tanstack/react-table";
import { Pause, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TrackCover } from "@/components/ui/track-cover";
import { type TrackWithId } from "@/lib/api/types";

import { TrackActions } from "./actions";

export interface ColumnMeta {
  className?: string;
  skeletonHeight?: string;
}

export interface TrackTableMeta {
  currentTrack: TrackWithId | null;
  isPlaying: boolean;
  onPlayTrack: (track: TrackWithId) => void;
}

const selectionColumn: ColumnDef<TrackWithId> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      aria-label="Select all rows"
      checked={table.getIsAllPageRowsSelected()}
      className="translate-y-[2px]"
      data-testid="select-all"
      onCheckedChange={(value) => {
        table.toggleAllPageRowsSelected(!!value);
      }}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      aria-label="Select row"
      checked={row.getIsSelected()}
      className="translate-y-[2px]"
      data-testid={`track-checkbox-${row.original.id}`}
      onCheckedChange={(value) => {
        row.toggleSelected(!!value);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    />
  ),
  enableSorting: false,
  enableHiding: false,
  size: 48,
  meta: {
    className: "w-[48px] text-center px-1",
  },
};

export const columns: ColumnDef<TrackWithId>[] = [
  selectionColumn,
  {
    accessorKey: "coverImage",
    header: "",
    cell: ({ row, table }) => {
      const track = row.original;
      const cover = track.coverImage;
      const meta = table.options.meta as TrackTableMeta | undefined;
      const isCurrent = meta?.currentTrack?.id === track.id;
      const showPlayButton = !!track.audioFile;
      const IconComponent = isCurrent && meta.isPlaying ? Pause : Play;

      return (
        <div className="relative w-10 h-10">
          <TrackCover
            alt={track.title ?? "Track"}
            className="w-full h-full"
            iconSize={16}
            src={cover ?? null}
          />
          {showPlayButton && (
            <Button
              aria-label={
                isCurrent && meta.isPlaying
                  ? `Pause ${track.title ?? "Track"}`
                  : `Play ${track.title ?? "Track"}`
              }
              className="absolute inset-0 flex items-center justify-center w-full h-full rounded bg-black/20 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 focus-within:opacity-100"
              size="icon"
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                meta?.onPlayTrack(track);
              }}
            >
              <IconComponent className="w-4 h-4 text-white" />
            </Button>
          )}
        </div>
      );
    },
    size: 48,
    minSize: 40,
    maxSize: 56,
    meta: {
      className: "w-[56px] p-1",
      skeletonHeight: "h-10",
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span data-testid={`track-item-${row.original.id}-title`}>
        {row.original.title ?? "Unknown Title"}
      </span>
    ),
    meta: {
      className: "text-center",
    },
  },
  {
    accessorKey: "artist",
    header: "Artist",
    cell: ({ row }) => (
      <span data-testid={`track-item-${row.original.id}-artist`}>
        {row.original.artist ?? "Unknown Artist"}
      </span>
    ),
    meta: {
      className: "text-center",
    },
  },
  {
    accessorKey: "album",
    header: "Album",
    cell: ({ row }) => row.original.album ?? "-",
    meta: {
      className: "text-center",
    },
  },
  {
    accessorKey: "genres",
    header: "Genres",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {(row.original.genres ?? []).map((genre: string) => (
          <Badge key={genre} variant="secondary">
            {genre}
          </Badge>
        ))}
      </div>
    ),
    enableSorting: false,
    meta: {
      className: "text-center",
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <TrackActions track={row.original} />,
    size: 32,
    minSize: 24,
    maxSize: 40,
    meta: {
      className: "w-[32px] text-right",
      skeletonHeight: "h-6",
    },
  },
];
