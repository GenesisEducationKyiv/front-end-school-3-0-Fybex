import { useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString()}:${secs < 10 ? "0" : ""}${secs.toString()}`;
};

interface SeekBarProps {
  currentTime: number;
  duration: number;
  isSeeking: boolean;
  onSeek: (value: number[]) => void;
  onSeekPointerDown: () => void;
  onSeekPointerUp: () => void;
  trackId: string;
}

export default function SeekBar({
  currentTime,
  duration,
  isSeeking,
  onSeek,
  onSeekPointerDown,
  onSeekPointerUp,
  trackId,
}: SeekBarProps) {
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [seekHover, setSeekHover] = useState<{
    x: number;
    time: number;
  } | null>(null);

  const handleSeekBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || duration === 0) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(Math.max(x / rect.width, 0), 1);
    const time = percent * duration;
    setSeekHover({ x, time });
  };

  const handleSeekBarMouseLeave = () => {
    setSeekHover(null);
  };

  return (
    <div className="flex items-center gap-2 flex-grow relative">
      <span className="text-xs text-muted-foreground w-10 text-right">
        {formatTime(currentTime)}
      </span>
      <div
        className="flex-grow h-2 cursor-pointer relative"
        ref={seekBarRef}
        onMouseLeave={handleSeekBarMouseLeave}
        onMouseMove={handleSeekBarMouseMove}
        onPointerDown={onSeekPointerDown}
        onPointerLeave={onSeekPointerUp}
        onPointerUp={onSeekPointerUp}
      >
        <Slider
          aria-label="Seek track"
          className="w-full h-2"
          data-testid={`audio-progress-${trackId}`}
          max={duration || 1}
          step={0.1}
          value={[currentTime]}
          onValueChange={onSeek}
        />
        {seekHover && !isSeeking && (
          <div
            className="absolute -top-7 left-0 pointer-events-none z-10"
            style={{
              transform: `translateX(${seekHover.x.toString()}px) translateX(-50%)`,
              minWidth: 48,
            }}
          >
            <div className="px-2 py-1 rounded bg-muted text-xs text-foreground shadow border border-border text-center">
              {formatTime(seekHover.time)}
            </div>
          </div>
        )}
        {isSeeking && duration > 0 && (
          <div
            className="absolute -top-7 pointer-events-none z-10"
            style={{
              left: `${((currentTime / duration) * 100).toFixed(2)}%`,
              transform: `translateX(-50%)`,
              minWidth: 48,
            }}
          >
            <div className="px-2 py-1 rounded bg-muted text-xs text-foreground shadow border border-border text-center">
              {formatTime(currentTime)}
            </div>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground w-10 text-left">
        {formatTime(duration)}
      </span>
    </div>
  );
}
