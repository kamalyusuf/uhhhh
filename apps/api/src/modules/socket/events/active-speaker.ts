import { MediasoupRoom } from "../../../mediasoup/room";
import type { Event } from "../types";
import { NotJoinedError } from "../utils";

export const handler: Event<"active speaker"> = {
  on: "active speaker",
  invoke: ({ peer, payload, io }) => {
    // if (!peer.active_room_id) throw new NotJoinedError();
    if (!peer.active_room_id) return;

    const room = MediasoupRoom.findById(peer.active_room_id);

    if (!room.hasPeer(peer.user._id)) throw new NotJoinedError();

    io.to(room.id).emit("active speaker", {
      peer_id: peer.user._id,
      speaking: payload.speaking
    });
  }
};
