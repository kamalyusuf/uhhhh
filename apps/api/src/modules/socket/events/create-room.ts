import type { CallbackEvent, EventPayload } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { Room } from "../../room/room.model";
import { RoomVisibility } from "types";

export const handler: CallbackEvent<"create room"> = {
  on: "create room",
  schema: (s) =>
    s.object<EventPayload<"create room">>({
      description: s.string().optional().valid("").max(140),
      name: s.string(),
      password: s.string().optional().min(5),
      visibility: s.string().valid(...Object.values(RoomVisibility))
    }),
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
      ...room.json(),
      members_count: msr.members_count
    };

    if (room.ispublic()) io.emit("create room", { room: r });

    cb({
      room: r
    });
  }
};
