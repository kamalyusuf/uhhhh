import type { CallbackEvent } from "../types";
import { BadRequestError } from "@kamalyb/errors";

export const handler: CallbackEvent<"room login"> = {
  on: "room login",
  invoke: async ({ payload, cb }) => {
    const room = await deps.room.findById(payload.room_id);

    const ok = await room.verifyPassword(payload.password);

    if (!ok) throw new BadRequestError("incorrect password");

    cb({ ok });
  }
};
