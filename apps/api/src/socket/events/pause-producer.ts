import { Event } from "../types";
import { NoProducerFoundError, NotJoinedError } from "../../utils/socket";

const handler: Event<"pause producer"> = {
  on: "pause producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.active_room_id) throw new NotJoinedError();

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) throw new NoProducerFoundError(payload.producer_id);

    await producer.pause();

    cb();
  }
};

export default handler;
