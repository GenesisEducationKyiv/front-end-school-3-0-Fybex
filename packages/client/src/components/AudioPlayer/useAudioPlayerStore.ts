import { type Track } from "@music-app/proto/tracks";
import { create } from "zustand";

interface AudioPlayerState {
  track: Track | null;
  isPlaying: boolean;
  setTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  close: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set) => ({
  track: null,
  isPlaying: false,

  setTrack: (track) => {
    set({ track, isPlaying: !!track });
  },
  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },
  close: () => {
    set({ track: null, isPlaying: false });
  },
}));
