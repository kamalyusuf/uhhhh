import { Event } from "../types";
import { NotJoinedError, NoProducerFoundError } from "../../utils/socket";

const handler: Event<"resume producer"> = {
  on: "resume producer",
  invoke: async ({ peer, payload, cb }) => {
    if (!peer.active_room_id) throw new NotJoinedError();

    const producer = peer.producers.get(payload.producer_id);

    if (!producer) throw new NoProducerFoundError(payload.producer_id);

    await producer.resume();

    cb();
  }
};

export default handler;
