import type { CallbackEvent } from "../types.js";
import { NoProducerFoundError, NotInRoomError } from "../utils.js";

export const handler: CallbackEvent<"pause producer"> = {
  on: "pause producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) throw new NoProducerFoundError();

    await producer.pause();

    cb();
  }
};
