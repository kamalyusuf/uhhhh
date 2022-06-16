import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { RoomVisibility, RoomSpan, Room } from "types";
import { BadRequestError } from "@kamalyb/errors";

const handler: Event<"create room"> = {
  on: "create room",
  invoke: async ({ payload, cb, io, peer }) => {
    let name = payload.name;
    let span;

    if (name.trim().startsWith("**")) {
      [name] = name
        .split("**")
        .map((n) => n.trim())
        .filter(Boolean);

      if (!name) throw new BadRequestError("name is required");

      span = RoomSpan.PERMANENT;
    }

    const room = await deps.room.create({
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

    const r: Room = {
      _id: room._id.toString(),
      created_at: room.created_at.toISOString(),
      updated_at: room.updated_at.toISOString(),
      creator: room.creator,
      name: room.name,
      description: room.description,
      visibility: room.visibility,
      status: room.status,
      members_count: msr.count()
    };

    if (room.visibility === RoomVisibility.PUBLIC)
      io.emit("create room", { room: r });

    cb({
      room: r
    });
  }
};

export default handler;
