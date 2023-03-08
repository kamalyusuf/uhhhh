import { logger } from "../../../lib/logger";
import { Peer } from "../../mediasoup/peer";
import { MediasoupRoom } from "../../mediasoup/room";

export const ondisconnect = (peer: Peer) => async (reason: string) => {
  logger.cinfo(
    `peer ${peer.user.display_name} disconnected because ${reason}`.magenta
  );

  if (!peer.active_room_id) return;

  const rid = peer.active_room_id;

  try {
    const room = MediasoupRoom.findbyid(rid);

    await room.leave(peer);
  } catch (e) {
    const error = e as Error;

    logger.error(`failed to leave room. reason: ${error.message}`, error, {
      capture: true,
      extra: {
        user: peer.user
      }
    });
  }

  peer.socket.to(rid).emit("peer left", { peer: peer.user });

  Peer.remove(peer);
};
