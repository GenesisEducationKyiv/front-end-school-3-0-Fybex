import { faker } from "@faker-js/faker";
import { create, dateToTimestamp } from "@music-app/proto";
import { TrackSchema } from "@music-app/proto/tracks";

export const genres = Array.from({ length: 8 }, () => faker.music.genre());

export const mockTrack = create(TrackSchema, {
  id: faker.string.uuid(),
  title: faker.music.songName(),
  artist: faker.person.fullName(),
  album: faker.music.album(),
  genres: faker.helpers.arrayElements(
    genres,
    faker.number.int({ min: 1, max: 2 })
  ),
  slug: faker.helpers.slugify(faker.music.songName().toLowerCase()),
  coverImage: faker.image.urlPicsumPhotos({ width: 300, height: 300 }),
  audioFile: `${faker.string.uuid()}.mp3`,
  createdAt: dateToTimestamp(faker.date.past({ years: 30 })),
  updatedAt: dateToTimestamp(faker.date.recent()),
});
