import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAudioPlayerStore } from "@/components/player/use-audio-player-store";
import { Button } from "@/components/ui/button";
import useEventListener from "@/hooks/use-event-listener";
import { getTrackAudioUrl } from "@/lib/api/tracks";

import PlayerControls from "./controls";
import SeekBar from "./seek-bar";
import TrackInfo from "./track-info";
import VolumeControl from "./volume-control";

export default function AudioPlayer() {
  const playerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const track = useAudioPlayerStore((state) => state.track);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const close = useAudioPlayerStore((state) => state.close);
  const setTogglePlayPauseFn = useAudioPlayerStore(
    (state) => state.setTogglePlayPauseFn
  );

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  const audioUrl = track?.audioFile ? getTrackAudioUrl(track.audioFile) : null;
  useEffect(() => {
    if (audioRef.current) {
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.src = audioUrl ?? "";
      if (audioUrl) {
        audioRef.current.load();
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
    setPreviousVolume(1);
    setIsSeeking(false);
  }, [track, audioUrl, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef, volume]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !track) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e: unknown) => {
        console.warn("Play prevented:", e);
      });
    }
  }, [isPlaying, track]);

  useEffect(() => {
    setTogglePlayPauseFn(handlePlayPause);
    return () => {
      setTogglePlayPauseFn(null);
    };
  }, [handlePlayPause, setTogglePlayPauseFn]);

  const handleSeek = useCallback((value: number) => {
    if (!audioRef.current) return;
    const newTime = value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    const newVolume = value;
    setVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (volume > 0) {
      setPreviousVolume(volume);
      handleVolumeChange(0);
    } else {
      const restoreVolume = previousVolume > 0 ? previousVolume : 1;
      handleVolumeChange(restoreVolume);
    }
  }, [volume, previousVolume, handleVolumeChange]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);

      const shouldBePlaying = useAudioPlayerStore.getState().isPlaying;

      if (shouldBePlaying) {
        audioRef.current.play().catch((e: unknown) => {
          console.warn("Autoplay prevented on metadata load:", e);
          setIsPlaying(false);
        });
      } else {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };
  const handlePause = () => {
    setIsPlaying(false);
  };
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioVolumeChange = () => {
    if (audioRef.current) {
      const currentAudioVolume = audioRef.current.volume;
      if (volume !== currentAudioVolume) {
        setVolume(currentAudioVolume);
        if (currentAudioVolume > 0) {
          setPreviousVolume(currentAudioVolume);
        }
      }
    }
  };

  const handleSeekPointerDown = () => {
    setIsSeeking(true);
  };
  const handleSeekPointerUp = () => {
    setIsSeeking(false);
  };

  useEventListener("keydown", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const tag = target.tagName.toLowerCase();
    if (
      ["input", "textarea", "select"].includes(tag) ||
      target.isContentEditable
    )
      return;

    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      const toggleFn = useAudioPlayerStore.getState()._toggleFn;
      toggleFn?.();
    }
  });

  if (!track) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg flex items-center px-4 py-2 gap-4"
      data-testid={`audio-player-${track.id}`}
      ref={playerRef}
      style={{ height: 80 }}
    >
      <TrackInfo track={track} />

      <div className="flex-grow min-w-0 flex items-center gap-3 px-2">
        <PlayerControls trackId={track.id} />
        <SeekBar
          currentTime={currentTime}
          duration={duration}
          isSeeking={isSeeking}
          trackId={track.id}
          onSeek={(value) => {
            if (value[0] !== undefined) {
              handleSeek(value[0]);
            }
          }}
          onSeekPointerDown={handleSeekPointerDown}
          onSeekPointerUp={handleSeekPointerUp}
        />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 relative">
        <VolumeControl
          volume={volume}
          onMuteToggle={handleMuteToggle}
          onVolumeChange={handleVolumeChange}
        />
        <Button
          aria-label="Close player"
          className="rounded-full hover:bg-muted w-8 h-8"
          size="icon"
          variant="ghost"
          onClick={close}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <audio
        className="absolute -left-[9999px] top-0"
        ref={audioRef}
        onEnded={handleEnded}
        onError={(e) => {
          console.error("Audio error:", e);
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onPause={handlePause}
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleAudioVolumeChange}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
