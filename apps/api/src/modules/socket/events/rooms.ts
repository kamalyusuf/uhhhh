import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { RoomVisibility } from "types";
import { Room } from "../../room/room.model";

export const handler: CallbackEvent<"rooms"> = {
  on: "rooms",
  invoke: async ({ cb }) => {
    const data = await Room.find(
      {
        visibility: {
          $eq: RoomVisibility.PUBLIC
        }
      },
      {},
      {
        lean: true,
        sort: {
          created_at: -1
        }
      }
    );

    const rooms = data.map((room) => {
      let r;

      try {
        r = MediasoupRoom.findbyid(room._id.toString());
      } catch (e) {}

      return {
        _id: room._id.toString(),
        name: room.name,
        description: room.description,
        created_at: room.created_at.toISOString(),
        updated_at: room.updated_at.toISOString(),
        members_count: r?.members_count ?? 0,
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
