import { roomService } from "../../modules/room/room.service";
import { Event } from "../types";

const handler: Event<"create room"> = {
  on: "create room",
  invoke: async ({ payload, cb }) => {
    const room = await roomService.create(payload);
    cb({
      room: {
        _id: room._id,
        name: room.name,
        description: room.description,
        created_at: room.created_at.toISOString(),
        updated_at: room.updated_at.toISOString()
      }
    });
  }
};

export default handler;
