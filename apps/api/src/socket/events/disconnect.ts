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

    if (!peer.active_room_id) return;

    const rid = peer.active_room_id;
    const room = MediasoupRoom.findById(rid);

    try {
      await room.leave(peer);
    } catch (e) {}

    peer.socket.to(rid).emit("peer left", { peer: peer.user });

    Peer.remove(peer);
  };
