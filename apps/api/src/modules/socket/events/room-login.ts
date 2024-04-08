import { Room } from "../../room/room.model";
import type { CallbackEvent } from "../types";
import { BadRequestError } from "@kamalyb/errors";

export const handler: CallbackEvent<"room login"> = {
  on: "room login",
  invoke: async ({ payload, cb }) => {
    const room = Room.findbyidorfail(payload.room_id);

    if (!(await room.verifypassword(payload.password)))
      throw new BadRequestError("incorrect password");

    cb({ ok: true });
  }
};
