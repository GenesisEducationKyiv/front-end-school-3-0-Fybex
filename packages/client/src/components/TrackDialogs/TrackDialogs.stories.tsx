import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { mockTrack } from "../../../.storybook/mocks/fakerMocks";
import { Button } from "../ui/Button";
import { Dialog, DialogContent } from "../ui/Dialog";
import { DialogFallback } from "../ui/DialogFallback";

import BulkDeleteDialog from "./BulkDeleteDialog";
import CreateTrackDialog from "./CreateTrackDialog";
import EditTrackDialog from "./EditTrackDialog";
import UploadTrackDialog from "./UploadTrackDialog";

type DialogType = "create" | "edit" | "bulkDelete" | "upload";

const meta: Meta = {
  title: "UI/TrackDialogs",
  parameters: {
    layout: "centered",
    docs: {
      story: {
        inline: false,
        height: 600,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

interface DialogDemoProps {
  dialogType: DialogType;
  open: boolean;
  setOpen: (open: boolean) => void;
}

function DialogDemo({ dialogType, open, setOpen }: DialogDemoProps) {
  if (dialogType === "create") {
    return <CreateTrackDialog open={open} onOpenChange={setOpen} />;
  } else if (dialogType === "edit") {
    return (
      <EditTrackDialog open={open} track={mockTrack} onOpenChange={setOpen} />
    );
  } else if (dialogType === "bulkDelete") {
    return (
      <BulkDeleteDialog
        open={open}
        selectedCount={3}
        onConfirm={() => {
          setOpen(false);
        }}
        onOpenChange={setOpen}
      />
    );
  } else {
    // upload
    return (
      <UploadTrackDialog open={open} track={mockTrack} onOpenChange={setOpen} />
    );
  }
}

function DialogOpener({
  buttonText,
  dialogType,
}: {
  buttonText: string;
  dialogType: DialogType;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        {buttonText}
      </Button>
      <DialogDemo dialogType={dialogType} open={open} setOpen={setOpen} />
    </div>
  );
}

export const Create: StoryObj<typeof meta> = {
  render: () => <DialogOpener buttonText="Create Track" dialogType="create" />,
};

export const Edit: StoryObj<typeof meta> = {
  render: () => <DialogOpener buttonText="Edit Track" dialogType="edit" />,
};

export const BulkDelete: StoryObj<typeof meta> = {
  render: () => (
    <DialogOpener buttonText="Bulk Delete" dialogType="bulkDelete" />
  ),
};

export const Upload: StoryObj<typeof meta> = {
  render: () => (
    <DialogOpener buttonText="Upload/Replace Audio" dialogType="upload" />
  ),
};

export const Fallback: StoryObj<typeof meta> = {
  render: () => <DialogFallback />,
};

// Dummy dialog for fallback demo using design system Dialog
function DummyDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <div style={{ marginBottom: 16 }}>Dummy Dialog Content</div>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}

export const FallbackWithDialog: StoryObj<typeof meta> = {
  args: {
    loadTime: 1000,
  },
  argTypes: {
    loadTime: {
      control: { type: "number", min: 0, step: 100 },
      description: "Delay in ms before dialog opens (shows fallback first)",
    },
  },
  render: ({ loadTime }: { loadTime?: number }) => {
    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(true);
      }, loadTime ?? 1000);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <Button onClick={handleOpen}>Open Dummy Dialog (after fallback)</Button>
        {loading && <DialogFallback />}
        <DummyDialog
          open={open}
          onClose={() => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};
