import { MediasoupRoom } from "../../mediasoup/room.js";
import { NotInRoomError } from "../errors.js";
import type { Event } from "../types.js";

export const handler: Event<"active speaker"> = {
  on: "active speaker",
  input: (s) => ({
    speaking: s.boolean()
  }),
  invoke: ({ peer, payload, io }) => {
    if (!peer.active_room_id) return;

    const room = MediasoupRoom.findbyid(peer.active_room_id);

    if (!room.has(peer.user._id)) throw new NotInRoomError();

    io.to(room.id).emit("active speaker", {
      peer_id: peer.user._id,
      speaking: payload.speaking
    });
  }
};
