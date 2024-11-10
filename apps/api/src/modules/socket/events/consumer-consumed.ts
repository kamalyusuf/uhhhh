import { NoConsumerFoundError } from "../errors.js";
import type { Event } from "../types.js";

export const handler: Event<"consumer consumed"> = {
  on: "consumer consumed",
  invoke: async ({ peer, payload }) => {
    const consumer = peer.consumers.get(payload.consumer_id);

    if (!consumer) throw new NoConsumerFoundError();

    await consumer.resume();
  }
};
