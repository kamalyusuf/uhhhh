import type { Event } from "../types";
import { NoConsumerFoundError } from "../utils";

export const handler: Event<"consumer consumed"> = {
  on: "consumer consumed",
  invoke: async ({ peer, payload }) => {
    const consumer = peer.consumers.get(payload.consumer_id);

    if (!consumer) throw new NoConsumerFoundError();

    await consumer.resume();
  }
};
