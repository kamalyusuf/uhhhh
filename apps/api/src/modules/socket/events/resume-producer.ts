import type { CallbackEvent } from "../types";
import { NotInRoomError, NoProducerFoundError } from "../utils";

export const handler: CallbackEvent<"resume producer"> = {
  on: "resume producer",
  invoke: async ({ peer, data, cb }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const producer = peer.producers.get(data.producer_id);

    if (!producer) throw new NoProducerFoundError();

    await producer.resume();

    cb();
  }
};
