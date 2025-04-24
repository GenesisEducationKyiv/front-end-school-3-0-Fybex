import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
}

export default function VolumeControl({
  volume,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);

  const handleVolumeMouseEnter = () => setShowVolumeSlider(true);
  const handleVolumeMouseLeave = () => setShowVolumeSlider(false);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className='relative flex items-center'
      onMouseEnter={handleVolumeMouseEnter}
      onMouseLeave={handleVolumeMouseLeave}
    >
      <Button
        ref={volumeButtonRef}
        variant='ghost'
        size='icon'
        className='rounded-full w-8 h-8 z-10'
        onClick={onMuteToggle}
        aria-label='Volume'
      >
        <VolumeIcon className='w-5 h-5' />
        <span className='sr-only'>Volume</span>
      </Button>
      {showVolumeSlider && (
        <div className='absolute left-1/2 -translate-x-1/2 bottom-12 z-20 flex flex-col items-center pointer-events-auto'>
          <div className='bg-background rounded-lg shadow-lg border border-border flex flex-col items-center px-2 py-2 h-24 w-10'>
            <Slider
              value={[volume]}
              max={1}
              step={0.05}
              onValueChange={onVolumeChange}
              orientation='vertical'
              aria-label='Volume'
              style={{ minHeight: 80, maxHeight: 80 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
