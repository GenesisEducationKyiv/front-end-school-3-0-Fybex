import { createRouterTransport } from "@connectrpc/connect";
import {
  dateToTimestamp,
  GenresService,
  TracksService,
} from "@music-app/proto";

import { genres } from "./fakerMocks";

export const mockTransport = createRouterTransport(({ service }) => {
  service(GenresService, {
    getGenres: () => ({ genres }),
  });
  service(TracksService, {
    createTrack: (req) => ({
      track: {
        title: req.title,
        artist: req.artist,
        album: req.album ?? "",
        genres: req.genres,
        coverImage: req.coverImage ?? "",
        audioFile: "",
        createdAt: dateToTimestamp(new Date()),
        updatedAt: dateToTimestamp(new Date()),
      },
    }),
  });
});
