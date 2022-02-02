import { logger } from "../../lib/logger";
import { Peer } from "../../mediasoup/peer";
import { MediasoupRoom } from "../../mediasoup/room";

export const onDisconnect =
  ({ peer }: { peer: Peer }) =>
  async (reason: string) => {
    logger.log({
      level: "info",
      dev: true,
      message: `peer ${peer.user.display_name} disconnected because ${reason}`
        .magenta
    });

    if (!peer.activeRoomId) {
      logger.log({
        level: "warn",
        dev: true,
        message: `[onDisconnect] peer ${peer.user.display_name} isn't a member of any room. finna return`
      });

      return;
    }

    const rid = peer.activeRoomId;
    const room = MediasoupRoom.findById(rid);

    await room.leave(peer);
    peer.socket.to(rid).emit("peer left", { peer: peer.user });
    Peer.remove(peer);
  };
