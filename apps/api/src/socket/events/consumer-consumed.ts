import { Event } from "../types";
import { logger } from "../../lib/logger";
import { NoConsumerFoundError } from "../../utils/socket";

const handler: Event<"consumer consumed"> = {
  on: "consumer consumed",
  invoke: async ({ peer, payload }) => {
    const consumer = peer.consumers.get(payload.consumer_id);

    if (!consumer) throw new NoConsumerFoundError(payload.consumer_id);

    await consumer.resume();
  }
};

export default handler;
