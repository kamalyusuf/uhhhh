import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../../mediasoup/room";
import type { Room } from "types";

export const handler: CallbackEvent<"rooms"> = {
  on: "rooms",
  invoke: async ({ cb }) => {
    const data = await deps.room.find();

    const rooms: Room[] = data.map((room) => {
      let r;

      try {
        r = MediasoupRoom.findById(room._id.toString());
      } catch (e) {}

      return {
        _id: room._id.toString(),
        name: room.name,
        description: room.description,
        created_at: room.created_at.toISOString(),
        updated_at: room.updated_at.toISOString(),
        members_count: r?.count() ?? 0,
        visibility: room.visibility,
        creator: room.creator,
        status: room.status
      };
    });

    cb({
      rooms
    });
  }
};
