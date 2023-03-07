import { Room } from "../../room/room.model";
import type { CallbackEvent } from "../types";
import { BadRequestError, NotFoundError } from "@kamalyb/errors";

export const handler: CallbackEvent<"room login"> = {
  on: "room login",
  invoke: async ({ data, cb }) => {
    const room = await Room.findById(data.room_id);

    if (!room) throw new NotFoundError("no room found");

    if (!(await room.verifypassword(data.password)))
      throw new BadRequestError("incorrect password");

    cb({ ok: true });
  }
};
