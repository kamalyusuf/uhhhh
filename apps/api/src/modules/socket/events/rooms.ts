import { MediasoupRoom } from "../../mediasoup/room.js";
import { Room } from "../../room/room.model.js";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"rooms"> = {
  on: "rooms",
  invoke: async ({ cb }) => {
    const rooms = Room.find().map((room) => ({
      ...room.json(),
      members_count: MediasoupRoom.findbyidsafe(room._id)?.members_count ?? 0
    }));

    cb({ rooms });
  }
};
