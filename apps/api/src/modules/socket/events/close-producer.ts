import type { CallbackEvent } from "../types";
import { NotInRoomError, NoProducerFoundError } from "../utils";

export const handler: CallbackEvent<"close producer"> = {
  on: "close producer",
  invoke: ({ peer, data, cb }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const producer = peer.producers.get(data.producer_id);

    if (!producer) throw new NoProducerFoundError();

    producer.close();

    peer.producers.delete(producer.id);

    cb();
  }
};
