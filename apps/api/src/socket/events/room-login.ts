import { Event } from "../types";
import { BadRequestError } from "@kamalyb/errors";
import { toObjectId } from "../../utils/object-id";

const handler: Event<"room login"> = {
  on: "room login",
  invoke: async ({ payload, cb }) => {
    const room = await deps.room.findById(toObjectId(payload.room_id));

    const ok = await room.verifyPassword(payload.password);

    if (!ok) throw new BadRequestError("incorrect password");

    cb({ ok });
  }
};

export default handler;
