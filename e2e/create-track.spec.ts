import { faker } from "@faker-js/faker";
import { expect, type Page, test } from "@playwright/test";

const availableGenres = [
  "Rock",
  "Pop",
  "Hip Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "R&B",
  "Country",
  "Folk",
  "Reggae",
  "Metal",
  "Blues",
  "Indie",
];

const getRandomGenres = (count: number, exclude: string[] = []): string[] => {
  const filtered = availableGenres.filter((genre) => !exclude.includes(genre));
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

interface MockTrackData {
  title: string;
  artist: string;
  album: string;
  genres: string[];
  coverImage: string;
}

const createMockTrack = (
  genreCount = 2,
  excludeGenres: string[] = []
): MockTrackData => ({
  title: faker.music.songName(),
  artist: faker.person.fullName(),
  album: faker.music.album(),
  genres: getRandomGenres(genreCount, excludeGenres),
  coverImage: faker.image.url(),
});

const mockTrack = createMockTrack();

const openCreateTrackDialog = async (page: Page) => {
  await page.getByTestId("create-track-button").click();
  await expect(page.getByTestId("create-track-dialog")).toBeVisible();
};

const selectGenres = async (page: Page, genres: string[]) => {
  await page.getByTestId("genre-selector").click();
  await page.getByTestId("genre-options-list").waitFor({ state: "visible" });

  for (const genre of genres) {
    const genreTestId = `genre-option-${genre
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    await page.getByTestId(genreTestId).click();
  }

  // close the popover
  await page.keyboard.press("Escape");
};

const getLastCreatedTrackRow = async (page: Page) => {
  // wait for tracks to load and get the first row
  await page.waitForSelector('[data-testid="track-item"]');
  const trackRows = page.locator('[data-testid="track-item"]');
  const firstTrackRow = trackRows.first();

  const trackId = await firstTrackRow.getAttribute("data-track-id");
  if (!trackId) throw new Error("Track ID not found in data attribute");

  const titleElement = firstTrackRow.locator(
    `[data-testid="track-item-${trackId}-title"]`
  );

  return {
    row: firstTrackRow,
    trackId: trackId,
    titleElement: titleElement,
  };
};

const getTrackDataFromRow = async (
  page: Page,
  trackId: string
): Promise<MockTrackData> => {
  const row = page.locator(
    `[data-testid="track-item"][data-track-id="${trackId}"]`
  );

  const title = await row
    .locator(`[data-testid="track-item-${trackId}-title"]`)
    .textContent();
  const artist = await row
    .locator(`[data-testid="track-item-${trackId}-artist"]`)
    .textContent();
  const album = await row.locator("td").nth(4).textContent();

  // extract cover image URL from img element in cover cell
  const coverImageElement = row.locator("td").nth(1).locator("img");
  const coverImage = await coverImageElement.getAttribute("src");

  const genreBadges = row.locator("td").nth(5).locator('[data-testid="badge"]');
  const genreCount = await genreBadges.count();
  const genres: string[] = [];
  for (let i = 0; i < genreCount; i++) {
    const genreText = await genreBadges.nth(i).textContent();
    if (genreText) genres.push(genreText.trim());
  }

  return {
    title: title?.trim() ?? "",
    artist: artist?.trim() ?? "",
    album: album?.trim() ?? "",
    genres,
    coverImage: coverImage ?? "",
  };
};

const compareTrackData = (expected: MockTrackData, actual: MockTrackData) => {
  expect(actual.title).toBe(expected.title);
  expect(actual.artist).toBe(expected.artist);
  expect(actual.album).toBe(expected.album);
  expect(actual.genres).toEqual(expected.genres);
  expect(actual.coverImage).toBe(expected.coverImage);
};

test.describe("Create Track", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("create-track-button")).toBeVisible();
  });

  test("should show validation errors for empty required fields", async ({
    page,
  }) => {
    await openCreateTrackDialog(page);

    await expect(page.getByTestId("submit-button")).toBeDisabled();

    // fill some fields but not all required ones
    await page.getByTestId("input-title").fill(mockTrack.title);
    await expect(page.getByTestId("submit-button")).toBeDisabled();

    await page.getByTestId("input-artist").fill(mockTrack.artist);
    // Still missing required genres, so button should remain disabled
    await expect(page.getByTestId("submit-button")).toBeDisabled();
  });

  test("should show error messages when fields are cleared after being filled", async ({
    page,
  }) => {
    await openCreateTrackDialog(page);

    // fill title and then clear it to trigger validation error
    await page.getByTestId("input-title").fill(mockTrack.title);
    await page.getByTestId("input-title").clear();
    await page.getByTestId("input-title").blur();

    // should show error message
    await expect(page.getByTestId("error-title")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeDisabled();

    // fill artist and then clear it
    await page.getByTestId("input-artist").fill(mockTrack.artist);
    await page.getByTestId("input-artist").clear();
    await page.getByTestId("input-artist").blur();

    // should show error message
    await expect(page.getByTestId("error-artist")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeDisabled();

    // fix the errors by filling required fields
    await page.getByTestId("input-title").fill(mockTrack.title);
    await page.getByTestId("input-artist").fill(mockTrack.artist);

    // add required genres
    await selectGenres(page, ["Rock"]);

    // error messages should disappear and button should be enabled
    await expect(page.getByTestId("error-title")).not.toBeVisible();
    await expect(page.getByTestId("error-artist")).not.toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeEnabled();
  });

  test("should allow canceling track creation", async ({ page }) => {
    await openCreateTrackDialog(page);

    // fill some fields
    await page.getByTestId("input-title").fill(mockTrack.title);
    await page.getByTestId("input-artist").fill(mockTrack.artist);

    // cancel the dialog
    await page.getByTestId("cancel-button").click();

    // verify dialog is closed
    await expect(page.getByTestId("create-track-dialog")).not.toBeVisible();

    // verify track was not created
    await expect(page.getByText(mockTrack.title)).not.toBeVisible();
  });

  test("should handle server errors gracefully", async ({ page }) => {
    // mock server error response
    await page.route("**/api/tracks", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    await openCreateTrackDialog(page);

    await page.getByTestId("input-title").fill(mockTrack.title);
    await page.getByTestId("input-artist").fill(mockTrack.artist);

    // Add required genre
    await selectGenres(page, ["Rock"]);

    // submit form
    await page.getByTestId("submit-button").click();

    // verify error message is shown
    await expect(page.getByText(/Failed to create track/)).toBeVisible();

    // verify dialog remains open for user to retry
    await expect(page.getByTestId("create-track-dialog")).toBeVisible();
  });

  test("should remain create button disabled until form is valid", async ({
    page,
  }) => {
    await openCreateTrackDialog(page);

    await expect(page.getByTestId("submit-button")).toBeDisabled();

    // fill required fields one by one and check button state
    await page.getByTestId("input-title").fill(mockTrack.title);
    await expect(page.getByTestId("submit-button")).toBeDisabled();

    await page.getByTestId("input-artist").fill(mockTrack.artist);
    await expect(page.getByTestId("submit-button")).toBeDisabled();

    // add genres, button should be enabled after all required fields
    await selectGenres(page, mockTrack.genres);

    // button should now be enabled as all required fields are filled
    await expect(page.getByTestId("submit-button")).toBeEnabled();
  });

  test("should complete full track lifecycle: create -> edit -> delete", async ({
    page,
  }) => {
    const trackData = createMockTrack();
    const updatedTrackData = createMockTrack(2, trackData.genres); // Different genres from original

    // create the track
    await openCreateTrackDialog(page);

    await page.getByTestId("input-title").fill(trackData.title);
    await page.getByTestId("input-artist").fill(trackData.artist);
    await page.getByTestId("input-album").fill(trackData.album);
    await page.getByTestId("input-cover-image").fill(trackData.coverImage);
    await selectGenres(page, trackData.genres);

    await page.getByTestId("submit-button").click();
    await expect(page.getByText("Track created successfully!")).toBeVisible();

    // get the last created track and verify its data
    const createdTrack = await getLastCreatedTrackRow(page);
    await expect(createdTrack.row).toBeVisible();

    // extract and compare track data from DOM
    const createdTrackData = await getTrackDataFromRow(
      page,
      createdTrack.trackId
    );
    compareTrackData(trackData, createdTrackData);

    // edit the track
    // find the track actions button and open menu
    const trackActionsButton = createdTrack.row.getByTestId(
      `track-actions-menu-${createdTrack.trackId}`
    );
    await trackActionsButton.click();

    // click edit option
    await page.getByText("Edit Metadata").click();

    // wait for edit dialog to open
    await expect(page.getByTestId("edit-track-dialog")).toBeVisible();
    await expect(
      page.getByText(`Edit Track: ${trackData.title}`)
    ).toBeVisible();

    // update the fields
    await page.getByTestId("input-title").clear();
    await page.getByTestId("input-title").fill(updatedTrackData.title);
    await page.getByTestId("input-artist").clear();
    await page.getByTestId("input-artist").fill(updatedTrackData.artist);
    await page.getByTestId("input-album").clear();
    await page.getByTestId("input-album").fill(updatedTrackData.album);
    await page.getByTestId("input-cover-image").clear();
    await page
      .getByTestId("input-cover-image")
      .fill(updatedTrackData.coverImage);

    // clear existing genres and add new ones
    // first clear existing genres by clicking on the X buttons in badges
    const existingGenreBadges = page.locator(
      '[aria-label*="Remove"][aria-label*="genre"]'
    );
    const badgeCount = await existingGenreBadges.count();
    for (let i = 0; i < badgeCount; i++) {
      await existingGenreBadges.first().click();
    }

    // add new genres
    await selectGenres(page, updatedTrackData.genres);

    // submit the edit
    await page.getByTestId("submit-button").click();
    await expect(
      page.getByText(`Track "${updatedTrackData.title}" updated successfully!`)
    ).toBeVisible();

    // verify updated track data from DOM
    const updatedTrack = await getLastCreatedTrackRow(page);
    const updatedTrackDataFromDom = await getTrackDataFromRow(
      page,
      updatedTrack.trackId
    );
    compareTrackData(updatedTrackData, updatedTrackDataFromDom);

    // delete the track
    // find the updated track actions button and open menu
    const updatedTrackActionsButton = updatedTrack.row.getByTestId(
      `track-actions-menu-${updatedTrack.trackId}`
    );
    await updatedTrackActionsButton.click();

    // click delete option
    await page.getByText("Delete Track").click();

    // confirm deletion in the alert dialog
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await expect(page.getByText("Are you absolutely sure?")).toBeVisible();
    await page.getByTestId("confirm-delete").click();

    // verify deletion success and track is removed from table
    await expect(
      page.getByText(`Track "${updatedTrackData.title}" deleted successfully!`)
    ).toBeVisible();

    // verify the specific track is no longer in the table
    await expect(
      page.locator(
        `[data-testid="track-item"][data-track-id="${updatedTrack.trackId}"]`
      )
    ).not.toBeVisible();
  });
});
