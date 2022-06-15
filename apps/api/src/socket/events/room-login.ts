import { Event } from "../types";
import { Types } from "mongoose";
import { BadRequestError } from "@kamalyb/errors";

const handler: Event<"room login"> = {
  on: "room login",
  invoke: async ({ payload, cb }) => {
    const room = await deps.room.findById(new Types.ObjectId(payload.room_id));

    const ok = await room.verifyPassword(payload.password);
    if (!ok) throw new BadRequestError("incorrect password");

    cb({ ok });
  }
};

export default handler;
