import type { Meta, StoryObj } from "@storybook/react-vite";
import { Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { mockTrack } from "../../../.storybook/mocks/fakerMocks";
import { Button } from "../ui/Button";

import { useAudioPlayerStore } from "./useAudioPlayerStore";

import AudioPlayer from "./index";

function AudioPlayerDemo({
  show,
  ...trackProps
}: {
  show?: boolean;
  title: string;
  artist: string;
  audioFile: string;
  coverImage: string;
}) {
  const [visible, setVisible] = useState(show ?? false);
  const setTrack = useAudioPlayerStore((state) => state.setTrack);
  const close = useAudioPlayerStore((state) => state.close);

  useEffect(() => {
    setVisible(show ?? false);
  }, [show]);

  useEffect(() => {
    if (visible) {
      setTrack({ ...mockTrack, ...trackProps });
    } else {
      setTrack(null);
    }
    return () => {
      close();
    };
  }, [visible, trackProps, setTrack, close]);

  const handlePlayerClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <Button
        data-testid="show-player-btn"
        disabled={visible}
        size="lg"
        onClick={() => {
          setVisible(true);
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <Play style={{ marginRight: 8 }} />
          Show Player
        </span>
      </Button>
      {visible && (
        <div style={{ width: "100%" }}>
          <AudioPlayer onClose={handlePlayerClose} />
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof AudioPlayerDemo> = {
  title: "UI/AudioPlayer",
  component: AudioPlayerDemo,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: {
        inline: false,
        height: 300,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    artist: { control: "text" },
    audioFile: { control: "text" },
    coverImage: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenedByDefaultWithZeroVolumeMusic: Story = {
  args: {
    show: true,
    title: mockTrack.title,
    artist: mockTrack.artist,
    audioFile: "/silent.mp3",
    coverImage: mockTrack.coverImage ?? "",
  },
};

export const ValidTrack: Story = {
  args: {
    show: false,
    title: mockTrack.title,
    artist: mockTrack.artist,
    audioFile: "/test-music.mp3",
    coverImage: mockTrack.coverImage ?? "",
  },
  name: "Valid Track (Playable)",
};

export const BrokenTrack: Story = {
  args: {
    show: false,
    title: mockTrack.title,
    artist: mockTrack.artist,
    audioFile: "/not_found.mp3",
    coverImage: mockTrack.coverImage ?? "",
  },
  name: "Broken Track (Audio Error)",
};
