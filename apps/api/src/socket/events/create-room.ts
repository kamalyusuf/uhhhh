import { roomService } from "../../modules/room/room.service";
import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { RoomVisibility, RoomSpan } from "types";

const handler: Event<"create room"> = {
  on: "create room",
  invoke: async ({ payload, cb, io, peer }) => {
    let name = payload.name;
    let span;

    if (name.trim().startsWith("**")) {
      name = name.split("**")[1];
      span = RoomSpan.PERMANENT;
    }

    const room = await roomService.create({
      ...payload,
      name,
      span,
      creator: peer.user
    });

    const msr = await MediasoupRoom.create({
      id: room._id.toString(),
      io,
      doc: room
    });

    const r = {
      ...room.toJSON(),
      created_at: room.created_at.toISOString(),
      updated_at: room.updated_at.toISOString(),
      members_count: msr.count()
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
