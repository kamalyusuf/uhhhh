import { CallbackEvent } from "../types";
import { isValidObjectId } from "../../../utils/mongo";
import { ValidationError } from "@kamalyb/errors";

export const handler: CallbackEvent<"room"> = {
  on: "room",
  invoke: async ({ payload, cb }) => {
    if (!isValidObjectId(payload.room_id))
      throw new ValidationError({ message: "invalid id" });

    const room = await deps.room.findById(payload.room_id);

    cb({ room: room.toJSON() });
  }
};
