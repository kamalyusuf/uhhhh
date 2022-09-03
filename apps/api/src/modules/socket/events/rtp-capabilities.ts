import type { Event } from "../types";
import { MediasoupRoom } from "../../../mediasoup/room";

export const handler: Event<"rtp capabilities"> = {
  on: "rtp capabilities",
  invoke: async ({ payload, cb, io }) => {
    const doc = await deps.room.findById(payload.room_id);

    const msr = await MediasoupRoom.findOrCreate(doc._id.toString(), io, doc);

    cb({
      rtp_capabilities: msr.rtpCapabilities
    });
  }
};
