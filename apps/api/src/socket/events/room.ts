import { roomService } from "../../modules/room/room.service";
import { Event } from "../types";
import { Types } from "mongoose";

const handler: Event<"room"> = {
  on: "room",
  invoke: async ({ payload, cb }) => {
    const room = await roomService.findById(new Types.ObjectId(payload._id));
    cb({
      room: {
        ...room.toJSON(),
        created_at: room.created_at.toISOString(),
        updated_at: room.updated_at.toISOString()
      }
    });
  }
};

export default handler;
