import type { CallbackEvent } from "../types";
import { NotJoinedError, NoProducerFoundError } from "../utils";

export const handler: CallbackEvent<"resume producer"> = {
  on: "resume producer",
  invoke: async ({ peer, data, cb }) => {
    if (!peer.active_room_id) throw new NotJoinedError();

    const producer = peer.producers.get(data.producer_id);

    if (!producer) throw new NoProducerFoundError(data.producer_id);

    await producer.resume();

    cb();
  }
};
