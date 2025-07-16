import { Pause, Play } from "lucide-react";

import { useAudioPlayerStore } from "@/components/AudioPlayer/useAudioPlayerStore";
import { Button } from "@/components/ui/Button";

interface PlayerControlsProps {
  trackId: string;
}

export default function PlayerControls({ trackId }: PlayerControlsProps) {
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const Icon = isPlaying ? Pause : Play;

  const handleClick = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Button
      aria-label={isPlaying ? "Pause" : "Play"}
      className="rounded-full focus:ring-2 focus:ring-primary h-9 w-9"
      data-testid={
        isPlaying ? `pause-button-${trackId}` : `play-button-${trackId}`
      }
      size="icon"
      variant="ghost"
      onClick={handleClick}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
}
