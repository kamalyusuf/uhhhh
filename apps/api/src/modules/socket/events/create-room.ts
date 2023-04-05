import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { Room } from "../../room/room.model";
import { UnprocessableEntityError } from "@kamalyb/errors";

export const handler: CallbackEvent<"create room"> = {
  on: "create room",
  invoke: async ({ data, cb, io, peer }) => {
    if (data.password && data.password.length < 5)
      throw new UnprocessableEntityError(
        "passport must be at least 5 characters"
      );

    const room = await Room.create({
      ...data,
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

    if (!room.isprivate()) io.emit("create room", { room: r });

    cb({
      room: r
    });
  }
};
