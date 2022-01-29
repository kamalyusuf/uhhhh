import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"rtp capabilities"> = {
  on: "rtp capabilities",
  invoke: async ({ payload, cb }) => {
    const room = await MediasoupRoom.findOrCreate(payload.room_id);
    cb({
      rtp_capabilities: room.rtpCapabilities
    });
  }
};

export default handler;
