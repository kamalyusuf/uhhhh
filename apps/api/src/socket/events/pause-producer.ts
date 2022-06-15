import { Event } from "../types";

const handler: Event<"pause producer"> = {
  on: "pause producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.active_room_id) return;

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) return;

    await producer.pause();

    cb();
  }
};

export default handler;
