import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { Room } from "../../room/room.model";

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
