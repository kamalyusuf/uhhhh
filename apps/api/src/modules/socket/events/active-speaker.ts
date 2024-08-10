import { MediasoupRoom } from "../../mediasoup/room.js";
import type { Event, EventPayload } from "../types.js";
import { NotInRoomError } from "../utils.js";

export const handler: Event<"active speaker"> = {
  on: "active speaker",
  schema: (s) =>
    s.object<EventPayload<"active speaker">>({
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
