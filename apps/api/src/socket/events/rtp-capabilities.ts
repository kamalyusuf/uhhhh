import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"rtp capabilities"> = {
  on: "rtp capabilities",
  invoke: async ({ payload, cb, io }) => {
    const room = await MediasoupRoom.findOrCreate(payload.room_id, io);
    cb({
      rtp_capabilities: room.rtpCapabilities
    });
  }
};

export default handler;
