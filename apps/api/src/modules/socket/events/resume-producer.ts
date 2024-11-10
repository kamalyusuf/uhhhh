import { NotInRoomError, NoProducerFoundError } from "../errors.js";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"resume producer"> = {
  on: "resume producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) throw new NoProducerFoundError();

    await producer.resume();

    cb();
  }
};
