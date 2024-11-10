import { MediasoupRoom } from "../../mediasoup/room.js";
import { NotInRoomError, NoTransportFoundError } from "../errors.js";
import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"produce"> = {
  on: "produce",
  invoke: async ({
    peer,
    payload: { room_id, transport_id, kind, rtp_parameters, app_data },
    cb
  }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const room = MediasoupRoom.findbyid(room_id);

    if (!room.has(peer.user._id) || peer.active_room_id !== room.id)
      throw new NotInRoomError();

    const transport = peer.transports.get(transport_id);

    if (!transport) throw new NoTransportFoundError();

    const producer = await transport.produce({
      kind,
      rtpParameters: rtp_parameters,
      appData: {
        ...app_data,
        peer_id: peer.user._id
      }
    });

    peer.producers.set(producer.id, producer);

    const peers = room.findpeers({ except: peer.user._id });

    for (const otherpeer of peers)
      await room.createconsumer({
        consumer_peer: otherpeer,
        producer_peer: peer,
        producer: producer
      });

    cb({ id: producer.id });
  }
};
