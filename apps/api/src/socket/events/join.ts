import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"join"> = {
  on: "join",
  invoke: async ({ io, peer, payload, socket, cb }) => {
    const room = MediasoupRoom.findById(payload.room_id);
    if (peer.activeRoomId) {
      throw new Error("can't be in multiple rooms at once");
    }

    if (room.hasPeer(peer.user._id)) {
      throw new Error("peer already joined");
    }

    peer.rtpCapabilities = payload.rtp_capabilities;
    room.join(peer);

    socket.join(room.id);
    peer.activeRoomId = room.id;

    const peers = room._peers().filter((p) => p.user._id !== peer.user._id);

    for (const p of peers) {
      for (const producer of p.producers.values()) {
        await room.createConsumer({
          consumer_peer: peer,
          producer_peer: p,
          producer
        });
      }
    }

    socket.to(payload.room_id).emit("new peer", { peer: peer.user });

    cb({ peers: room.users().filter((p) => p._id !== peer.user._id) });
  }
};

export default handler;
