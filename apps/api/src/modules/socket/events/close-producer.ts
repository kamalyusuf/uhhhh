import type { CallbackEvent } from "../types";
import { NotJoinedError, NoProducerFoundError } from "../utils";

export const handler: CallbackEvent<"close producer"> = {
  on: "close producer",
  invoke: ({ peer, payload, cb }) => {
    if (!peer.active_room_id) throw new NotJoinedError();

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) throw new NoProducerFoundError(payload.producer_id);

    producer.close();

    peer.producers.delete(producer.id);

    cb();
  }
};
