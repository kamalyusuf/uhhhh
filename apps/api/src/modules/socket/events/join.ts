import type { CallbackEvent } from "../types";
import { MediasoupRoom } from "../../../mediasoup/room";

export const handler: CallbackEvent<"join"> = {
  on: "join",
  invoke: async ({ peer, payload, socket, cb }) => {
    // if (peer.active_room_id) throw new Error("already in a room");

    if (peer.active_room_id) {
      const room = MediasoupRoom.findById(peer.active_room_id);

      await room.leave(peer);
    }

    const room = MediasoupRoom.findById(payload.room_id);

    if (room.hasPeer(peer.user._id)) throw new Error("already joined room");

    peer.rtp_capabilities = payload.rtp_capabilities;
    room.join(peer);

    socket.join(room.id);
    peer.active_room_id = room.id;

    const peers = room._peers().filter((p) => p.user._id !== peer.user._id);

    for (const p of peers)
      for (const producer of p.producers.values())
        await room.createConsumer({
          consumer_peer: peer,
          producer_peer: p,
          producer
        });

    socket.to(payload.room_id).emit("new peer", { peer: peer.user });

    cb({ peers: room.users().filter((p) => p._id !== peer.user._id) });
  }
};
