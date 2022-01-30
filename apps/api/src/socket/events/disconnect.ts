import { TypedIO, TypedSocket } from "../types";
import { logger } from "../../lib/logger";
import { Peer } from "../../mediasoup/peer";
import { MediasoupRoom } from "../../mediasoup/room";

export const onDisconnect =
  ({ socket, peer }: { io: TypedIO; socket: TypedSocket; peer: Peer }) =>
  (reason: string) => {
    logger.log({
      level: "info",
      dev: true,
      message: `socket ${socket.id} disconnected because ${reason}`.magenta
    });
    if (!peer.activeRoomId) {
      return;
    }

    const room_id = peer.activeRoomId;
    const room = MediasoupRoom.findById(peer.activeRoomId);

    room.leave(peer);
    Peer.remove(peer);

    socket.to(room_id).emit("peer left", { peer: peer.user });
  };
