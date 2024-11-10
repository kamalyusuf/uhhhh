import { MediasoupRoom } from "../../mediasoup/room.js";
import { Room } from "../../room/room.model.js";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"create room"> = {
  on: "create room",
  input: (s) => ({
    name: s.string().min(3),
    description: s.string().optional().max(140).allow(""),
    visibility: s.string().valid("private", "public"),
    password: s.string().optional().min(5)
  }),
  invoke: async ({ payload, cb, io, peer, socket }) => {
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

    if (room.ispublic()) socket.broadcast.emit("create room", { room: r });

    cb({
      room: r
    });
  }
};
