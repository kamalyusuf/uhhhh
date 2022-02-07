import { roomService } from "../../modules/room/room.service";
import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { RoomVisibility } from "types";

const handler: Event<"create room"> = {
  on: "create room",
  invoke: async ({ payload, cb, io }) => {
    const room = await roomService.create(payload);
    const msr = await MediasoupRoom.create({
      id: room._id.toString(),
      io,
      doc: room
    });

    const r = {
      _id: room._id.toString(),
      name: room.name,
      description: room.description,
      created_at: room.created_at.toISOString(),
      updated_at: room.updated_at.toISOString(),
      members_count: msr.count(),
      visibility: room.visibility
    };

    if (room.visibility === RoomVisibility.PUBLIC) {
      io.emit("create room", { room: r });
    }

    cb({
      room: r
    });
  }
};

export default handler;
