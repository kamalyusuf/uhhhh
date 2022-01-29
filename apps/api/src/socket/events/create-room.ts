import { roomService } from "../../modules/room/room.service";
import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"create room"> = {
  on: "create room",
  invoke: async ({ payload, cb }) => {
    const room = await roomService.create(payload);
    await MediasoupRoom.create({ id: room._id.toString() });
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
