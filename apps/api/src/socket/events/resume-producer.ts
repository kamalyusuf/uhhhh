import { Event } from "../types";

const handler: Event<"resume producer"> = {
  on: "resume producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.active_room_id) {
      throw new Error("peer not a member of any room");
    }

    const producer = peer.producers.get(payload.producer_id);
    if (!producer) {
      throw new Error(`no producer with id ${payload.producer_id} found`);
    }

    await producer.resume();

    cb(undefined);
  }
};

export default handler;
