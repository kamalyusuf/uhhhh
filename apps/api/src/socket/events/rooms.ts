import { Event } from "../types";
import { roomService } from "../../modules/room/room.service";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"rooms"> = {
  on: "rooms",
  invoke: async ({ cb }) => {
    const rooms = await roomService.find();
    cb({
      rooms: rooms.map((room) => {
        let r;

        try {
          r = MediasoupRoom.findById(room._id.toString());
        } catch (e) {}

        return {
          _id: room._id,
          name: room.name,
          description: room.description,
          created_at: room.created_at.toISOString(),
          updated_at: room.updated_at.toISOString(),
          members_count: r?.count() ?? 0,
          visibility: room.visibility,
          creator: room.creator
        };
      })
    });
  }
};

export default handler;
