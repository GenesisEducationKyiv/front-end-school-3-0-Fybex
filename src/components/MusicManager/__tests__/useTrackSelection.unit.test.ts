import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type * as api from "@/lib/api/tracks";
import { useDeleteTracks } from "@/lib/api/tracks";

import { useTrackSelection } from "../useTrackSelection";

vi.mock("@/lib/api/tracks");

describe("useTrackSelection", () => {
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMutate = vi.fn();
    (useDeleteTracks as Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const setup = () => renderHook(() => useTrackSelection());

  it("should handle selection change", () => {
    // Arrange
    const { result } = setup();
    const ids = ["track-1", "track-2"];

    // Act
    act(() => {
      result.current.handleSelectionChange(ids);
    });

    // Assert
    expect(result.current.selectedTrackIds).toEqual(ids);
  });

  it("should clear selection", () => {
    // Arrange
    const { result } = setup();
    act(() => {
      result.current.handleSelectionChange(["track-1"]);
    });

    // Act
    act(() => {
      result.current.clearSelection();
    });

    // Assert
    expect(result.current.selectedTrackIds).toEqual([]);
  });

  it("should do nothing (and not call mutate) when no tracks are selected", () => {
    // Arrange
    const { result } = setup();

    // Act
    act(() => {
      result.current.handleDeleteSelected();
    });

    // Assert
    expect(mockMutate).not.toHaveBeenCalled();
    expect(result.current.selectedTrackIds).toEqual([]);
  });

  it("should proxy the isPending flag as isDeleting", () => {
    // Arrange
    (useDeleteTracks as Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    // Act
    const { result } = setup();

    // Assert
    expect(result.current.isDeleting).toBe(true);
  });

  const scenarios = [
    {
      name: "successful deletion",
      impl: (
        _ids: api.TrackId[],
        { onSuccess }: { onSuccess: (res: unknown) => void }
      ) => {
        onSuccess({ success: ["track-1"], failed: [] });
      },
      expected: [],
    },
    {
      name: "failed deletion",
      impl: (
        _ids: api.TrackId[],
        { onError }: { onError: (err: Error) => void }
      ) => {
        onError(new Error("Deletion failed"));
      },
      expected: ["track-1"],
    },
  ];

  it.each(scenarios)("handleDeleteSelected – $name", ({ impl, expected }) => {
    // Arrange
    mockMutate.mockImplementation(impl);
    const { result } = setup();
    act(() => {
      result.current.handleSelectionChange(["track-1"]);
    });

    // Act
    act(() => {
      result.current.handleDeleteSelected();
    });

    // Assert
    expect(result.current.selectedTrackIds).toEqual(expected);
  });
});
