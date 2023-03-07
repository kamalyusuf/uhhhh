import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { Room } from "../../room/room.model";

export const handler: CallbackEvent<"rtp capabilities"> = {
  on: "rtp capabilities",
  invoke: async ({ data, cb, io }) => {
    const doc = await Room.findById(data.room_id);

    if (!doc) throw new Error("no room found");

    const msr = await MediasoupRoom.findorcreate(io, doc);

    cb({
      rtp_capabilities: msr.rtpcapabilities
    });
  }
};
