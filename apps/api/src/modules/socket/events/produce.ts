import { MediasoupRoom } from "../../mediasoup/room";
import type { CallbackEvent } from "../types";
import { NotJoinedError, NoTransportFoundError } from "../utils";

export const handler: CallbackEvent<"produce"> = {
  on: "produce",
  invoke: async ({
    peer,
    data: { room_id, transport_id, kind, rtp_parameters, app_data },
    cb
  }) => {
    if (!peer.active_room_id) throw new NotJoinedError();

    const room = MediasoupRoom.findbyid(room_id);

    if (!room.haspeer(peer.user._id) || peer.active_room_id !== room.id)
      throw new NotJoinedError();

    const transport = peer.transports.get(transport_id);

    if (!transport) throw new NoTransportFoundError(transport_id);

    const producer = await transport.produce({
      kind,
      rtpParameters: rtp_parameters,
      appData: {
        ...app_data,
        peer_id: peer.user._id
      }
    });

    peer.producers.set(producer.id, producer);

    const peers = room._peers().filter((p) => p.user._id !== peer.user._id);

    for (const p of peers)
      await room.createconsumer({
        consumer_peer: p,
        producer_peer: peer,
        producer: producer
      });

    cb({ id: producer.id });
  }
};
