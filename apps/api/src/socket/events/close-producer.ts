import { Event } from "../types";

const handler: Event<"close producer"> = {
  on: "close producer",
  invoke: ({ peer, payload, cb }) => {
    if (!peer.active_room_id) return;

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) return;
    // throw new Error(`no producer with id ${payload.producer_id} found`);

    producer.close();

    peer.producers.delete(producer.id);

    cb();
  }
};

export default handler;
