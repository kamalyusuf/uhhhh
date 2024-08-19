import consola from "consola";
import { Peer } from "../../mediasoup/peer.js";
import { MediasoupRoom } from "../../mediasoup/room.js";
import { env } from "../../../lib/env.js";
import { logger } from "../../../lib/logger.js";

export const ondisconnect = (peer: Peer) => async (reason: string) => {
  if (env.isDevelopment)
    consola.info(
      `peer ${peer.user.display_name} disconnected because ${reason}`
    );

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
