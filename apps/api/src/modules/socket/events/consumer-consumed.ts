import type { Event } from "../types";
import { NoConsumerFoundError } from "../utils";

export const handler: Event<"consumer consumed"> = {
  on: "consumer consumed",
  invoke: async ({ peer, data }) => {
    const consumer = peer.consumers.get(data.consumer_id);

    if (!consumer) throw new NoConsumerFoundError(data.consumer_id);

    await consumer.resume();
  }
};
