import { Room } from "../../room/room.model.js";
import type { CallbackEvent, EventPayload } from "../types.js";
import { BadRequestError } from "@kamalyb/errors";

export const handler: CallbackEvent<"room login"> = {
  on: "room login",
  schema: (s) =>
    s.object<EventPayload<"room login">>({
      room_id: s.string(),
      password: s.string()
    }),
  invoke: async ({ payload, cb }) => {
    const room = Room.findbyidorfail(payload.room_id);

    if (!(await room.verifypassword(payload.password)))
      throw new BadRequestError("incorrect password");

    cb({ ok: true });
  }
};
