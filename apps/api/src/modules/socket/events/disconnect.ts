import { logger } from "../../../lib/logger.js";
import { Peer } from "../../mediasoup/peer.js";
import { MediasoupRoom } from "../../mediasoup/room.js";

export const ondisconnect = (peer: Peer) => async (reason: string) => {
  logger.cinfo(`peer ${peer.user.display_name} disconnected because ${reason}`);

  if (!peer.active_room_id) return;

  const rid = peer.active_room_id;

  try {
    const room = MediasoupRoom.findbyid(rid);

    await room.leave(peer);
  } catch (e) {
    const error = e as Error;

    logger.error(`failed to leave room. reason: ${error.message}`, error);
  }

  peer.socket.to(rid).emit("peer left", { peer: peer.user });

  Peer.remove(peer);
};
