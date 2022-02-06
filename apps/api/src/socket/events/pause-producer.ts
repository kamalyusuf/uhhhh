import { Event } from "../types";

const handler: Event<"pause producer"> = {
  on: "pause producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.active_room_id) {
      throw new Error("peer not a member of any room");
    }

    const producer = peer.producers.get(payload.producer_id);
    if (!producer) {
      throw new Error(`no producer with id ${payload.producer_id} found`);
    }

    await producer.pause();

    cb(undefined);
  }
};

export default handler;
