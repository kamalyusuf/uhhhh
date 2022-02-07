import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";
import { roomService } from "../../modules/room/room.service";
import { Types } from "mongoose";

const handler: Event<"rtp capabilities"> = {
  on: "rtp capabilities",
  invoke: async ({ payload, cb, io }) => {
    const doc = await roomService.findById(new Types.ObjectId(payload.room_id));
    const msr = await MediasoupRoom.findOrCreate(doc._id.toString(), io, doc);

    cb({
      rtp_capabilities: msr.rtpCapabilities
    });
  }
};

export default handler;
