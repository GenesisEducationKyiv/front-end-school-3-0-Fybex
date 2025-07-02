import { type Track } from "@music-app/proto";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

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

  it("should deduplicate track IDs in selection change", () => {
    // Arrange
    const { result } = setup();
    const idsWithDuplicates = [
      "track-1",
      "track-2",
      "track-1",
      "track-3",
      "track-2",
    ];
    const expectedUniqueIds = ["track-1", "track-2", "track-3"];

    // Act
    act(() => {
      result.current.handleSelectionChange(idsWithDuplicates);
    });

    // Assert
    expect(result.current.selectedTrackIds).toEqual(expectedUniqueIds);
    expect(result.current.selectedTrackIds).toHaveLength(3);
  });

  it("should handle all duplicate IDs", () => {
    // Arrange
    const { result } = setup();
    const allDuplicates = ["track-1", "track-1", "track-1"];
    const expectedUniqueIds = ["track-1"];

    // Act
    act(() => {
      result.current.handleSelectionChange(allDuplicates);
    });

    // Assert
    expect(result.current.selectedTrackIds).toEqual(expectedUniqueIds);
    expect(result.current.selectedTrackIds).toHaveLength(1);
  });

  it("should maintain order of first occurrence when deduplicating", () => {
    // Arrange
    const { result } = setup();
    const idsWithDuplicates = [
      "track-3",
      "track-1",
      "track-2",
      "track-1",
      "track-3",
    ];
    const expectedOrderedIds = ["track-3", "track-1", "track-2"];

    // Act
    act(() => {
      result.current.handleSelectionChange(idsWithDuplicates);
    });

    // Assert
    expect(result.current.selectedTrackIds).toEqual(expectedOrderedIds);
  });

  it("should handle empty array selection", () => {
    // Arrange
    const { result } = setup();
    act(() => {
      result.current.handleSelectionChange(["track-1", "track-2"]);
    });

    // Act
    act(() => {
      result.current.handleSelectionChange([]);
    });

    // Assert
    expect(result.current.selectedTrackIds).toEqual([]);
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
        _ids: Track["id"][],
        { onSuccess }: { onSuccess: (res: unknown) => void }
      ) => {
        onSuccess({ success: ["track-1"], failed: [] });
      },
      expected: [],
    },
    {
      name: "failed deletion",
      impl: (
        _ids: Track["id"][],
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
