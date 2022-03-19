import { Event } from "../types";
import { roomService } from "../../modules/room/room.service";
import { Types } from "mongoose";
import { BadRequestError } from "@kamalyb/errors";

const handler: Event<"room login"> = {
  on: "room login",
  invoke: async ({ payload, cb }) => {
    const room = await roomService.findById(
      new Types.ObjectId(payload.room_id)
    );

    const ok = await room.comparePassword(payload.password);
    if (!ok) {
      throw new BadRequestError("incorrect password");
    }

    cb({ ok });
  }
};

export default handler;
