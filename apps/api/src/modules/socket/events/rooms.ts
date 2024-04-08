import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { Room } from "../../room/room.model";

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
