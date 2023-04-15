import type { CallbackEvent } from "../types";
import { NoProducerFoundError, NotInRoomError } from "../utils";

export const handler: CallbackEvent<"pause producer"> = {
  on: "pause producer",
  invoke: async ({ peer, data, cb }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const producer = peer.producers.get(data.producer_id);

    if (!producer) throw new NoProducerFoundError();

    await producer.pause();

    cb();
  }
};
