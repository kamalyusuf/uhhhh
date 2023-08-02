import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { Room } from "../../room/room.model";

export const handler: CallbackEvent<"create room"> = {
  on: "create room",
  invoke: async ({ payload, cb, io, peer }) => {
    const room = await Room.create({
      ...payload,
      creator: peer.user
    });

    const msr = await MediasoupRoom.create({
      io,
      doc: room
    });

    const r = {
      _id: room._id.toString(),
      created_at: room.created_at.toISOString(),
      updated_at: room.updated_at.toISOString(),
      creator: room.creator,
      name: room.name,
      description: room.description,
      visibility: room.visibility,
      status: room.status,
      members_count: msr.members_count
    };

    if (room.ispublic()) io.emit("create room", { room: r });

    cb({
      room: r
    });
  }
};
