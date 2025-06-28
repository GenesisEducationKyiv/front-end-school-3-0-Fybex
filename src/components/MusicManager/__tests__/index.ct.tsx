import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/experimental-ct-react";
import { type Page } from "playwright-core";

import MusicManager from "../index";

const mockGenres = ["Rock", "Jazz", "Classical", "Electronic", "Country"];

const generateMockTrack = (index = 0) => ({
  id: faker.string.uuid(),
  title: faker.music.songName(),
  artist: faker.person.fullName(),
  genre: mockGenres[index % mockGenres.length], // ensure variety by cycling
  album: faker.music.album(),
  createdAt: faker.date.past({ years: 30 }),
  url: faker.internet.url(),
});

const mockTracks = Array.from({ length: 6 }, (_, index) =>
  generateMockTrack(index)
);

const filterTracksBySearch = (tracks: typeof mockTracks, searchTerm: string) =>
  tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

const filterTracksByGenre = (tracks: typeof mockTracks, genre: string) =>
  tracks.filter((track) => track.genre?.toLowerCase() === genre.toLowerCase());

const sortTracks = (
  tracks: typeof mockTracks,
  sortField: string,
  sortOrder: "asc" | "desc" = "asc"
) => {
  const sorted = [...tracks].sort((a, b) => {
    switch (sortField) {
      case "title":
        return a.title.localeCompare(b.title);
      case "artist":
        return a.artist.localeCompare(b.artist);
      case "album":
        return a.album.localeCompare(b.album);
      case "createdAt":
        return a.createdAt.getTime() - b.createdAt.getTime();
      default:
        return 0;
    }
  });

  return sortOrder === "desc" ? sorted.reverse() : sorted;
};

const expectTracksVisible = async (page: Page, tracks: typeof mockTracks) => {
  for (const track of tracks) {
    await expect(page.getByText(track.title)).toBeVisible();
  }
};

const expectTracksNotVisible = async (
  page: Page,
  tracks: typeof mockTracks
) => {
  for (const track of tracks) {
    await expect(page.getByText(track.title)).not.toBeVisible();
  }
};

const waitForSearchResults = async (page: Page, expectedCount: number) => {
  // wait for loading to start (if any)
  try {
    await page.getByTestId("loading-tracks").waitFor({ timeout: 1000 });
  } catch {
    // loading might not appear for some searches, that's okay
  }

  // waiting for loading to finish and results to stabilize
  await page.waitForFunction((count: number) => {
    const loadingElements = document.querySelectorAll(
      '[data-testid="loading-tracks"]'
    );
    const trackElements = document.querySelectorAll(
      '[data-testid="track-item"]'
    );
    return loadingElements.length === 0 && trackElements.length === count;
  }, expectedCount);
};

const mockEmptyResponse = {
  data: [],
  meta: { totalItems: 0, totalPages: 1, currentPage: 1, limit: 20 },
};

test.describe("MusicManager", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/genres", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockGenres),
      });
    });

    await page.route("**/api/tracks*", async (route) => {
      const url = route.request().url();
      const urlParams = new URLSearchParams(url.split("?")[1] ?? "");

      const search = urlParams.get("search") ?? "";
      const genre = urlParams.get("genre") ?? "";
      const sort = urlParams.get("sort") ?? "";

      let filteredTracks = [...mockTracks];

      if (search) {
        filteredTracks = filterTracksBySearch(filteredTracks, search);
      }

      if (genre) {
        filteredTracks = filterTracksByGenre(filteredTracks, genre);
      }

      if (sort) {
        filteredTracks = sortTracks(filteredTracks, sort, "asc");
      }

      const response = {
        data: filteredTracks,
        meta: {
          totalItems: filteredTracks.length,
          totalPages: Math.ceil(filteredTracks.length / 20),
          currentPage: 1,
          limit: 20,
        },
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  });

  test("should load initial data and display all UI elements", async ({
    mount,
    page,
  }) => {
    await mount(<MusicManager />);

    // verify all UI elements are present
    await expect(page.getByTestId("search-input")).toBeVisible();
    await expect(page.getByTestId("create-track-button")).toBeVisible();
    await expect(page.getByTestId("filter-genre")).toBeVisible();
    await expect(page.getByTestId("sort-select")).toBeVisible();
    await expect(page.getByTestId("sort-order-select")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();

    // verify tracks are displayed
    await expectTracksVisible(page, mockTracks);
  });

  test("should handle search functionality", async ({ mount, page }) => {
    await mount(<MusicManager />);

    const searchInput = page.getByTestId("search-input");
    const firstTrack = mockTracks[0];
    if (!firstTrack) throw new Error("No tracks available");

    const searchTerm = firstTrack.title.split(" ")[0];
    if (!searchTerm) throw new Error("Invalid search term");

    await searchInput.fill(searchTerm);
    await expect(searchInput).toHaveValue(searchTerm);

    const matchingTracks = filterTracksBySearch(mockTracks, searchTerm);
    await waitForSearchResults(page, matchingTracks.length);

    // verify only tracks matching search term are visible
    await expectTracksVisible(page, matchingTracks);

    // verify non-matching tracks are NOT visible
    const nonMatchingTracks = mockTracks.filter(
      (track) => !matchingTracks.includes(track)
    );
    await expectTracksNotVisible(page, nonMatchingTracks);

    // clear search
    await searchInput.clear();

    // check reset – should show all tracks again
    await waitForSearchResults(page, mockTracks.length);
    await expectTracksVisible(page, mockTracks);
  });

  test("should handle genre filtering", async ({ mount, page }) => {
    if (!mockTracks[0] || !mockTracks[1])
      throw new Error("No tracks available");
    const testGenre = mockTracks[0].genre;
    if (!testGenre) throw new Error("No genre available");

    await mount(<MusicManager />);

    const genreFilter = page.getByTestId("filter-genre");

    await genreFilter.click();

    // verify dropdown options
    await expect(
      page.getByRole("option", { name: "All Genres" })
    ).toBeVisible();
    for (const genre of mockGenres) {
      await expect(page.getByRole("option", { name: genre })).toBeVisible();
    }

    // select genre from our mock tracks
    await page.getByRole("option", { name: testGenre }).click();

    // verify only tracks with selected genre are visible
    const tracksWithGenre = filterTracksByGenre(mockTracks, testGenre);
    await expectTracksVisible(page, tracksWithGenre);
    // verify tracks with other genres are NOT visible
    const tracksWithOtherGenres = mockTracks.filter(
      (track) => !tracksWithGenre.includes(track)
    );
    await expectTracksNotVisible(page, tracksWithOtherGenres);

    // reset genre filter
    await genreFilter.click();
    await page.getByRole("option", { name: "All Genres" }).click();
    await expectTracksVisible(page, mockTracks);
  });

  test.describe("should handle sorting in ascending and descending order", () => {
    const sortingTestCases = [
      {
        name: "by title",
        sortOption: "Title",
        sortField: "title" as const,
      },
      {
        name: "by artist",
        sortOption: "Artist",
        sortField: "artist" as const,
      },
      {
        name: "by album",
        sortOption: "Album",
        sortField: "album" as const,
      },
      {
        name: "by newest",
        sortOption: "Newest",
        sortField: "createdAt" as const,
      },
    ] as const;

    for (const testCase of sortingTestCases) {
      test(testCase.name, async ({ mount, page }) => {
        if (!mockTracks[0] || !mockTracks[1])
          throw new Error("No tracks available");

        await mount(<MusicManager />);

        const sortSelect = page.getByTestId("sort-select");
        const sortOrderSelect = page.getByTestId("sort-order-select");

        // sort by field ascending
        await sortSelect.click();
        await page.getByRole("option", { name: testCase.sortOption }).click();
        const sortedAsc = sortTracks(mockTracks, testCase.sortField, "asc");
        await expectTracksVisible(page, sortedAsc);

        // sort by field descending
        await sortOrderSelect.click();
        await page.getByRole("option", { name: "Descending" }).click();
        const sortedDesc = sortTracks(mockTracks, testCase.sortField, "desc");
        await expectTracksVisible(page, sortedDesc);
      });
    }
  });

  test("should handle combined filters", async ({ mount, page }) => {
    if (!mockTracks[0] || !mockTracks[1])
      throw new Error("No tracks available");

    await mount(<MusicManager />);

    const searchInput = page.getByTestId("search-input");
    const genreFilter = page.getByTestId("filter-genre");
    const sortSelect = page.getByTestId("sort-select");

    // apply search
    const searchTerm = mockTracks[0].title.split(" ")[0];
    if (!searchTerm) throw new Error("Invalid search term");
    await searchInput.fill(searchTerm);
    let filteredTracks = filterTracksBySearch(mockTracks, searchTerm);
    await waitForSearchResults(page, filteredTracks.length);

    // apply genre filter
    await genreFilter.click();
    const testGenre = mockTracks[0].genre;
    if (!testGenre) throw new Error("No genre available");
    await page.getByRole("option", { name: testGenre }).click();
    filteredTracks = filterTracksByGenre(filteredTracks, testGenre);

    // apply sort
    await sortSelect.click();
    await page.getByRole("option", { name: "Artist" }).click();

    // verify combined filtering and sorting results
    // should show only tracks that match search AND genre, sorted by artist
    const finalResults = sortTracks(filteredTracks, "artist", "asc");
    await expectTracksVisible(page, finalResults);

    // verify tracks that don't match both criteria are NOT visible
    const excludedTracks = mockTracks.filter(
      (track) => !finalResults.includes(track)
    );
    await expectTracksNotVisible(page, excludedTracks);

    // reset filters
    await searchInput.clear();
    await genreFilter.click();
    await page.getByRole("option", { name: "All Genres" }).click();
    await sortSelect.click();
    await page.getByRole("option", { name: "Newest" }).click();
    await expectTracksVisible(page, mockTracks);
  });

  test("should handle empty states and no results", async ({ mount, page }) => {
    // Override the default route for this test
    await page.route("**/api/tracks*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockEmptyResponse),
      });
    });

    await mount(<MusicManager />);

    // should still show UI elements even with no data
    await expect(page.getByTestId("search-input")).toBeVisible();
    await expect(page.getByTestId("create-track-button")).toBeVisible();
    await expect(page.getByTestId("filter-genre")).toBeVisible();

    // should show no results message
    await expect(page.getByText("No results.")).toBeVisible();
  });

  test("should handle create track dialog functionality", async ({
    mount,
    page,
  }) => {
    await mount(<MusicManager />);

    // test create button functionality
    const createButton = page.getByTestId("create-track-button");
    await expect(createButton).toBeVisible();
    await createButton.click();

    // should open dialog
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ mount, page }) => {
    await page.route("**/api/genres", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server Error" }),
      });
    });
    await page.route("**/api/tracks*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server Error" }),
      });
    });

    await mount(<MusicManager />);

    // UI should still be functional even with API errors
    await expect(page.getByTestId("search-input")).toBeVisible();
    await expect(page.getByTestId("create-track-button")).toBeVisible();
    await expect(page.getByTestId("filter-genre")).toBeVisible();

    // should be able to interact with search input
    const searchInput = page.getByTestId("search-input");
    const testValue = faker.lorem.word();
    await searchInput.fill(testValue);
    await expect(searchInput).toHaveValue(testValue);
  });
});
