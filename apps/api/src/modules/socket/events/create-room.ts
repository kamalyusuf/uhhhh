import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { type Room as IRoom } from "types";
import { Room } from "../../room/room.model";

export const handler: CallbackEvent<"create room"> = {
  on: "create room",
  invoke: async ({ data, cb, io, peer }) => {
    const room = await Room.create({
      ...data,
      creator: peer.user
    });

    const msr = await MediasoupRoom.create({
      io,
      doc: room
    });

    const r: IRoom = {
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

    if (!room.isprivate()) io.emit("create room", { room: r });

    cb({
      room: r
    });
  }
};
