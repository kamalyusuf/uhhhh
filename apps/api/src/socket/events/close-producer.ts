import { Event } from "../types";

const handler: Event<"close producer"> = {
  on: "close producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.activeRoomId) {
      throw new Error("peer not a member of any room");
    }

    const producer = peer.producers.get(payload.producer_id);
    if (!producer) {
      throw new Error(`no producer with id ${payload.producer_id} found`);
    }

    producer.close();

    peer.producers.delete(producer.id);

    cb(undefined);
  }
};

export default handler;
