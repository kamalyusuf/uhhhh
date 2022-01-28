import { Event } from "../types";
import { roomService } from "../../modules/room/room.service";

const handler: Event<"rooms"> = {
  on: "rooms",
  invoke: async ({ cb }) => {
    const rooms = await roomService.find();
    cb({
      rooms: rooms.map((room) => ({
        _id: room._id,
        name: room.name,
        description: room.description,
        created_at: room.created_at.toISOString(),
        updated_at: room.updated_at.toISOString()
      }))
    });
  }
};

export default handler;
