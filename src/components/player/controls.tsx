import { Play, Pause } from 'lucide-react';

import { useAudioPlayerStore } from '@/components/player/use-audio-player-store';
import { Button } from '@/components/ui/button';

interface PlayerControlsProps {
  trackId: string;
}

export default function PlayerControls({ trackId }: PlayerControlsProps) {
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const Icon = isPlaying ? Pause : Play;
  const togglePlayPause = useAudioPlayerStore((state) => state.togglePlayPause);

  return (
    <Button
      variant='ghost'
      size='icon'
      className='rounded-full focus:ring-2 focus:ring-primary h-9 w-9'
      onClick={togglePlayPause}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      data-testid={
        isPlaying ? `pause-button-${trackId}` : `play-button-${trackId}`
      }
    >
      <Icon className='w-5 h-5' />
    </Button>
  );
}
