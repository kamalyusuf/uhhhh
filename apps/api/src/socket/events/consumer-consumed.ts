import { Event } from "../types";
import { logger } from "../../lib/logger";

const handler: Event<"consumer consumed"> = {
  on: "consumer consumed",
  invoke: async ({ peer, payload }) => {
    const consumer = peer.consumers.get(payload.consumer_id);

    if (!consumer) return;

    await consumer.resume();
  }
};

export default handler;
