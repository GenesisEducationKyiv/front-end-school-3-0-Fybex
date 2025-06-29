import { type Track } from "@music-app/proto/tracks";

import { TrackCover } from "@/components/ui/TrackCover";

interface TrackInfoProps {
  track: Track;
}

export default function TrackInfo({ track }: TrackInfoProps) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0 min-w-0 w-1/4 max-w-xs">
      <TrackCover
        alt={track.title}
        className="h-12 w-12 flex-shrink-0 shadow"
        iconSize={24}
        src={track.coverImage ?? null}
      />
      <div className="flex flex-col min-w-0">
        <div className="truncate font-semibold text-sm">{track.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {track.artist}
        </div>
      </div>
    </div>
  );
}
