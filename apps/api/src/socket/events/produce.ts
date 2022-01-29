import { MediasoupRoom } from "../../mediasoup/room";
import { Event } from "../types";

const handler: Event<"produce"> = {
  on: "produce",
  invoke: async ({
    io,
    peer,
    payload: { room_id, transport_id, kind, rtp_parameters, app_data },
    cb
  }) => {
    const room = MediasoupRoom.findById(room_id);
    if (!room.hasPeer(peer.user._id)) {
      throw new Error("peer not yet joined");
    }

    const transport = peer.transports.get(transport_id);
    if (!transport) {
      throw new Error(`no transport with id ${transport_id} found`);
    }

    const producer = await transport.produce({
      kind,
      rtpParameters: rtp_parameters,
      appData: {
        ...app_data,
        peer_id: peer.user._id
      }
    });

    peer.producers.set(producer.id, producer);

    const peers = room._peers();

    for (const p of peers) {
      if (!room.hasPeer(p.user._id) || p.user._id === peer.user._id) {
        continue;
      }

      await room.createConsumer({
        io,
        consumer_peer: p,
        producer_peer: peer,
        producer
      });
    }

    // for (const p of peers) {
    //   if (!room.hasPeer(p.user._id) || p.user._id === peer.user._id) {
    //     continue;
    //   }
    //
    //   if (
    //     !p.rtpCapabilities ||
    //     !room.router.canConsume({
    //       producerId: producer.id,
    //       rtpCapabilities: p.rtpCapabilities
    //     })
    //   ) {
    //     continue;
    //   }
    //
    //   const transports = Array.from(p.transports.values());
    //   const transport = transports.find(
    //     (t) => t.appData.direction === "receive"
    //   );
    //   if (!transport) {
    //     continue;
    //   }
    //
    //   const consumer = await transport.consume({
    //     producerId: producer.id,
    //     rtpCapabilities: p.rtpCapabilities,
    //     paused: true
    //   });
    //
    //   p.consumers.set(consumer.id, consumer);
    //
    //   consumer.on("transportclose", () => {
    //     p.consumers.delete(consumer.id);
    //   });
    //
    //   consumer.on("producerclose", () => {
    //     p.consumers.delete(consumer.id);
    //     io.to(p.user._id).emit("consumer closed", { consumer_id: consumer.id });
    //   });
    //
    //   consumer.on("producerpause", () => {
    //     io.to(p.user._id).emit("consumer paused", { consumer_id: consumer.id });
    //   });
    //
    //   consumer.on("producerresume", () => {
    //     io.to(p.user._id).emit("consumer resumed", {
    //       consumer_id: consumer.id
    //     });
    //   });
    //
    //   consumer.on("score", (score) => {
    //     io.to(p.user._id).emit("consumer score", {
    //       consumer_id: consumer.id,
    //       score
    //     });
    //   });
    //
    //   io.to(p.user._id).emit("new consumer", {
    //     peer_id: peer.user._id,
    //     producer_id: producer.id,
    //     id: consumer.id,
    //     kind: consumer.kind,
    //     rtp_parameters: consumer.rtpParameters,
    //     type: consumer.type,
    //     app_data: producer.appData,
    //     producer_paused: consumer.producerPaused
    //   });
    //
    //   await consumer.resume();
    // }

    cb({ id: producer.id });
  }
};

export default handler;
