import { MediasoupRoom } from "../../mediasoup/room.js";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"leave"> = {
  on: "leave",
  invoke: async ({ peer, cb }) => {
    if (!peer.active_room_id) return cb();

    const rid = peer.active_room_id;
    const room = MediasoupRoom.findbyid(rid);

    await room.leave(peer);

    cb();
  }
};
