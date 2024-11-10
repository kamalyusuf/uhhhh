import { Room } from "../../room/room.model.js";
import { BadRequestError } from "@kamalyb/errors";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"room login"> = {
  on: "room login",
  input: (s) => ({
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
