import { Volume1, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
}

export default function VolumeControl({
  volume,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="relative flex items-center group">
      <Button
        aria-label="Volume"
        className="rounded-full w-8 h-8 z-10"
        size="icon"
        variant="ghost"
        onClick={onMuteToggle}
      >
        <VolumeIcon className="w-5 h-5" />
        <span className="sr-only">Volume</span>
      </Button>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-20 flex flex-col items-center pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
        <div className="bg-background rounded-lg shadow-lg border border-border flex flex-col items-center px-2 py-2 h-24 w-10">
          <Slider
            aria-label="Volume"
            max={1}
            orientation="vertical"
            step={0.05}
            style={{ minHeight: 80, maxHeight: 80 }}
            value={[volume]}
            onValueChange={(value) => {
              if (value[0] !== undefined) {
                onVolumeChange(value[0]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
