import { create } from "zustand";

import { type TrackWithId } from "@/lib/api/tracks";

interface AudioPlayerState {
  track: TrackWithId | null;
  isPlaying: boolean;
  setTrack: (track: TrackWithId | null) => void;
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
