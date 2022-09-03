import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../../mediasoup/room";

export const handler: CallbackEvent<"leave"> = {
  on: "leave",
  invoke: async ({ peer, socket, cb }) => {
    if (!peer.active_room_id) return cb();

    const rid = peer.active_room_id;
    const room = MediasoupRoom.findById(rid);

    await room.leave(peer);

    socket.leave(rid);
    socket.to(rid).emit("peer left", { peer: peer.user });

    cb();
  }
};
