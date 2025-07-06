import { faker } from "@faker-js/faker";
import { expect, type Page, test } from "@playwright/test";

import { type TrackFormData } from "../src/components/TrackDialogs/types";

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

const getRandomGenres = (count: number): string[] => {
  const shuffled = [...availableGenres].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

type TrackData = Required<TrackFormData>;

const createTestTrack = (): TrackData => ({
  title: `Test Track ${faker.string.uuid().slice(0, 8)}`,
  artist: faker.person.fullName(),
  album: faker.music.album(),
  genres: getRandomGenres(2),
  coverImage: faker.image.url(),
});

const openCreateTrackDialog = async (page: Page) => {
  await page.getByTestId("create-track-button").click();
  await expect(page.getByTestId("create-track-dialog")).toBeVisible();
};

const selectGenres = async (page: Page, genres: string[]) => {
  await page.getByTestId("genre-selector").click();
  await page.getByTestId("genre-options-list").waitFor({ state: "visible" });

  for (const genre of genres) {
    await page.getByTestId("genre-option").filter({ hasText: genre }).click();
  }

  await page.keyboard.press("Escape");
};

const fillTrackForm = async (page: Page, trackData: TrackData) => {
  await page.getByTestId("input-title").fill(trackData.title);
  await page.getByTestId("input-artist").fill(trackData.artist);
  await page.getByTestId("input-album").fill(trackData.album);
  await page.getByTestId("input-cover-image").fill(trackData.coverImage);
  await selectGenres(page, trackData.genres);
};

const findCreatedTrack = async (page: Page, title: string) => {
  // wait for a track row with the specific title to appear
  const trackRow = page.locator(`[data-testid="track-item"]`).filter({
    hasText: title,
  });
  await trackRow.waitFor({ state: "visible" });

  const trackId = await trackRow.getAttribute("data-track-id");
  if (!trackId) throw new Error("Track ID not found");

  return { trackRow, trackId };
};

const deleteTrack = async (page: Page, trackId: string) => {
  // open actions menu
  const actionsButton = page.getByTestId(`track-actions-menu-${trackId}`);
  await actionsButton.click();

  // click delete option
  await page.getByTestId(`delete-track-${trackId}`).click();

  // confirm deletion
  await expect(page.getByTestId("confirm-dialog")).toBeVisible();
  await page.getByTestId("confirm-delete").click();

  // verify deletion success
  await waitForToast(page, "success");

  // verify track is removed from table
  await expect(
    page.locator(`[data-testid="track-item"][data-track-id="${trackId}"]`)
  ).not.toBeVisible();
};

async function waitForToast(page: Page, type: "success" | "error") {
  const toast = page
    .locator(`[data-sonner-toast][data-visible="true"][data-type="${type}"]`)
    .last();
  await expect(toast).toBeVisible();
}

test.describe("Track Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("create-track-button")).toBeVisible();
  });

  test("should create and delete a track successfully", async ({ page }) => {
    const trackData = createTestTrack();

    // create a new track
    await openCreateTrackDialog(page);
    await fillTrackForm(page, trackData);
    await page.getByTestId("submit-button").click();

    // verify track creation
    await waitForToast(page, "success");

    // wait for the created track to appear in the table
    const { trackRow, trackId } = await findCreatedTrack(page, trackData.title);

    // verify track data is displayed correctly
    await expect(trackRow.getByText(trackData.title)).toBeVisible();
    await expect(trackRow.getByText(trackData.artist)).toBeVisible();
    await expect(trackRow.getByText(trackData.album)).toBeVisible();

    // verify at least one genre is displayed
    const genreBadges = trackRow.locator('[data-testid="badge"]');
    await expect(genreBadges.first()).toBeVisible();

    // delete the track
    await deleteTrack(page, trackId);
  });

  test("should create, edit, and delete a track (full lifecycle)", async ({
    page,
  }) => {
    const originalTrack = createTestTrack();
    const updatedTrack = createTestTrack();

    // create a new track
    await openCreateTrackDialog(page);
    await fillTrackForm(page, originalTrack);
    await page.getByTestId("submit-button").click();
    await waitForToast(page, "success");

    // find and edit the track
    const { trackId } = await findCreatedTrack(page, originalTrack.title);

    // open edit dialog
    const actionsButton = page.getByTestId(`track-actions-menu-${trackId}`);
    await actionsButton.click();
    await page.getByTestId(`edit-track-${trackId}`).click();

    await expect(page.getByTestId("edit-track-dialog")).toBeVisible();

    // update track data
    await page.getByTestId("input-title").clear();
    await page.getByTestId("input-title").fill(updatedTrack.title);
    await page.getByTestId("input-artist").clear();
    await page.getByTestId("input-artist").fill(updatedTrack.artist);

    // clear existing genres
    const existingGenreBadges = page.locator(
      '[aria-label*="Remove"][aria-label*="genre"]'
    );
    const badgeCount = await existingGenreBadges.count();
    for (let i = 0; i < badgeCount; i++) {
      await existingGenreBadges.first().click();
    }

    // add new genres
    await selectGenres(page, updatedTrack.genres);

    // submit changes
    await page.getByTestId("submit-button").click();
    await waitForToast(page, "success");

    // verify changes
    const { trackRow: updatedRow, trackId: updatedTrackId } =
      await findCreatedTrack(page, updatedTrack.title);
    await expect(updatedRow.getByText(updatedTrack.title)).toBeVisible();
    await expect(updatedRow.getByText(updatedTrack.artist)).toBeVisible();

    // delete the track
    await deleteTrack(page, updatedTrackId);
  });

  test("should handle track creation cancellation", async ({ page }) => {
    const trackData = createTestTrack();

    // open dialog and fill some data
    await openCreateTrackDialog(page);
    await page.getByTestId("input-title").fill(trackData.title);
    await page.getByTestId("input-artist").fill(trackData.artist);

    // cancel the dialog
    await page.getByTestId("cancel-button").click();
    await expect(page.getByTestId("create-track-dialog")).not.toBeVisible();

    // verify no track was created
    await expect(page.getByText(trackData.title)).not.toBeVisible();
  });
});
