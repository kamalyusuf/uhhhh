import { NotInRoomError, NoProducerFoundError } from "../errors.js";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"close producer"> = {
  on: "close producer",
  invoke: ({ peer, payload, cb }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) throw new NoProducerFoundError();

    producer.close();

    peer.producers.delete(producer.id);

    cb();
  }
};
