import { MediasoupRoom } from "../../mediasoup/room";
import type { Event } from "../types";
import { NotJoinedError } from "../utils";

export const handler: Event<"active speaker"> = {
  on: "active speaker",
  invoke: ({ peer, data, io }) => {
    // if (!peer.active_room_id) throw new NotJoinedError();

    if (!peer.active_room_id) return;

    const room = MediasoupRoom.findbyid(peer.active_room_id);

    if (!room.has(peer.user._id)) throw new NotJoinedError();

    io.to(room.id).emit("active speaker", {
      peer_id: peer.user._id,
      speaking: data.speaking
    });
  }
};
