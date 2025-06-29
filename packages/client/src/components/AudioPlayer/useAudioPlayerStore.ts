import { type Track } from "@music-app/proto/tracks";
import { create } from "zustand";

type ToggleFn = (() => void) | null;

interface AudioPlayerState {
  track: Track | null;
  isPlaying: boolean;
  _toggleFn: ToggleFn;
  setTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  close: () => void;
  setTogglePlayPauseFn: (fn: ToggleFn) => void;
  togglePlayPause: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  track: null,
  isPlaying: false,
  _toggleFn: null,

  setTrack: (track) => {
    set({ track, isPlaying: !!track });
  },
  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },
  close: () => {
    set({ track: null, isPlaying: false, _toggleFn: null });
  },

  setTogglePlayPauseFn: (fn) => {
    set({ _toggleFn: fn });
  },

  togglePlayPause: () => {
    get()._toggleFn?.();
  },
}));
