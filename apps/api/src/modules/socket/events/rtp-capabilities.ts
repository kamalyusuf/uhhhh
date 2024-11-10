import { MediasoupRoom } from "../../mediasoup/room.js";
import { Room } from "../../room/room.model.js";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"rtp capabilities"> = {
  on: "rtp capabilities",
  invoke: async ({ payload, cb, io }) => {
    const doc = Room.findbyidorfail(payload.room_id);

    const msr = await MediasoupRoom.findorcreate(io, doc);

    cb({
      rtp_capabilities: msr.rtpcapabilities
    });
  }
};
