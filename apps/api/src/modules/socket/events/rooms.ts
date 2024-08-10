import type { CallbackEvent } from "../types.js";
import { MediasoupRoom } from "../../mediasoup/room.js";
import { Room } from "../../room/room.model.js";

export const handler: CallbackEvent<"rooms"> = {
  on: "rooms",
  invoke: async ({ cb }) => {
    const data = Room.find();

    const rooms = data.map((room) => ({
      ...room.json(),
      members_count: MediasoupRoom.findbyidsafe(room._id)?.members_count ?? 0
    }));

    cb({ rooms });
  }
};
