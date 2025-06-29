import type { ConnectRouter } from '@connectrpc/connect';

import { MusicService } from './generated/music/v1/music_pb';
import { musicService } from './music.service';

export default (router: ConnectRouter) => {
  router.service(MusicService, musicService);
};
