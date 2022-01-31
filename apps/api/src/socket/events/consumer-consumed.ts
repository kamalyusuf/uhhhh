import { Event } from "../types";
import { logger } from "../../lib/logger";

const handler: Event<"consumer consumed"> = {
  on: "consumer consumed",
  invoke: async ({ peer, payload }) => {
    const consumer = peer.consumers.get(payload.consumer_id);
    if (!consumer) {
      logger.log({
        level: "warning",
        dev: true,
        message: `[consumer consumed] consumer with id ${payload.consumer_id} not found for peer ${peer.user.display_name}`
      });

      return;
    }

    await consumer.resume();
  }
};

export default handler;
