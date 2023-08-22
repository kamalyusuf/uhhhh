import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { RoomVisibility } from "types";
import { Room } from "../../room/room.model";

export const handler: CallbackEvent<"rooms"> = {
  on: "rooms",
  invoke: async ({ cb }) => {
    const data = await Room.find(
      {
        visibility: RoomVisibility.PUBLIC
      },
      {
        sort: {
          created_at: -1
        }
      }
    );

    const rooms = data.map((room) => ({
      _id: room._id.toString(),
      name: room.name,
      description: room.description,
      created_at: room.created_at.toISOString(),
      updated_at: room.updated_at.toISOString(),
      visibility: room.visibility,
      creator: room.creator,
      status: room.status,
      members_count:
        MediasoupRoom.findbyidsafe(room._id.toString())?.members_count ?? 0
    }));

    cb({ rooms });
  }
};
